import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { printerService } from '@/Utils/printer';
import { PageProps, Product, Category, Customer, Outlet } from '@/types';
import { useCartStore } from '@/stores/useCartStore';
import { useAppStore } from '@/stores/useAppStore';
import { usePendingTransactions } from '@/stores/usePendingTransactions';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    Smartphone,
    X,
    Check,
    Package,
    LayoutGrid,
    List,
    Tag,
    Percent,
    CheckCircle2,
    Printer,
    Users,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ArrowLeftRight,
    Pause,
    History,
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import ThermalReceipt from '@/Components/ThermalReceipt';
import Drawer from '@/Components/Drawer';
import Modal from '@/Components/Modal';
import NumericInput from '@/Components/NumericInput';
import SwitchUserModal from '@/Components/SwitchUserModal';
import PrinterStatusIndicator from '@/Components/PrinterStatusIndicator';
import NetworkStatusBar from '@/Components/NetworkStatusBar';
import PendingTransactionsModal from '@/Components/PendingTransactionsModal';
import HeldOrdersModal from '@/Components/HeldOrdersModal';
import { useHoldOrderStore, HeldOrder } from '@/stores/useHoldOrderStore';

interface Props extends PageProps {
    products: Product[];
    categories: Category[];
    customers: Customer[];
    taxRate: number;
    taxPerItem: boolean;
    outlets: Outlet[];
    currentOutletId: number | null;
    canSwitchOutlet: boolean;
    users: any[];
    activePromotions?: {
        product: Array<{
            id: number;
            name: string;
            discount_type: 'percentage' | 'fixed';
            discount_value: number;
            max_discount: number | null;
            min_purchase: number | null;
            priority: number;
            items: Array<{
                product_id: number;
                product_variant_id: number | null;
                max_qty: number | null;
                remaining_qty: number | null;
            }>;
        }>;
        global: Array<{
            id: number;
            name: string;
            discount_type: 'percentage' | 'fixed';
            discount_value: number;
            max_discount: number | null;
            min_purchase: number | null;
            priority: number;
        }>;
    };
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};



export default function POS() {
    const { auth, flash, products, categories, customers, taxRate, taxPerItem, outlets, currentOutletId, canSwitchOutlet, users, app_settings, activePromotions } = usePage<Props>().props;
    const cart = useCartStore();
    const { posViewMode, setPosViewMode, confirm: appConfirm, closeDialog } = useAppStore();
    const pendingStore = usePendingTransactions();
    const networkStatus = useNetworkStatus('/api/ping', 30000);
    const [isSyncing, setIsSyncing] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qris' | 'debit'>('cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [posMobileTab, setPosMobileTab] = useState<'products' | 'cart'>('products');
    
    // Smart Scan State
    const [ambiguousProducts, setAmbiguousProducts] = useState<any[]>([]);
    const [showVariantModal, setShowVariantModal] = useState(false);

    
    // Quick Add Customer Form
    const customerForm = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [showHoldModal, setShowHoldModal] = useState(false);
    const [showTaxDetails, setShowTaxDetails] = useState(false);
    const enableShiftManagement = app_settings?.enable_shift_management ?? true;

    // ─── Beforeunload Protection ──────────────────────────────────────
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (cart.items.length > 0 || pendingStore.getPendingCount() > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [cart.items.length, pendingStore.transactions.length]);

    // ─── Network Status Toast Notifications ───────────────────────────
    const prevOnlineRef = useRef(networkStatus.isOnline);
    useEffect(() => {
        if (prevOnlineRef.current !== networkStatus.isOnline) {
            if (networkStatus.isOnline) {
                toast.success('Koneksi pulih kembali', {
                    description: pendingStore.getPendingCount() > 0
                        ? `${pendingStore.getPendingCount()} transaksi menunggu sinkronisasi`
                        : undefined,
                    duration: 4000,
                });
            } else {
                toast.error('Koneksi terputus', {
                    description: 'Transaksi akan diantrekan secara lokal jika checkout gagal',
                    duration: 6000,
                });
            }
            prevOnlineRef.current = networkStatus.isOnline;
        }
    }, [networkStatus.isOnline]);

    // ─── Auto-sync pending transactions when back online ──────────────
    useEffect(() => {
        if (networkStatus.isOnline && pendingStore.getPendingCount() > 0 && !isSyncing) {
            handleSyncPending();
        }
    }, [networkStatus.isOnline]);

    const openCustomerModal = () => {
        customerForm.reset();
        customerForm.clearErrors();
        setShowCustomerModal(true);
    };

    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        customerForm.post(route('customers.store'), {
            onSuccess: (page) => {
                setShowCustomerModal(false);
                customerForm.reset();
                // Find the newest customer to auto-select
                const updatedCustomers = page.props.customers as Customer[];
                if (updatedCustomers && updatedCustomers.length > 0) {
                    const newest = [...updatedCustomers].sort((a, b) => b.id - a.id)[0];
                    if (newest) setSelectedCustomer(newest.id);
                }
            },
        });
    };
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [completedSale, setCompletedSale] = useState<any>(null);
    
    // Discount State
    const [globalDiscount, setGlobalDiscount] = useState('0');
    const [globalDiscountMode, setGlobalDiscountMode] = useState<'nominal' | 'percent'>('nominal');
    const [editingDiscountId, setEditingDiscountId] = useState<number | string | null>(null);
    const [discountMode, setDiscountMode] = useState<'nominal' | 'percent'>('nominal');
    const [discountValue, setDiscountValue] = useState('');

    const searchRef = useRef<HTMLInputElement>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = () => {
        if (categoryScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [categories]);

    const scrollCategories = (direction: 'left' | 'right') => {
        if (categoryScrollRef.current) {
            const scrollAmount = 200;
            categoryScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 300); // Check after animation
        }
    };

    // Auto-print effect
    useEffect(() => {
        if (completedSale) {
            const timer = setTimeout(() => {
                printerService.print(app_settings as any, completedSale, 'sale');
            }, 1000); // Increased delay for stability
            return () => clearTimeout(timer);
        }
    }, [completedSale, app_settings]);

    useEffect(() => {
        searchRef.current?.focus();
    }, []);


    // ─── Promo Helpers ─────────────────────────────────────────────────
    const getProductPromo = (productId: number, variantId: number | null) => {
        if (!activePromotions?.product) return null;
        for (const promo of activePromotions.product) {
            const match = promo.items.find(i =>
                i.product_id === productId &&
                (i.product_variant_id === variantId || i.product_variant_id === null)
            );
            if (match) {
                if (match.remaining_qty !== null && match.remaining_qty <= 0) continue;
                return { ...promo, matchedItem: match };
            }
        }
        return null;
    };

    const getPromoLabel = (promo: any) => {
        if (promo.discount_type === 'percentage') return `-${promo.discount_value}%`;
        return `-${formatCurrency(promo.discount_value)}`;
    };

    const calcPromoPrice = (price: number, promo: any) => {
        if (promo.discount_type === 'percentage') {
            let disc = (price * promo.discount_value) / 100;
            if (promo.max_discount && disc > promo.max_discount) disc = promo.max_discount;
            return Math.max(0, price - disc);
        }
        return Math.max(0, price - promo.discount_value);
    };

    const bestGlobalPromo = useMemo(() => {
        if (!activePromotions?.global?.length) return null;
        const sub = cart.getSubtotal();
        let best: any = null;
        let bestDisc = 0;
        for (const promo of activePromotions.global) {
            if (promo.min_purchase && sub < promo.min_purchase) continue;
            let disc = promo.discount_type === 'percentage'
                ? Math.min((sub * promo.discount_value) / 100, promo.max_discount || Infinity)
                : promo.discount_value;
            disc = Math.min(disc, sub);
            if (disc > bestDisc) { bestDisc = disc; best = { ...promo, calculatedDiscount: disc }; }
        }
        return best;
    }, [activePromotions?.global, cart.items]);

    const nearestGlobalPromo = useMemo(() => {
        if (!activePromotions?.global?.length || bestGlobalPromo) return null;
        const sub = cart.getSubtotal();
        return activePromotions.global.find(p => p.min_purchase && sub < p.min_purchase) || null;
    }, [activePromotions?.global, cart.items, bestGlobalPromo]);

    const handleApplyItemDiscount = (productId: number | string) => {
        const item = cart.items.find(i => i.product.id === productId);
        if (!item) return;

        let nominal = 0;
        const val = Number(discountValue);
        
        if (discountMode === 'percent') {
            nominal = (item.product.price * item.qty * val) / 100;
        } else {
            nominal = val;
        }

        // Validate: cannot exceed item total price
        const maxDiscount = item.product.price * item.qty;
        if (nominal > maxDiscount) nominal = maxDiscount;

        cart.updateDiscount(productId, nominal);
        setEditingDiscountId(null);
        setDiscountValue('');
    };

    // ─── Promo & Totals Calculation ───────────────────────────────────
    const itemLevelPromoDiscount = useMemo(() => {
        let totalPromo = 0;
        cart.items.forEach(item => {
            const p = item.product as any;
            const pid = typeof p.id === 'string' && p.id.startsWith('v_') ? p.real_product_id : p.id;
            const vid = p.is_variant ? p.variant_id : null;
            const promo = getProductPromo(pid as number, vid);
            
            if (promo) {
                // Check min purchase for product promo if exists
                if (promo.min_purchase && cart.getSubtotal() < promo.min_purchase) return;
                
                let promoNominal = 0;
                const basePrice = Number(item.product.price);
                const qty = item.qty;
                const targetQty = promo.matchedItem.max_qty ? Math.min(qty, promo.matchedItem.max_qty) : qty;

                if (promo.discount_type === 'percentage') {
                    promoNominal = (basePrice * targetQty * promo.discount_value) / 100;
                    if (promo.max_discount && promoNominal > promo.max_discount) promoNominal = promo.max_discount;
                } else {
                    promoNominal = promo.discount_value * targetQty;
                }

                // Non-stackable: Only use promo if better than manual discount
                if (promoNominal > item.discount) {
                    totalPromo += (promoNominal - item.discount);
                }
            }
        });
        return totalPromo;
    }, [cart.items, activePromotions, cart.getSubtotal()]);

    const subtotalBeforeGlobal = cart.getSubtotal() - itemLevelPromoDiscount;

    const autoGlobalDiscount = useMemo(() => {
        if (!bestGlobalPromo) return 0;
        return bestGlobalPromo.calculatedDiscount;
    }, [bestGlobalPromo]);

    const totalGlobalDiscount = globalDiscountMode === 'percent' 
        ? (subtotalBeforeGlobal * Number(globalDiscount)) / 100 
        : Number(globalDiscount);
    
    // Final discounts to apply
    const finalGlobalDiscount = Math.max(autoGlobalDiscount, totalGlobalDiscount);
    
    // Tax Calculation
    const taxAmount = taxPerItem 
        ? (subtotalBeforeGlobal * taxRate) / (100 + taxRate) 
        : (subtotalBeforeGlobal * taxRate) / 100;

    const total = taxPerItem
        ? Math.max(0, subtotalBeforeGlobal - finalGlobalDiscount)
        : Math.max(0, (subtotalBeforeGlobal + taxAmount) - finalGlobalDiscount);

    const subtotal = cart.getSubtotal(); // For reference in UI
    const displaySubtotal = taxPerItem ? subtotalBeforeGlobal - taxAmount : subtotalBeforeGlobal;
    const change = Number(paidAmount) - total;

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent shortcuts if typing in input/textarea
            const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
            
            if (e.key === 'F2') {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === 'F4') {
                e.preventDefault();
                setShowTaxDetails(prev => !prev);
            }
            if (e.key === 'F5') { // Shortcut to clear cart
                e.preventDefault();
                appConfirm({
                    title: 'Kosongkan Keranjang',
                    message: 'Apakah Anda yakin ingin menghapus semua item di keranjang?',
                    confirmLabel: 'Ya, Kosongkan',
                    type: 'danger',
                    onConfirm: () => {
                        cart.clearCart();
                        toast.success('Keranjang dikosongkan');
                    }
                });
            }
            if (e.key === 'F8') {
                e.preventDefault();
                openCustomerModal();
            }
            if (e.key === 'F9' && cart.items.length > 0) {
                e.preventDefault();
                setShowCheckout(true);
            }

            // Cart Navigation (Only if not typing)
            if (!isTyping && cart.items.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = cart.selectedIndex === null || cart.selectedIndex >= cart.items.length - 1 ? 0 : cart.selectedIndex + 1;
                    cart.setSelectedIndex(next);
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = cart.selectedIndex === null || cart.selectedIndex <= 0 ? cart.items.length - 1 : cart.selectedIndex - 1;
                    cart.setSelectedIndex(prev);
                }

                // Manipulation for selected item
                if (cart.selectedIndex !== null) {
                    const selectedItem = cart.items[cart.selectedIndex];
                    if (e.key === '+' || e.key === '=') {
                        e.preventDefault();
                        cart.updateQuantity(selectedItem.product.id, selectedItem.qty + 1);
                    }
                    if (e.key === '-' || e.key === '_') {
                        e.preventDefault();
                        cart.updateQuantity(selectedItem.product.id, selectedItem.qty - 1);
                    }
                    if (e.key === 'Delete') {
                        e.preventDefault();
                        cart.removeItem(selectedItem.product.id);
                    }
                }
            }
            
            // Payment Method Selection (Active only when checkout drawer is open)
            if (showCheckout && !isTyping) {
                if (e.key === '1') setPaymentMethod('cash');
                if (e.key === '2') setPaymentMethod('transfer');
                if (e.key === '3') setPaymentMethod('qris');
                if (e.key === '4') setPaymentMethod('debit');
                if (e.key === 'Enter' && Number(paidAmount) >= total) {
                    e.preventDefault();
                    handleCheckout();
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowCheckout(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart.items, cart.selectedIndex, showCheckout, paidAmount, total]);

    // Success Modal Shortcuts
    useEffect(() => {
        if (!completedSale) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'p') {
                e.preventDefault();
                printerService.print(app_settings as any, completedSale, 'sale');
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                setCompletedSale(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [completedSale]);

    const flattenedProducts = useMemo(() => {
        const flat: any[] = [];
        products.forEach(p => {
            if (p.has_variants && p.variants && p.variants.length > 0) {
                p.variants.forEach((v: any) => {
                    flat.push({
                        ...p,
                        id: `v_${v.id}`,
                        real_product_id: p.id,
                        variant_id: v.id,
                        name: `${p.name} - ${v.name}`,
                        sku: v.sku,
                        barcode: v.barcode || p.barcode,
                        price: v.price || p.price,
                        stock: v.stock,
                        image: v.image || p.image,
                        is_variant: true
                    });
                });
            } else {
                flat.push({
                    ...p,
                    real_product_id: p.id,
                    is_variant: false
                });
            }
        });
        return flat;
    }, [products]);



    const filteredProducts = flattenedProducts.filter((p) => {
        const matchSearch = !search || 
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()) ||
            (p.barcode && p.barcode === search);
        const matchCategory = !selectedCategory || p.category_id === selectedCategory;
        return matchSearch && matchCategory;
    });

    // Smart Scan / Auto-add logic
    useEffect(() => {
        if (!search || search.length < 3) return;

        // Check for exact barcode match
        const matches = flattenedProducts.filter(
            (p) => p.barcode && p.barcode === search
        );

        if (matches.length === 1) {
            const product = matches[0];
            if (product.stock > 0) {
                cart.addItem(product);
                toast.success(`${product.name} ditambahkan`, {
                    description: `SKU: ${product.sku}`,
                    duration: 2000,
                });
                setSearch('');
            } else {
                toast.error(`Stok ${product.name} habis`, {
                    description: 'Silakan cek ketersediaan barang.',
                });
                setSearch('');
            }
        } else if (matches.length > 1) {
            // Ambiguous match - show selection modal
            setAmbiguousProducts(matches);
            setShowVariantModal(true);
            setSearch('');
        }
    }, [search, flattenedProducts]);

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If there's only one product in the filtered list, add it
            if (filteredProducts.length === 1) {
                if (filteredProducts[0].stock > 0) {
                    cart.addItem(filteredProducts[0]);
                    setSearch('');
                } else {
                    toast.error('Stok produk habis');
                }
            } else if (filteredProducts.length === 0) {
                toast.error('Produk tidak ditemukan', {
                    description: `Barcode/Pencarian: ${search}`,
                });
            }
        }
        if (e.key === 'Escape') {
            setSearch('');
        }
    };

    // Moving calculations up to fix TS error
    
    const quickAmounts = useMemo(() => {
        const t = Math.ceil(total);
        if (t <= 0) return [10000, 20000, 50000, 100000];
        
        const suggestions = new Set<number>();
        suggestions.add(t); // Pas
        
        const roundings = [2000, 5000, 10000, 20000, 50000, 100000];
        roundings.forEach(r => {
            const val = Math.ceil(t / r) * r;
            if (val > t) suggestions.add(val);
        });

        return Array.from(suggestions).sort((a, b) => a - b).slice(0, 4);
    }, [total]);

    // ─── Build checkout payload (reusable) ──────────────────────────
    const buildCheckoutPayload = useCallback(() => {
        return {
            items: cart.items.map((item: any) => ({
                product_id: item.product.real_product_id,
                product_variant_id: item.product.variant_id || null,
                qty: item.qty,
                discount: item.discount,
            })),
            tax: taxAmount,
            discount: totalGlobalDiscount,
            paid: Number(paidAmount),
            payment_method: paymentMethod,
            customer_id: selectedCustomer,
            notes: notes,
        };
    }, [cart.items, taxAmount, totalGlobalDiscount, paidAmount, paymentMethod, selectedCustomer, notes]);

    // ─── Build local sale snapshot for pending queue ───────────────
    const buildLocalSaleData = useCallback(() => {
        const customerObj = customers.find(c => c.id === Number(selectedCustomer));
        return {
            invoice_number: 'PENDING',
            customer: customerObj || null,
            items: cart.items.map(i => ({
                product_name: i.product?.name || 'Produk',
                price: Number(i.product?.price || 0),
                qty: Number(i.qty || 0),
                subtotal: Number(i.product?.price || 0) * Number(i.qty || 0) - Number(i.discount || 0),
                discount: Number(i.discount || 0)
            })),
            subtotal: Number(subtotal),
            discount: Number(totalGlobalDiscount),
            tax: Number(taxAmount),
            total: Number(total),
            paid: Number(paidAmount || 0),
            change: Number(change || 0),
            payment_method: paymentMethod,
            created_at: new Date().toISOString(),
            outlet: (auth as any)?.user?.outlet || null,
            is_offline: true
        };
    }, [cart.items, customers, selectedCustomer, subtotal, totalGlobalDiscount, taxAmount, total, paidAmount, change, paymentMethod, auth]);

    // ─── Checkout with auto-retry + pending queue fallback ─────────
    const handleCheckout = async () => {
        if (cart.items.length === 0) return;
        if (Number(paidAmount) < total) return;

        setProcessing(true);
        const payload = buildCheckoutPayload();
        const localSaleData = buildLocalSaleData();

        // If clearly offline, queue immediately
        if (!networkStatus.isOnline) {
            pendingStore.addTransaction(payload, localSaleData);
            setCompletedSale(localSaleData); // Show success/print receipt even offline
            toast.warning('Offline: Transaksi disimpan ke antrian', {
                description: 'Akan disinkronkan otomatis saat koneksi pulih.',
                duration: 5000,
            });
            resetAfterCheckout();
            return;
        }

        // Try checkout with auto-retry (max 3 attempts)
        let lastError = '';
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const response = await fetch('/api/pos/offline-sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setCompletedSale(result.sale || localSaleData);
                        resetAfterCheckout();
                        // Refresh page data silently to update stock
                        router.reload({ only: ['products', 'activePromotions'] });
                        return;
                    } else {
                        lastError = result.error || 'Terjadi kesalahan pada server.';
                        toast.error('Checkout gagal', { description: lastError });
                        setProcessing(false);
                        return; // Server validation error — don't retry
                    }
                } else if (response.status === 422) {
                    // Validation error from server — don't retry
                    const errorData = await response.json();
                    lastError = errorData.error || errorData.message || 'Validasi gagal.';
                    toast.error('Checkout gagal', { description: lastError });
                    setProcessing(false);
                    return;
                } else {
                    lastError = `Server error (${response.status})`;
                    throw new Error(lastError);
                }
            } catch (err: any) {
                lastError = err?.message || 'Network error';
                if (attempt < 3) {
                    // Exponential backoff: 1s, 2s
                    const delay = attempt * 1000;
                    toast.loading(`Retry checkout... (${attempt}/3)`, { duration: delay });
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // All retries failed — save to pending queue
        pendingStore.addTransaction(payload, localSaleData);
        setCompletedSale(localSaleData);
        toast.warning('Checkout gagal (Network Error)', {
            description: 'Transaksi disimpan ke antrian offline. Akan otomatis disinkronkan saat koneksi pulih.',
            duration: 8000,
        });
        resetAfterCheckout();
    };

    // ─── Reset state after checkout ────────────────────────────────
    const resetAfterCheckout = () => {
        cart.clearCart();
        setSearch('');
        setSelectedCategory(null);
        setShowCheckout(false);
        setPaidAmount('');
        setNotes('');
        setGlobalDiscount('0');
        setSelectedCustomer(null);
        setProcessing(false);
    };

    // ─── Sync pending transactions ─────────────────────────────────
    const handleSyncPending = useCallback(async () => {
        const pending = pendingStore.transactions.filter(
            t => t.status === 'pending' || t.status === 'failed'
        );
        if (pending.length === 0 || isSyncing) return;

        setIsSyncing(true);
        let syncedCount = 0;
        let failedCount = 0;

        for (const txn of pending) {
            pendingStore.updateStatus(txn.id, 'syncing');
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const response = await fetch('/api/pos/offline-sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    body: JSON.stringify({ ...txn.payload, pending_id: txn.id }),
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        pendingStore.updateStatus(txn.id, 'synced');
                        syncedCount++;
                    } else {
                        pendingStore.updateStatus(txn.id, 'failed', result.error);
                        pendingStore.incrementRetry(txn.id);
                        failedCount++;
                    }
                } else {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    pendingStore.updateStatus(txn.id, 'failed', errorData.error);
                    pendingStore.incrementRetry(txn.id);
                    failedCount++;
                }
            } catch (err: any) {
                pendingStore.updateStatus(txn.id, 'failed', err?.message || 'Network error');
                pendingStore.incrementRetry(txn.id);
                failedCount++;
            }
        }

        // Clean up synced transactions
        pendingStore.clearSynced();
        setIsSyncing(false);

        if (syncedCount > 0) {
            toast.success(`${syncedCount} transaksi berhasil disinkronkan`);
            router.reload({ only: ['products', 'activePromotions'] });
        }
        if (failedCount > 0) {
            toast.error(`${failedCount} transaksi gagal disinkronkan`, {
                description: 'Akan dicoba lagi secara otomatis.',
            });
        }
    }, [pendingStore, isSyncing]);




    return (
        <AuthenticatedLayout>
            <Head title="POS - Kasir" />

            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100dvh-8.5rem)] lg:h-[calc(100vh-7rem)]">
                {/* Left: Product Grid */}
                <div className={`flex-1 min-w-0 ${posMobileTab === 'products' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
                    <div className="space-y-3 mb-4">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="Cari produk atau scan barcode... (F2)"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
                                        title="Clear search (Esc)"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            
                            {/* Outlet Selector for Admins/Owners */}
                            {canSwitchOutlet && outlets.length > 0 && (
                                <div className="w-56 flex-shrink-0">
                                    <select
                                        value={currentOutletId || ''}
                                        onChange={(e) => router.post(route('pos.set-outlet'), { outlet_id: e.target.value })}
                                        className="w-full pl-3 pr-8 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236366f1%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                                    >
                                        {outlets.map(o => (
                                            <option key={o.id} value={o.id}>{o.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex-shrink-0 flex items-center gap-2">
                                <NetworkStatusBar 
                                    isOnline={networkStatus.isOnline} 
                                    wasOffline={networkStatus.wasOffline}
                                    pendingCount={pendingStore.getPendingCount()}
                                    onSyncPending={() => setShowPendingModal(true)}
                                    isSyncing={isSyncing}
                                />
                                <PrinterStatusIndicator settings={app_settings as any} />

                                {/* Ganti Shift Button (Only when shift management is disabled) */}
                                {!enableShiftManagement && (
                                    <button
                                        onClick={() => setShowSwitchUserModal(true)}
                                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                        title="Ganti Kasir"
                                    >
                                        <ArrowLeftRight className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Held Orders Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowHoldModal(true)}
                                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                                        title="Daftar Pesanan Tertahan"
                                    >
                                        <History className="w-5 h-5" />
                                    </button>
                                    {useHoldOrderStore.getState().heldOrders.length > 0 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-gray-950 pointer-events-none">
                                            {useHoldOrderStore.getState().heldOrders.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1 min-w-0 group">
                                {showLeftArrow && (
                                    <button
                                        onClick={() => scrollCategories('left')}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-full shadow-md text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-all active:scale-95"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                )}
                                
                                <div 
                                    ref={categoryScrollRef}
                                    onScroll={checkScroll}
                                    className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide scroll-smooth"
                                >
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border
                                            ${!selectedCategory ? 'bg-indigo-500 text-white border-indigo-600 shadow-sm shadow-indigo-500/20' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                                    >
                                        SEMUA
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border
                                                ${selectedCategory === cat.id ? 'bg-indigo-500 text-white border-indigo-600 shadow-sm shadow-indigo-500/20' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {cat.name.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                {showRightArrow && (
                                    <button
                                        onClick={() => scrollCategories('right')}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-full shadow-md text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-all active:scale-95"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPosViewMode('grid')}
                                    className={`p-1 rounded transition-colors ${posViewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20' : 'text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setPosViewMode('table')}
                                    className={`p-1 rounded transition-colors ${posViewMode === 'table' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20' : 'text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <List className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1">
                        {posViewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
                                {filteredProducts.map((product) => {
                                    const inCart = cart.items.find((i) => i.product.id === product.id);
                                    const pid = typeof product.id === 'string' && product.id.startsWith('v_') ? product.real_product_id : product.id;
                                    const vid = product.is_variant ? product.variant_id : null;
                                    const promo = getProductPromo(pid as number, vid);
                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => cart.addItem(product)}
                                            disabled={product.stock <= 0}
                                            className={`relative text-left p-2.5 rounded-lg border transition-all duration-200 group
                                                ${inCart
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500'
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-300'
                                                }
                                                ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {inCart && (
                                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-black shadow-lg z-10 ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
                                                    {inCart.qty}
                                                </div>
                                            )}
                                            {promo && (
                                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 shadow-sm border border-rose-100 dark:border-rose-900/30 rounded-tl-lg rounded-br-lg px-2 py-0.5 z-10 flex items-center gap-1">
                                                    <Tag className="w-2.5 h-2.5 text-rose-500" />
                                                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">
                                                        {promo.name} {getPromoLabel(promo)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`w-full aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm group-hover:shadow-md ${inCart ? 'border-transparent' : 'group-hover:border-indigo-200 dark:group-hover:border-indigo-500/50'}`}>
                                                {product.image ? (
                                                    <img src={`/storage/${product.image}`} className="w-full h-full object-cover" alt="" loading="lazy" />
                                                ) : (
                                                    <Package className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight tracking-tight">{product.name}</p>
                                            <div className="flex flex-col mt-1.5">
                                                {(() => {
                                                    if (promo) {
                                                        const promoPrice = calcPromoPrice(Number(product.price), promo);
                                                        return (
                                                            <>
                                                                <div className="flex items-center gap-1.5">
                                                                    <p className="text-sm font-bold text-rose-500">{formatCurrency(promoPrice)}</p>
                                                                    <span className="text-[9px] line-through text-gray-400">{formatCurrency(Number(product.price))}</span>
                                                                </div>
                                                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mt-0.5 rounded bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-tight w-fit">
                                                                    <Tag className="w-2.5 h-2.5" />{getPromoLabel(promo)}
                                                                </span>
                                                                {promo.matchedItem.remaining_qty !== null && (
                                                                    <span className="text-[9px] text-amber-500 font-bold">Sisa {promo.matchedItem.remaining_qty} unit</span>
                                                                )}
                                                            </>
                                                        );
                                                    }
                                                    return <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(Number(product.price))}</p>;
                                                })()}
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                                                        STOK: {product.stock}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate max-w-[50px]">
                                                        {product.sku}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                                <table className="w-full text-[12px] text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-5 py-3.5">SKU</th>
                                            <th className="px-5 py-3.5">Nama Produk</th>
                                            <th className="px-5 py-3.5 text-right">Harga</th>
                                            <th className="px-5 py-3.5 text-center">Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {filteredProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                onClick={() => { if (product.stock > 0) cart.addItem(product) }}
                                                className={`hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors cursor-pointer even:bg-slate-50/30 dark:even:bg-slate-800/10 ${product.stock <= 0 ? 'opacity-50' : ''}`}
                                            >
                                                <td className="px-5 py-3.5 text-[11px] font-bold text-slate-400 tracking-tighter">{product.sku}</td>
                                                <td className="px-5 py-3.5 text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{product.name}</td>
                                                <td className="px-5 py-3.5 text-right">
                                                    {(() => {
                                                        const pid = product.is_variant ? product.real_product_id : product.id;
                                                        const vid = product.is_variant ? product.variant_id : null;
                                                        const promo = getProductPromo(pid, vid);
                                                        if (promo) {
                                                            const pp = calcPromoPrice(Number(product.price), promo);
                                                            return (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="font-black text-rose-500 text-[13px]">{formatCurrency(pp)}</span>
                                                                    <span className="text-[10px] line-through text-gray-400">{formatCurrency(Number(product.price))}</span>
                                                                </div>
                                                            );
                                                        }
                                                        return <span className="font-black text-indigo-600 dark:text-indigo-400 text-[13px]">{formatCurrency(Number(product.price))}</span>;
                                                    })()}
                                                </td>
                                                <td className="px-5 py-3.5 text-center font-bold text-slate-600 dark:text-slate-400">
                                                    <span className={`px-2 py-1 rounded-md ${product.stock < 10 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : ''}`}>{product.stock}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Cart */}
                <div className={`w-full lg:w-72 xl:w-80 h-full flex-shrink-0 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl ${posMobileTab === 'cart' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
                    <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-indigo-500" />
                            <h3 className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Keranjang</h3>
                        </div>
                        <button 
                            onClick={() => appConfirm({
                                title: 'Kosongkan Keranjang',
                                message: 'Apakah Anda yakin ingin menghapus semua item di keranjang?',
                                confirmLabel: 'Ya, Kosongkan',
                                type: 'danger',
                                onConfirm: () => {
                                    cart.clearCart();
                                    toast.success('Keranjang dikosongkan');
                                }
                            })} 
                            className="text-[10px] text-gray-400 hover:text-red-500 transition-colors font-semibold uppercase tracking-tight"
                        >
                            Hapus [F5]
                        </button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
                        {cart.items.length > 0 ? (
                            cart.items.map((item, idx) => {
                                const p = item.product as any;
                                const pid = typeof p.id === 'string' && p.id.startsWith('v_') ? p.real_product_id : p.id;
                                const vid = p.is_variant ? p.variant_id : null;
                                const promo = getProductPromo(pid as number, vid);
                                const promoDiscountNominal = promo && (!promo.min_purchase || subtotal >= promo.min_purchase) 
                                    ? (Number(item.product.price) - calcPromoPrice(Number(item.product.price), promo)) * item.qty 
                                    : 0;

                                return (
                                <div 
                                    key={item.product.id} 
                                    onClick={() => cart.setSelectedIndex(idx)}
                                    className={`p-2.5 rounded-md border transition-all duration-200 space-y-2.5 cursor-pointer relative
                                        ${cart.selectedIndex === idx 
                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                                            : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}
                                >
                                    {cart.selectedIndex === idx && (
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full" />
                                    )}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate tracking-tight">{item.product.name}</p>
                                            <p className="text-[11px] text-gray-500 font-medium">{formatCurrency(item.product.price)} / pc</p>
                                        </div>
                                        <button onClick={() => cart.removeItem(item.product.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => cart.updateQuantity(item.product.id, item.qty - 1)} className="w-5 h-5 rounded bg-white dark:bg-gray-900 border dark:border-gray-800 flex items-center justify-center text-gray-500"><Minus className="w-2.5 h-2.5" /></button>
                                            <NumericInput 
                                                value={item.qty} 
                                                onChange={(val) => cart.updateQuantity(item.product.id, parseInt(val) || 1)}
                                                className="w-8 text-center bg-transparent border-none text-[13px] font-semibold focus:ring-0 p-0" 
                                            />
                                            <button onClick={() => cart.updateQuantity(item.product.id, item.qty + 1)} className="w-5 h-5 rounded bg-white dark:bg-gray-900 border dark:border-gray-800 flex items-center justify-center text-gray-500"><Plus className="w-2.5 h-2.5" /></button>
                                        </div>
                                        
                                        <div className="flex flex-col items-end">
                                            {promo && (
                                                <span className="text-[9px] text-rose-500 font-bold flex items-center gap-0.5 uppercase mb-0.5 tracking-tight"><Tag className="w-2.5 h-2.5" />{promo.name}</span>
                                            )}
                                            {item.discount > 0 ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-gray-400 line-through">
                                                        {formatCurrency(Number(item.product.price) * item.qty)}
                                                    </span>
                                                    <span className="text-sm font-black text-gray-900 dark:text-white leading-none mt-0.5">
                                                        {formatCurrency((Number(item.product.price) * item.qty) - item.discount)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-end">
                                                    {promoDiscountNominal > 0 && (
                                                        <span className="text-[10px] text-rose-400 line-through">
                                                            {formatCurrency(Number(item.product.price) * item.qty)}
                                                        </span>
                                                    )}
                                                    <span className="text-sm font-black text-gray-900 dark:text-white leading-none mt-0.5">
                                                        {formatCurrency((Number(item.product.price) * item.qty) - promoDiscountNominal)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Discount Trigger & Action */}
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        {editingDiscountId === item.product.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex rounded overflow-hidden border border-gray-200 dark:border-gray-700 h-7">
                                                    <button 
                                                        onClick={() => setDiscountMode('nominal')}
                                                        className={`px-1.5 flex items-center ${discountMode === 'nominal' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-400'}`}
                                                    >
                                                        <span className="text-[9px] font-black">Rp</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setDiscountMode('percent')}
                                                        className={`px-1.5 flex items-center ${discountMode === 'percent' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-400'}`}
                                                    >
                                                        <Percent className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                                <NumericInput 
                                                    value={discountValue}
                                                    onChange={(val) => setDiscountValue(val)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyItemDiscount(item.product.id)}
                                                    autoFocus
                                                    placeholder="0"
                                                    className="flex-1 h-7 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-[10px] focus:ring-indigo-500 p-1"
                                                />
                                                <button onClick={() => handleApplyItemDiscount(item.product.id)} className="p-1 bg-indigo-500 text-white rounded"><Check className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => setEditingDiscountId(null)} className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded"><X className="w-3.5 h-3.5" /></button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setEditingDiscountId(item.product.id);
                                                    setDiscountValue(item.discount > 0 ? item.discount.toString() : '');
                                                    setDiscountMode('nominal');
                                                }}
                                                className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors uppercase"
                                            >
                                                <Tag className="w-3 h-3" />
                                                {item.discount > 0 ? 'Edit Diskon' : 'Tambah Diskon'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )})
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-16">
                                <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm">Keranjang kosong</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 space-y-2">
                        <div className="space-y-1">
                            {showTaxDetails && (
                                <>
                                    <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase animate-in fade-in slide-in-from-top-1 duration-200">
                                        <span>DPP {taxPerItem ? '(Dasar Pajak)' : ''}</span>
                                        <span>{formatCurrency(displaySubtotal)}</span>
                                    </div>
                                    {taxRate > 0 && (
                                        <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase animate-in fade-in slide-in-from-top-1 duration-200">
                                            <span>PPN ({taxRate}%)</span>
                                            <span>{formatCurrency(taxAmount)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* Promo Discount Summary */}
                            {(itemLevelPromoDiscount > 0 || finalGlobalDiscount > 0) && (
                                <div className="flex justify-between items-center text-[10px] pb-1 border-b border-dashed border-gray-200 dark:border-gray-800 mb-2">
                                    <span className="font-bold text-rose-500 uppercase tracking-widest">Diskon Promo</span>
                                    <span className="font-black text-rose-600 dark:text-rose-400">- {formatCurrency(itemLevelPromoDiscount + finalGlobalDiscount)}</span>
                                </div>
                            )}
                            {/* Global Promo Banner */}
                            {bestGlobalPromo && (
                                <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg px-2.5 py-1.5">
                                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />🎉 {bestGlobalPromo.name}</span>
                                    <span>-{formatCurrency(bestGlobalPromo.calculatedDiscount)}</span>
                                </div>
                            )}
                            {!bestGlobalPromo && nearestGlobalPromo && (
                                <div className="text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10 rounded-lg px-2.5 py-1.5">
                                    💡 Belanja {formatCurrency(nearestGlobalPromo.min_purchase! - subtotal)} lagi untuk promo "{nearestGlobalPromo.name}"
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-t-2 border-dashed border-gray-200 dark:border-gray-800 pt-2 mt-2">
                                <button 
                                    onClick={() => setShowTaxDetails(!showTaxDetails)}
                                    className="flex flex-col items-start hover:text-indigo-600 transition-colors group"
                                    title="Toggle Pajak (F4)"
                                >
                                    <span>TOTAL</span>
                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5 group-hover:text-indigo-400">{showTaxDetails ? 'Sembunyikan Pajak' : 'Tampilkan Pajak'} [F4]</span>
                                </button>
                                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (cart.items.length === 0) return;
                                    const customerObj = customers.find(c => c.id === Number(selectedCustomer));
                                    useHoldOrderStore.getState().holdOrder({
                                        customer_id: selectedCustomer,
                                        customer_name: customerObj?.name || 'Guest / Umum',
                                        items: cart.items,
                                        subtotal: cart.getSubtotal(),
                                        notes: notes,
                                    });
                                    cart.clearCart();
                                    setSelectedCustomer(null);
                                    setNotes('');
                                    toast.success('Pesanan ditahan');
                                }}
                                disabled={cart.items.length === 0}
                                className="flex-1 py-4 rounded-xl bg-amber-500 text-white font-black text-xs hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest border-b-4 border-amber-700"
                                title="Tahan Pesanan"
                            >
                                <Pause className="w-4 h-4 fill-current" /> TAHAN
                            </button>
                            <button
                                onClick={() => setShowCheckout(true)}
                                disabled={cart.items.length === 0}
                                className="flex-[2] py-4 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest border-b-4 border-indigo-800"
                            >
                                <CreditCard className="w-5 h-5" /> BAYAR [F9]
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 bg-opacity-90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 flex items-center h-16 z-40 px-3 gap-3">
                <button
                    onClick={() => setPosMobileTab('products')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all
                        ${posMobileTab === 'products' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                    <Package className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Katalog</span>
                </button>
                <button
                    onClick={() => setPosMobileTab('cart')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all relative
                        ${posMobileTab === 'cart' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Keranjang</span>
                    {cart.items.length > 0 && (
                        <div className="absolute top-1 right-1/3 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-black ring-2 ring-white dark:ring-gray-900">
                            {cart.items.length}
                        </div>
                    )}
                </button>
            </div>

            {/* Checkout Drawer instead of Modal */}
            <Drawer 
                show={showCheckout} 
                onClose={() => setShowCheckout(false)} 
                title="Selesaikan Transaksi"
                width="max-w-xl"
            >
                <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
                    {/* Summary Header */}
                    <div className="p-4 bg-slate-900 text-white border-b border-slate-800">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">Total Bayar</p>
                                <h4 className="text-3xl font-bold tracking-tight">{formatCurrency(Number(total))}</h4>
                            </div>
                            <div className="text-right">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between gap-6 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                        <span>Subtotal (DPP)</span>
                                        <span className="text-white text-xs">{formatCurrency(Number(displaySubtotal))}</span>
                                    </div>
                                    {(Number(totalGlobalDiscount) > 0 || itemLevelPromoDiscount > 0) && (
                                        <div className="flex justify-between gap-6 text-[11px] text-red-400 font-semibold uppercase tracking-wider">
                                            <span>Diskon Promo</span>
                                            <span className="text-red-300 text-xs">-{formatCurrency(Number(totalGlobalDiscount) + itemLevelPromoDiscount)}</span>
                                        </div>
                                    )}
                                    {Number(taxAmount) > 0 && (
                                        <div className="flex justify-between gap-6 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                            <span>Pajak ({taxRate}%)</span>
                                            <span className="text-white text-xs">{formatCurrency(Number(taxAmount))}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {Number(paidAmount) >= Number(total) && (
                            <div className="mt-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 animate-fade-in flex justify-between items-center">
                                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider leading-none">Kembalian</p>
                                <p className="text-2xl font-bold text-indigo-400 leading-none">{formatCurrency(Number(change))}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {/* Payment Method Section */}
                        <section className="bg-white dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Metode Pembayaran</label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[
                                    { id: 'cash', label: 'TUNAI', icon: Banknote, activeColors: 'bg-emerald-500 border-emerald-500 shadow-emerald-500/20' },
                                    { id: 'transfer', label: 'TF BANK', icon: CreditCard, activeColors: 'bg-blue-500 border-blue-500 shadow-blue-500/20' },
                                    { id: 'qris', label: 'QRIS', icon: Smartphone, activeColors: 'bg-violet-500 border-violet-500 shadow-violet-500/20' },
                                    { id: 'debit', label: 'DEBIT', icon: CreditCard, activeColors: 'bg-sky-500 border-sky-500 shadow-sky-500/20' },
                                ].map((m, idx) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id as any)}
                                        className={`relative py-2 px-2 rounded-xl border-[1.5px] transition-all flex flex-row items-center justify-center gap-1.5 overflow-hidden group
                                            ${paymentMethod === m.id 
                                                ? `${m.activeColors} text-white scale-[1.02] shadow-lg` 
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}
                                        `}
                                    >
                                        <div className={`absolute top-0 left-0 px-1 py-0.5 text-[8px] font-black leading-none rounded-br-md ${paymentMethod === m.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            [{idx + 1}]
                                        </div>
                                        <m.icon className={`w-3.5 h-3.5 ${paymentMethod === m.id ? 'text-white' : 'text-slate-400'}`} />
                                        <span className="text-[11px] font-bold uppercase whitespace-nowrap">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Amount Input Section */}
                        <section className="bg-indigo-50/50 dark:bg-indigo-500/5 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                            <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2.5">Jumlah Bayar</label>
                            <div className="relative mb-3">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-indigo-300 leading-none">Rp</span>
                                <NumericInput 
                                    value={paidAmount}
                                    onChange={(val) => setPaidAmount(val)}
                                    autoFocus
                                    placeholder="0"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-500/30 focus:border-indigo-500 transition-all text-2xl font-bold text-slate-900 dark:text-white focus:ring-8 focus:ring-indigo-500/10 placeholder:text-slate-300 leading-none shadow-inner"
                                />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {quickAmounts.map(val => (
                                    <button 
                                        key={val} 
                                        onClick={() => setPaidAmount(val.toString())} 
                                        className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all uppercase whitespace-nowrap shadow-sm active:scale-95"
                                    >
                                        {val === total ? 'UANG PAS' : formatCurrency(val)}
                                    </button>
                                ))}
                            </div>
                        </section>                        <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <section>
                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Pelanggan</label>
                                <div className="flex gap-1.5">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Users className="w-3.5 h-3.5" /></span>
                                        <select 
                                            value={selectedCustomer || ''}
                                            onChange={(e) => setSelectedCustomer(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full pl-10 pr-2 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                                        >
                                            <option value="">Guest / Umum</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={openCustomerModal}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm active:scale-90 transition-transform"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="sr-only">Tambah Pelanggan</span>
                                        <div className="absolute -top-1 -right-1 px-1 bg-indigo-500 text-white text-[8px] font-black rounded-full">F8</div>
                                    </button>
                                </div>
                            </section>
 
                            <section>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Diskon</label>
                                    {totalGlobalDiscount > 0 && <span className="text-[11px] font-semibold text-red-500">-{formatCurrency(totalGlobalDiscount)}</span>}
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 h-8 w-16 shrink-0 bg-white dark:bg-slate-900">
                                        <button 
                                            onClick={() => setGlobalDiscountMode('nominal')}
                                            className={`flex-1 flex items-center justify-center transition-all ${globalDiscountMode === 'nominal' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black' : 'text-slate-400'}`}
                                        >
                                            <span className="text-[9px]">Rp</span>
                                        </button>
                                        <button 
                                            onClick={() => setGlobalDiscountMode('percent')}
                                            className={`flex-1 flex items-center justify-center transition-all ${globalDiscountMode === 'percent' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black' : 'text-slate-400'}`}
                                        >
                                            <Percent className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <NumericInput 
                                        value={globalDiscount}
                                        onChange={(val) => setGlobalDiscount(val)}
                                        placeholder="0"
                                        className="w-full px-2 py-0 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 text-[11px] font-black text-slate-700 dark:text-slate-300 placeholder:text-slate-300"
                                    />
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Action Footer: Notes & Pay Button side by side */}
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Catatan</label>
                            <textarea 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)}
                                rows={1} 
                                placeholder="..."
                                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 resize-none"
                            />
                        </div>
                        <button 
                            onClick={handleCheckout}
                            disabled={processing || Number(paidAmount) < Number(total)}
                            className="h-[52px] px-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-black text-xl hover:bg-indigo-700 dark:hover:bg-indigo-400 active:scale-[0.95] transition-all shadow-xl shadow-indigo-500/40 disabled:grayscale disabled:opacity-30 flex items-center justify-center gap-3 uppercase tracking-tighter group shrink-0"
                        >
                            {processing ? (
                                <RotateCcw className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" /> BAYAR
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Drawer>
            {/* Thermal Receipt for printing (Hidden) */}
            {completedSale && <ThermalReceipt sale={completedSale} />}

            {/* Success Modal */}
            {completedSale && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" />
                    <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-indigo-500/30 p-8 text-center animate-scale-in">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 stroke-[3px]" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Transaksi Berhasil!</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Pembayaran telah diterima dan stok telah diperbarui.</p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => printerService.print(app_settings as any, completedSale, 'sale')}
                                className="w-full py-4 rounded-xl bg-indigo-500 text-slate-950 font-black text-lg hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                <Printer className="w-6 h-6" /> CETAK ULANG STRUK (P)
                            </button>
                            <p className="text-[10px] text-gray-400 font-bold uppercase py-1 italic tracking-widest">Gunakan tombol di atas jika struk gagal tercetak</p>
                            <button
                                onClick={() => setCompletedSale(null)}
                                className="w-full py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all uppercase tracking-widest text-center"
                            >
                                TRANSAKSI BARU (ENTER)
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Variant Selection Modal for Ambiguous Scans */}
            <Modal show={showVariantModal} onClose={() => setShowVariantModal(false)} maxWidth="lg">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Pilih Varian Produk</h2>
                            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Ditemukan beberapa produk dengan barcode yang sama</p>
                        </div>
                        <button type="button" onClick={() => setShowVariantModal(false)} className="text-gray-400 hover:text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 pb-2">
                        {ambiguousProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => {
                                    if (product.stock > 0) {
                                        cart.addItem(product);
                                        toast.success(`${product.name} ditambahkan`);
                                        setShowVariantModal(false);
                                    } else {
                                        toast.error('Stok varian ini habis');
                                    }
                                }}
                                className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 group
                                    ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md'}`}
                            >
                                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                    {product.image ? (
                                        <img src={`/storage/${product.image}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate uppercase tracking-tight leading-none mb-2">{product.name}</h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">{formatCurrency(Number(product.price))}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase">SKU: {product.sku}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className={`text-[10px] font-bold uppercase ${product.stock < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                STOK: {product.stock}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end pt-5 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setShowVariantModal(false)}
                            className="px-8 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all uppercase tracking-widest"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Customer Modal */}
            <Modal show={showCustomerModal} onClose={() => setShowCustomerModal(false)} maxWidth="md">
                <form onSubmit={handleAddCustomer} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Pelanggan Baru</h2>
                        <button type="button" onClick={() => setShowCustomerModal(false)} className="text-gray-400 hover:text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nama Lengkap *</label>
                            <input
                                type="text"
                                value={customerForm.data.name}
                                onChange={e => customerForm.setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-indigo-500/50"
                                required
                                autoFocus
                            />
                            {customerForm.errors.name && <p className="mt-1 text-xs text-red-500">{customerForm.errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">No. Telepon</label>
                                <input
                                    type="text"
                                    value={customerForm.data.phone}
                                    onChange={e => customerForm.setData('phone', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={customerForm.data.email}
                                    onChange={e => customerForm.setData('email', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Alamat</label>
                            <textarea
                                value={customerForm.data.address}
                                onChange={e => customerForm.setData('address', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-indigo-500/50 resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowCustomerModal(false)}
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-200 transition-all uppercase"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={customerForm.processing}
                            className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all uppercase disabled:opacity-50"
                        >
                            {customerForm.processing ? 'Menyimpan...' : 'Simpan Pelanggan'}
                        </button>
                    </div>
                </form>
            </Modal>

            <SwitchUserModal 
                show={showSwitchUserModal}
                onClose={() => setShowSwitchUserModal(false)}
                users={users}
            />

            <PendingTransactionsModal
                show={showPendingModal}
                onClose={() => setShowPendingModal(false)}
                onSync={handleSyncPending}
                isSyncing={isSyncing}
            />

            <HeldOrdersModal
                show={showHoldModal}
                onClose={() => setShowHoldModal(false)}
                onRestore={(order) => {
                    // Restore to cart
                    cart.clearCart();
                    order.items.forEach(item => {
                        // We use a simplified loop because cart.addItem handles existing items
                        // But here we want to restore exact state
                    });
                    // Actually, let's manually set the state to be safe
                    useCartStore.setState({ items: order.items, selectedIndex: 0 });
                    setSelectedCustomer(order.customer_id);
                    setNotes(order.notes);
                    setShowHoldModal(false);
                    toast.success('Pesanan dikembalikan ke keranjang');
                }}
            />
        </AuthenticatedLayout>
    );
}
