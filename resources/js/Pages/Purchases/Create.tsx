import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Save, Plus, Trash2, ArrowLeft, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

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
    };

    const totalAmount = form.data.items.reduce((sum, item) => sum + (item.qty * item.unit_cost), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        form.transform((data) => ({
            ...data,
            items: data.items.map(({ unique_id, ...rest }) => rest)
        }));
        
        form.post('/purchases');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Input Barang Masuk" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/purchases" className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Input Barang Masuk</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Catat struk/invoice pembelian dari supplier</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Form general */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 dark:border-gray-800/50 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Informasi Transaksi</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gudang / Pemasok</label>
                                    <select
                                        value={form.data.supplier_id}
                                        onChange={e => form.setData('supplier_id', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/50"
                                    >
                                        <option value="">-- Pilih Pemasok --</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tanggal Input</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.data.purchase_date}
                                        onChange={e => form.setData('purchase_date', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan / Keterangan</label>
                                    <textarea
                                        value={form.data.notes}
                                        onChange={e => form.setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="e.g. Surat Jalan no..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-500/20">
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-1">Total Pembayaran</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)}
                            </p>
                            <button
                                type="submit"
                                disabled={form.processing || form.data.items.length === 0}
                                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                            >
                                <Save className="w-5 h-5" /> Simpan Barang Masuk
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800/50 flex flex-col h-[600px]">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800/50 bg-gray-50 dark:bg-transparent rounded-t-2xl">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari produk produk untuk ditambahkan..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                    {searchQuery && (
                                        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto z-10">
                                            {filteredItems.length > 0 ? filteredItems.map(p => (
                                                <button
                                                    key={p.unique_id}
                                                    type="button"
                                                    onClick={() => addItem(p)}
                                                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-b border-gray-50 dark:border-gray-700/50 last:border-0 flex items-center justify-between group"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{p.name}</p>
                                                        <p className="text-xs text-gray-500">Stok sisa: {p.stock} • {p.sku || '-'}</p>
                                                    </div>
                                                    <Plus className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            )) : (
                                                <div className="p-4 text-center text-sm text-gray-500">Produk tidak ditemukan</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900/20">
                                {form.data.items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <p>Belum ada produk yang ditambahkan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {form.data.items.map((item, idx) => (
                                            <div key={item.unique_id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-white">{item.product_name}</p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                                    <div className="w-24">
                                                        <label className="text-xs text-gray-500 block mb-1">Qty Tambah</label>
                                                        <input 
                                                            type="number" min="1" 
                                                            value={item.qty} 
                                                            onChange={e => updateItemQty(item.unique_id, parseInt(e.target.value) || 1)}
                                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <label className="text-xs text-gray-500 block mb-1">Harga Beli Satuan</label>
                                                        <input 
                                                            type="number" min="0" 
                                                            value={item.unit_cost === 0 ? '' : item.unit_cost} 
                                                            placeholder="0"
                                                            onChange={e => updateItemCost(item.unique_id, parseInt(e.target.value) || 0)}
                                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="w-32 text-right pt-5">
                                                        <p className="font-semibold text-gray-900 dark:text-emerald-400">
                                                            {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.qty * item.unit_cost)}
                                                        </p>
                                                    </div>
                                                    <button type="button" onClick={() => removeItem(item.unique_id)} className="p-2 pt-5 text-gray-400 hover:text-red-500">
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
