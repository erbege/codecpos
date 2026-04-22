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
    History,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import NumericInput from '@/Components/NumericInput';

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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Stock Opname</h1>
                        </div>
                        <p className="text-gray-400 text-xs font-semibold pl-11 italic">Sesuaikan stok fisik gudang dengan sistem secara presisi</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari Produk atau SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-2">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item, idx) => (
                                <button
                                    key={`${item.productId}-${item.variantId}-${idx}`}
                                    onClick={() => handleSelect(item)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group
                                        ${selectedItem?.sku === item.sku 
                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500/50'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg transition-colors
                                            ${selectedItem?.sku === item.sku ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}
                                        `}>
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold uppercase tracking-tight ${selectedItem?.sku === item.sku ? 'text-indigo-700' : 'text-gray-900 dark:text-white'}`}>
                                                {item.name}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1 text-[10px]">
                                                <span className={`font-black uppercase px-2 py-0.5 rounded border ${selectedItem?.sku === item.sku ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                                                    {item.sku}
                                                </span>
                                                <span className="font-semibold text-gray-400 uppercase">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">STOK SISTEM</p>
                                        <p className={`text-xl font-black ${selectedItem?.sku === item.sku ? 'text-indigo-600' : 'text-gray-900 dark:text-white'}`}>
                                            {item.currentStock}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                <Package className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Produk tidak ditemukan</p>
                            </div>
                        )}
                    </div>

                    {/* Adjustment Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">
                            <div className="p-5 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                                <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">Panel Penyesuaian</h2>
                            </div>

                            {selectedItem ? (
                                <form onSubmit={submit} className="p-6 space-y-6">
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sedang Menyesuaikan:</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-4">{selectedItem.name}</p>
                                        
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center">
                                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">SISTEM</p>
                                                <p className="text-lg font-black text-gray-900 dark:text-white">{selectedItem.currentStock}</p>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <ArrowRightLeft className="w-4 h-4 text-gray-300" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] text-indigo-500 font-bold uppercase mb-1">FISIK</p>
                                                <p className="text-lg font-black text-indigo-600">{data.new_stock || 0}</p>
                                            </div>
                                        </div>

                                        <div className={`mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between`}>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">SELISIH STOK</span>
                                            <div className={`flex items-center gap-1.5 font-black text-xs ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                                                {diff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : diff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                                                {diff > 0 ? `+${diff}` : diff} UNITS
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Input Jumlah Stok Fisik *</label>
                                            <NumericInput
                                                value={data.new_stock}
                                                onChange={(val) => setData('new_stock', val)}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-500/10 focus:border-indigo-500 text-xl font-black transition-all outline-none"
                                                placeholder="0"
                                                required
                                            />
                                            {errors.new_stock && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.new_stock}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Alasan Koreksi</label>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                {['Koreksi Stok', 'Barang Rusak', 'Barang Hilang', 'Bonus'].map(r => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => setData('reason', r)}
                                                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border
                                                            ${data.reason === r 
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-indigo-300'}
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
                                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="Tulis alasan lain..."
                                            />
                                            {errors.reason && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.reason}</p>}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                    >
                                        {processing ? 'Sedang Memproses...' : (
                                            <>
                                                SIMPAN PERUBAHAN <CheckCircle2 className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-400 font-semibold text-xs leading-relaxed italic">
                                        Silakan pilih produk pada daftar di sebelah kiri untuk memulai penyesuaian stok.
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
