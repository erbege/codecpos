import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { PageProps, Product, Category, Customer } from '@/types';
import { useCartStore } from '@/stores/useCartStore';
import { useAppStore } from '@/stores/useAppStore';
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
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import ThermalReceipt from '@/Components/ThermalReceipt';
import Drawer from '@/Components/Drawer';

interface Props extends PageProps {
    products: Product[];
    categories: Category[];
    customers: Customer[];
    taxRate: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatNumberInput = (val: string) => {
    if (!val) return '';
    const num = val.replace(/\D/g, '');
    if (num === '') return '';
    return new Intl.NumberFormat('id-ID').format(Number(num));
};

export default function POS() {
    const { auth, flash, products, categories, customers, taxRate } = usePage<Props>().props;
    const cart = useCartStore();
    const { posViewMode, setPosViewMode } = useAppStore();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qris' | 'debit'>('cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [completedSale, setCompletedSale] = useState<any>(null);
    
    // Discount State
    const [globalDiscount, setGlobalDiscount] = useState('0');
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
                window.print();
            }, 1000); // Increased delay for stability
            return () => clearTimeout(timer);
        }
    }, [completedSale]);

    useEffect(() => {
        searchRef.current?.focus();
    }, []);


    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === 'F9' && cart.items.length > 0) {
                e.preventDefault();
                setShowCheckout(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart.items.length]);

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

    // Auto-add product on exact barcode match (for scanners)
    useEffect(() => {
        if (!search || search.length < 3) return;

        const exactMatch = flattenedProducts.find(
            (p) => p.barcode && p.barcode === search
        );

        if (exactMatch && exactMatch.stock > 0) {
            cart.addItem(exactMatch);
            setSearch('');
            // Toast feedback міг add feedback here
        }
    }, [search, flattenedProducts]);

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If there's only one product in the filtered list, add it
            if (filteredProducts.length === 1 && filteredProducts[0].stock > 0) {
                cart.addItem(filteredProducts[0]);
                setSearch('');
            }
        }
    };

    const subtotal = cart.getSubtotal();
    const totalGlobalDiscount = Number(globalDiscount);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = Math.max(0, (subtotal + taxAmount) - totalGlobalDiscount);
    const change = Number(paidAmount) - total;

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

    const handleCheckout = () => {
        if (cart.items.length === 0) return;
        if (Number(paidAmount) < total) return;

        setProcessing(true);
        router.post('/pos/checkout', {
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
        }, {
            onSuccess: (page) => {
                const flashProps = page.props.flash as any;
                
                const lastItems = [...cart.items];
                
                setCompletedSale({
                    invoice_number: flashProps.last_sale_invoice || 'INV-TEMP', 
                    items: lastItems.map(i => ({
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
                    outlet: auth?.user?.outlet || null
                });

                cart.clearCart();
                setShowCheckout(false);
                setPaidAmount('');
                setNotes('');
                setGlobalDiscount('0');
                setSelectedCustomer(null);
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };

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


    return (
        <AuthenticatedLayout>
            <Head title="POS - Kasir" />

            <div className="flex gap-4 h-[calc(100vh-7rem)]">
                {/* Left: Product Grid */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="space-y-3 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Cari produk atau scan barcode... (F2)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
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
                            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
                                {filteredProducts.map((product) => {
                                    const inCart = cart.items.find((i) => i.product.id === product.id);
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
                                            <div className="w-full aspect-square rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform overflow-hidden border border-gray-100 dark:border-gray-700">
                                                {product.image ? (
                                                    <img src={`/storage/${product.image}`} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate leading-tight">{product.name}</p>
                                            <div className="flex flex-col mt-1">
                                                <p className="text-[12px] font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(Number(product.price))}</p>
                                                <span className="text-[9px] font-medium text-gray-400 uppercase tracking-tighter">
                                                    Stok: {product.stock}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                                <table className="w-full text-[12px] text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold uppercase tracking-tight">
                                        <tr>
                                            <th className="px-4 py-2.5">SKU</th>
                                            <th className="px-4 py-2.5">Nama Produk</th>
                                            <th className="px-4 py-2.5 text-right">Harga</th>
                                            <th className="px-4 py-2.5 text-center">Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {filteredProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                onClick={() => { if (product.stock > 0) cart.addItem(product) }}
                                                className={`hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors cursor-pointer ${product.stock <= 0 ? 'opacity-50' : ''}`}
                                            >
                                                <td className="px-4 py-2.5 text-gray-400">{product.sku}</td>
                                                <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">{product.name}</td>
                                                <td className="px-4 py-2.5 text-right font-black text-indigo-600">{formatCurrency(Number(product.price))}</td>
                                                <td className="px-4 py-2.5 text-center font-bold">{product.stock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Cart */}
                <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
                    <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-indigo-500" />
                            <h3 className="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-wider">Keranjang</h3>
                        </div>
                        <button onClick={() => cart.clearCart()} className="text-[9px] text-gray-400 hover:text-red-500 transition-colors font-black uppercase tracking-tighter">Hapus</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {cart.items.length > 0 ? (
                            cart.items.map((item) => (
                                <div key={item.product.id} className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 space-y-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">{item.product.name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{formatCurrency(item.product.price)} / pc</p>
                                        </div>
                                        <button onClick={() => cart.removeItem(item.product.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => cart.updateQuantity(item.product.id, item.qty - 1)} className="w-5 h-5 rounded bg-white dark:bg-gray-900 border dark:border-gray-800 flex items-center justify-center text-gray-500"><Minus className="w-2.5 h-2.5" /></button>
                                            <input 
                                                type="number" 
                                                value={item.qty} 
                                                onChange={(e) => cart.updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                                className="w-8 text-center bg-transparent border-none text-[12px] font-black focus:ring-0 p-0" 
                                            />
                                            <button onClick={() => cart.updateQuantity(item.product.id, item.qty + 1)} className="w-5 h-5 rounded bg-white dark:bg-gray-900 border dark:border-gray-800 flex items-center justify-center text-gray-500"><Plus className="w-2.5 h-2.5" /></button>
                                        </div>
                                        
                                        <div className="flex flex-col items-end">
                                            {item.discount > 0 && <span className="text-[9px] text-red-500 font-bold">-{formatCurrency(item.discount)}</span>}
                                            <p className="text-[13px] font-black text-gray-900 dark:text-white">{formatCurrency(item.product.price * item.qty - item.discount)}</p>
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
                                                <input 
                                                    type="number"
                                                    value={discountValue}
                                                    onChange={(e) => setDiscountValue(e.target.value)}
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
                                                className="flex items-center gap-1 text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors uppercase"
                                            >
                                                <Tag className="w-2.5 h-2.5" />
                                                {item.discount > 0 ? 'Edit Diskon' : 'Tambah Diskon'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-16">
                                <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm">Keranjang kosong</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 space-y-2">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-gray-900 dark:text-white border-t-2 border-dashed border-gray-200 dark:border-gray-800 pt-2">
                                <span>TOTAL</span>
                                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCheckout(true)}
                            disabled={cart.items.length === 0}
                            className="w-full py-3 rounded-md bg-indigo-600 dark:bg-indigo-500 text-white font-black text-[13px] hover:bg-indigo-700 dark:hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                            <CreditCard className="w-4 h-4" /> BAYAR SEKARANG (F9)
                        </button>
                    </div>
                </div>
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
                    <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Total Bayar</p>
                                <h4 className="text-4xl font-black tracking-tighter">{formatCurrency(Number(total))}</h4>
                            </div>
                            <div className="text-right">
                                <div className="space-y-1">
                                    <div className="flex justify-between gap-8 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        <span>Subtotal</span>
                                        <span className="text-white">{formatCurrency(Number(subtotal))}</span>
                                    </div>
                                    {Number(totalGlobalDiscount) > 0 && (
                                        <div className="flex justify-between gap-8 text-[10px] text-red-400 font-bold uppercase tracking-wider">
                                            <span>Diskon</span>
                                            <span>-{formatCurrency(Number(totalGlobalDiscount))}</span>
                                        </div>
                                    )}
                                    {Number(taxAmount) > 0 && (
                                        <div className="flex justify-between gap-8 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                            <span>Pajak (11%)</span>
                                            <span className="text-white">{formatCurrency(Number(taxAmount))}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {Number(paidAmount) >= Number(total) && (
                            <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 animate-fade-in flex justify-between items-center">
                                <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest leading-none">Kembalian</p>
                                <p className="text-xl font-black text-indigo-400 leading-none">{formatCurrency(Number(change))}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Payment Method Section */}
                        <section>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Metode Pembayaran</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'cash', label: 'TUNAI', icon: Banknote },
                                    { id: 'transfer', label: 'TF BANK', icon: CreditCard },
                                    { id: 'qris', label: 'QRIS', icon: Smartphone },
                                    { id: 'debit', label: 'DEBIT', icon: CreditCard },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id as any)}
                                        className={`p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 overflow-hidden group
                                            ${paymentMethod === m.id 
                                                ? 'bg-indigo-500 border-indigo-500 text-white scale-[1.02] shadow-lg shadow-indigo-500/20' 
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}
                                        `}
                                    >
                                        <m.icon className={`w-4 h-4 ${paymentMethod === m.id ? 'text-white' : 'text-slate-400'} group-hover:scale-110 transition-transform`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Amount Input Section */}
                        <section>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Jumlah Bayar</label>
                            <div className="relative mb-3">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 leading-none">Rp</span>
                                <input 
                                    type="text" 
                                    value={formatNumberInput(paidAmount)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, '');
                                        setPaidAmount(raw);
                                    }}
                                    autoFocus
                                    placeholder="0"
                                    className="w-full pl-14 pr-4 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 transition-all text-2xl font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300 leading-none"
                                />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {quickAmounts.map(val => (
                                    <button 
                                        key={val} 
                                        onClick={() => setPaidAmount(val.toString())} 
                                        className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all uppercase whitespace-nowrap"
                                    >
                                        {val === total ? 'UANG PAS' : formatCurrency(val)}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Customer & Discount Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <section>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Pelanggan</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Users className="w-3.5 h-3.5" /></span>
                                    <select 
                                        value={selectedCustomer || ''}
                                        onChange={(e) => setSelectedCustomer(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-indigo-500/10"
                                    >
                                        <option value="">Guest / Umum</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Diskon</label>
                                    {Number(globalDiscount) > 0 && <span className="text-[9px] font-bold text-red-500">-{formatCurrency(Number(globalDiscount))}</span>}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Tag className="w-3.5 h-3.5" /></span>
                                    <input 
                                        type="number" 
                                        value={globalDiscount}
                                        onChange={(e) => setGlobalDiscount(e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                                    />
                                </div>
                            </section>
                        </div>

                        {/* Notes Section */}
                        <section>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Catatan</label>
                            <textarea 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2} 
                                placeholder="..."
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 resize-none"
                            />
                        </section>
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <button 
                            onClick={handleCheckout}
                            disabled={processing || Number(paidAmount) < Number(total)}
                            className="w-full py-5 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white font-black text-xl hover:bg-indigo-700 dark:hover:bg-indigo-400 active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20 disabled:grayscale disabled:opacity-30 flex items-center justify-center gap-3 uppercase tracking-widest group"
                        >
                            {processing ? (
                                <RotateCcw className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-7 h-7 stroke-[4] group-hover:scale-125 transition-transform" /> PROSES BAYAR
                                </>
                            )}
                        </button>
                        <p className="mt-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Klik untuk memvalidasi transaksi</p>
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
                                onClick={() => window.print()}
                                className="w-full py-4 rounded-xl bg-indigo-500 text-slate-950 font-black text-lg hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                <Printer className="w-6 h-6" /> CETAK ULANG STRUK
                            </button>
                            <p className="text-[10px] text-gray-400 font-bold uppercase py-1 italic tracking-widest">Gunakan tombol di atas jika struk gagal tercetak</p>
                            <button
                                onClick={() => setCompletedSale(null)}
                                className="w-full py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all uppercase tracking-widest text-center"
                            >
                                TRANSAKSI BARU
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
