import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Save, Plus, Trash2, ArrowLeft, Search, Package, ShoppingBag, Receipt, Calendar } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import NumericInput from '@/Components/NumericInput';

interface Supplier {
    id: number;
    name: string;
}

interface Variant {
    id: number;
    name: string;
    sku: string;
    stock: number;
    price: string | null;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    stock: number;
    price: string;
    has_variants: boolean;
    variants?: Variant[];
}

interface Props extends PageProps {
    suppliers: Supplier[];
    products: Product[];
}

export default function PurchasesCreate() {
    const { suppliers, products } = usePage<Props>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const form = useForm({
        supplier_id: '' as string | number,
        purchase_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [] as { 
            unique_id: string;
            product_id: number; 
            product_variant_id: number | null;
            product_name: string; 
            qty: number; 
            unit_cost: number 
        }[],
    });

    const flattenedProducts = useMemo(() => {
        const list: any[] = [];
        products.forEach(p => {
            if (p.has_variants && p.variants && p.variants.length > 0) {
                p.variants.forEach(v => {
                    list.push({
                        unique_id: `v_${v.id}`,
                        product_id: p.id,
                        product_variant_id: v.id,
                        name: `${p.name} (${v.name})`,
                        sku: v.sku,
                        stock: v.stock
                    });
                });
            } else {
                list.push({
                    unique_id: `p_${p.id}`,
                    product_id: p.id,
                    product_variant_id: null,
                    name: p.name,
                    sku: p.sku,
                    stock: p.stock
                });
            }
        });
        return list;
    }, [products]);

    const filteredItems = flattenedProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addItem = (item: any) => {
        const existing = form.data.items.find(i => i.unique_id === item.unique_id);
        if (existing) {
            updateItemQty(item.unique_id, existing.qty + 1);
            toast.info(`Jumlah ${item.name} diperbarui`);
        } else {
            form.setData('items', [
                ...form.data.items,
                { 
                    unique_id: item.unique_id,
                    product_id: item.product_id, 
                    product_variant_id: item.product_variant_id,
                    product_name: item.name, 
                    qty: 1, 
                    unit_cost: 0 
                }
            ]);
            toast.success(`${item.name} ditambahkan`);
        }
        setSearchQuery('');
    };

    const updateItemQty = (uniqueId: string, qty: number) => {
        form.setData('items', form.data.items.map(item =>
            item.unique_id === uniqueId ? { ...item, qty: Math.max(1, qty) } : item
        ));
    };

    const updateItemCost = (uniqueId: string, cost: number) => {
        form.setData('items', form.data.items.map(item =>
            item.unique_id === uniqueId ? { ...item, unit_cost: Math.max(0, cost) } : item
        ));
    };

    const removeItem = (uniqueId: string) => {
        form.setData('items', form.data.items.filter(item => item.unique_id !== uniqueId));
        toast.error('Item dihapus dari daftar');
    };

    const totalAmount = form.data.items.reduce((sum, item) => sum + (item.qty * item.unit_cost), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        form.transform((data) => ({
            ...data,
            items: data.items.map(({ unique_id, ...rest }) => rest)
        }));
        
        form.post('/purchases', {
            onSuccess: () => {
                toast.success('Penerimaan stok (Purchase) berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan transaksi. Periksa kembali form Anda.');
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Input Barang Masuk - Supply" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <Link href="/purchases" className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 transition shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Input Barang Masuk</h1>
                            <p className="text-sm font-semibold text-gray-400">Penerimaan stok & restock inventory</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column: Form general */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Receipt className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Detail Dokumen</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pemasok / Supplier</label>
                                    <select
                                        value={form.data.supplier_id}
                                        required
                                        onChange={e => form.setData('supplier_id', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-sm font-semibold text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="">Pilih Pemasok</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                                    </select>
                                    {form.errors.supplier_id && <p className="mt-1 text-[10px] text-rose-500 font-bold">{form.errors.supplier_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tanggal Terima</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            required
                                            value={form.data.purchase_date}
                                            onChange={e => form.setData('purchase_date', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-sm font-semibold text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Catatan Internal</label>
                                    <textarea
                                        value={form.data.notes}
                                        onChange={e => form.setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="e.g. Nomor invoice supplier..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-xs font-semibold text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Grand Total</span>
                                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-6">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)}
                            </div>
                            <button
                                type="submit"
                                disabled={form.processing || form.data.items.length === 0}
                                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> SIMPAN PENERIMAAN
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Items */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-[650px] shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Cari produk... (Tekan F2)"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                                    />
                                    {searchQuery && (
                                        <div className="absolute left-0 right-0 top-full mt-3 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-72 overflow-y-auto z-20 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {filteredItems.length > 0 ? filteredItems.map(p => (
                                                <button
                                                    key={p.unique_id}
                                                    type="button"
                                                    onClick={() => addItem(p)}
                                                    className="w-full text-left px-5 py-4 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-b border-gray-50 dark:border-gray-800/50 last:border-0 flex items-center justify-between group"
                                                >
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-tight">{p.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">TERSEDIA: {p.stock} • {p.sku || 'TANPA SKU'}</p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                        <Plus className="w-4 h-4 text-indigo-500" />
                                                    </div>
                                                </button>
                                            )) : (
                                                <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Produk tidak ditemukan</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {form.data.items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
                                        <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50">
                                            <Package className="w-16 h-16 opacity-10" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-widest italic">Belum ada item dalam daftar pembelian</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {form.data.items.map((item) => (
                                            <div key={item.unique_id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition-shadow group">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate">{item.product_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">ITEM ID: {item.unique_id}</p>
                                                </div>
                                                <div className="flex flex-wrap items-end gap-3 w-full sm:w-auto">
                                                    <div className="w-20">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-1.5 block">QUANTITY</label>
                                                        <NumericInput 
                                                            value={item.qty} 
                                                            onChange={val => updateItemQty(item.unique_id, parseInt(val) || 1)}
                                                            className="w-full px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black text-center focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-1.5 block">HARGA BELI</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">Rp</span>
                                                            <NumericInput 
                                                                value={item.unit_cost === 0 ? '' : item.unit_cost} 
                                                                placeholder="0"
                                                                onChange={val => updateItemCost(item.unique_id, parseInt(val) || 0)}
                                                                className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-32 text-right">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-1.5 block">SUBTOTAL</label>
                                                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 py-2">
                                                            {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.qty * item.unit_cost)}
                                                        </p>
                                                    </div>
                                                    <button type="button" onClick={() => removeItem(item.unique_id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
