import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Search, 
    ClipboardList, 
    AlertCircle, 
    CheckCircle2, 
    ArrowRightLeft,
    Package,
    Tag,
    History
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    has_variants: boolean;
    current_stock: number;
    category?: { name: string };
    variants: Array<{
        id: number;
        name: string;
        sku: string;
        current_stock: number;
    }>;
}

interface Props {
    products: Product[];
}

export default function StockAdjustment({ products }: Props) {
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<{
        productId: number;
        variantId: number | null;
        name: string;
        sku: string;
        currentStock: number;
    } | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        product_id: null as number | null,
        product_variant_id: null as number | null,
        new_stock: '',
        reason: 'Koreksi Stok',
    });

    const flattenedItems = useMemo(() => {
        const items: any[] = [];
        products.forEach(p => {
            if (p.has_variants && p.variants.length > 0) {
                p.variants.forEach(v => {
                    items.push({
                        productId: p.id,
                        variantId: v.id,
                        name: `${p.name} - ${v.name}`,
                        sku: v.sku,
                        currentStock: v.current_stock || 0,
                        category: p.category?.name || 'Umum'
                    });
                });
            } else {
                items.push({
                    productId: p.id,
                    variantId: null,
                    name: p.name,
                    sku: p.sku,
                    currentStock: p.current_stock || 0,
                    category: p.category?.name || 'Umum'
                });
            }
        });
        return items;
    }, [products]);

    const filteredItems = flattenedItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (item: any) => {
        setSelectedItem(item);
        setData({
            product_id: item.productId,
            product_variant_id: item.variantId,
            new_stock: item.currentStock.toString(),
            reason: 'Koreksi Stok',
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventory.adjustment.store'), {
            onSuccess: () => {
                setSelectedItem(null);
                reset();
            },
        });
    };

    const diff = selectedItem ? (Number(data.new_stock) - selectedItem.currentStock) : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Stock Opname - Inventory" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Stock Opname</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest pl-11">Penyesuaian stok fisik secara manual</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari Produk atau SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-sm font-bold transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-3">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item, idx) => (
                                <button
                                    key={`${item.productId}-${item.variantId}-${idx}`}
                                    onClick={() => handleSelect(item)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group
                                        ${selectedItem?.sku === item.sku 
                                            ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/20' 
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl transition-colors
                                            ${selectedItem?.sku === item.sku ? 'bg-slate-950/10 text-slate-950' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}
                                        `}>
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black uppercase tracking-tight ${selectedItem?.sku === item.sku ? 'text-slate-950' : 'text-slate-900 dark:text-white'}`}>
                                                {item.name}
                                            </p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${selectedItem?.sku === item.sku ? 'bg-slate-950/10 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                    {item.sku}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase ${selectedItem?.sku === item.sku ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${selectedItem?.sku === item.sku ? 'text-slate-800' : 'text-slate-400'}`}>Stok Saat Ini</p>
                                        <p className={`text-xl font-black ${selectedItem?.sku === item.sku ? 'text-slate-950' : 'text-slate-900 dark:text-white'}`}>
                                            {item.currentStock}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Produk tidak ditemukan</p>
                            </div>
                        )}
                    </div>

                    {/* Adjustment Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-slate-900 dark:bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                            <div className="p-6 bg-slate-800/50 border-b border-white/5 flex items-center gap-3">
                                <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-sm font-black uppercase tracking-widest">Penyesuaian Stok</h2>
                            </div>

                            {selectedItem ? (
                                <form onSubmit={submit} className="p-6 space-y-6">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Item Terpilih</p>
                                        <p className="text-sm font-black text-indigo-500 leading-tight">{selectedItem.name}</p>
                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex-1">
                                                <p className="text-[9px] text-slate-500 font-black uppercase">Sistem</p>
                                                <p className="text-lg font-black">{selectedItem.currentStock}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[9px] text-indigo-500 font-black uppercase">Fisik</p>
                                                <p className="text-lg font-black text-indigo-500">{data.new_stock || 0}</p>
                                            </div>
                                            <div className="flex-1 text-right">
                                                <p className="text-[9px] text-slate-500 font-black uppercase">Selisih</p>
                                                <p className={`text-lg font-black ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                                    {diff > 0 ? `+${diff}` : diff}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Input Stok Fisik</label>
                                            <input
                                                type="number"
                                                value={data.new_stock}
                                                onChange={(e) => setData('new_stock', e.target.value)}
                                                className="w-full px-4 py-4 rounded-xl bg-slate-800 border-0 focus:ring-2 focus:ring-indigo-500 text-xl font-black transition-all"
                                                placeholder="0"
                                                required
                                            />
                                            {errors.new_stock && <p className="mt-1 text-[10px] text-red-400 font-bold">{errors.new_stock}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alasan Penyesuaian</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Koreksi Stok', 'Barang Rusak', 'Barang Hilang', 'Bonus/Lainnya'].map(r => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => setData('reason', r)}
                                                        className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all border
                                                            ${data.reason === r 
                                                                ? 'bg-indigo-500 border-indigo-500 text-slate-950' 
                                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}
                                                        `}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                value={data.reason}
                                                onChange={(e) => setData('reason', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border-0 focus:ring-2 focus:ring-indigo-500 text-xs font-bold mt-2"
                                                placeholder="Tulis alasan lain..."
                                            />
                                            {errors.reason && <p className="mt-1 text-[10px] text-red-400 font-bold">{errors.reason}</p>}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black text-sm uppercase tracking-widest transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : (
                                            <>
                                                PROSES PENYESUAIAN <CheckCircle2 className="w-5 h-5 fill-slate-950/20" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center mx-auto mb-6 text-slate-700">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs leading-relaxed">
                                        Pilih produk di sebelah kiri untuk melakukan penyesuaian stok
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
