import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps, Product, Category, PaginatedData } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';
import { useState } from 'react';

interface Props extends PageProps {
    products: PaginatedData<Product>;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
    };
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function ProductIndex() {
    const { products, categories, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/products', { search }, { preserveState: true, preserveScroll: true });
    };

    const confirm = useAppStore(state => state.confirm);
    const closeDialog = useAppStore(state => state.closeDialog);

    const handleDelete = (product: Product) => {
        confirm({
            title: 'Hapus Produk',
            message: `Apakah Anda yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmLabel: 'Ya, Hapus Produk',
            type: 'danger',
            onConfirm: () => {
                router.delete(`/products/${product.id}`);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Produk" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Katalog Produk</h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Manajemen Inventaris Sepeda & Suku Cadang</p>
                    </div>
                    <Link
                        href="/products/create"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
                    >
                        <Plus className="w-3.5 h-3.5" /> PRODUK BARU
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari SKU, Barcode, atau Nama Produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </form>
                    <select
                        onChange={(e) => router.get('/products', { ...filters, category_id: e.target.value || undefined }, { preserveState: true })}
                        defaultValue={filters.category_id || ''}
                        className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[180px]"
                    >
                        <option value="">SEMUA KATEGORI</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Produk</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Kategori</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">SKU</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Harga</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Stok</th>
                                    <th className="text-center px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length > 0 ? products.data.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                                    <Package className="w-3.5 h-3.5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{product.name}</p>
                                                    {product.barcode && (
                                                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{product.barcode}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-medium">{product.category?.name}</td>
                                        <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">
                                            {product.has_variants ? (
                                                <span className="inline-flex px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-sans font-bold text-[9px] uppercase tracking-tighter">Variant</span>
                                            ) : (
                                                product.sku
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-indigo-600 font-black">
                                            {product.has_variants ? '-' : formatCurrency(Number(product.price))}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {product.has_variants ? (
                                                <span className="text-gray-400 font-bold">{product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0}</span>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {product.stock <= product.min_stock && (
                                                        <AlertTriangle className="w-3 h-3 text-indigo-500" />
                                                    )}
                                                    <span className={`font-black ${product.stock <= product.min_stock ? 'text-indigo-600' : 'text-gray-900 dark:text-white'}`}>
                                                        {product.stock}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter
                                                ${product.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                {product.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/products/${product.id}/edit`}
                                                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 transition-colors"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-16 text-center">
                                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400">Tidak ada produk ditemukan</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-transparent">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {products.from}-{products.to} / {products.total} PRODUK
                            </p>
                            <div className="flex gap-1">
                                {products.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded text-[10px] font-black transition-all
                                            ${link.active
                                                ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                                                : link.url
                                                    ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
