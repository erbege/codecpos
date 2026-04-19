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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Katalog Produk</h1>
                        <p className="text-sm text-gray-500 font-medium">Manajemen Inventaris Sepeda & Suku Cadang</p>
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
                                    <th className="text-left px-5 py-3.5 text-gray-500 text-xs font-semibold uppercase tracking-wider">Produk</th>
                                    <th className="text-left px-5 py-3.5 text-gray-500 text-xs font-semibold uppercase tracking-wider">Kategori</th>
                                    <th className="text-left px-5 py-3.5 text-gray-500 text-xs font-semibold uppercase tracking-wider">SKU</th>
                                    <th className="text-right px-5 py-3.5 text-gray-500 text-xs font-semibold uppercase tracking-wider">Harga</th>
                                    <th className="text-right px-5 py-3.5 text-gray-500 text-xs font-semibold uppercase tracking-wider">Stok</th>
                                    <th className="text-center px-5 py-3.5 text-gray-500 text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="text-right px-5 py-3.5 text-gray-500 text-xs font-semibold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length > 0 ? products.data.map((product) => (
                                    <tr 
                                        key={product.id} 
                                        onClick={() => router.visit(`/products/${product.id}/edit`)}
                                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
                                                    <Package className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize tracking-tight">{product.name.toLowerCase()}</p>
                                                    {product.barcode && (
                                                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{product.barcode}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 font-medium">{product.category?.name}</td>
                                        <td className="px-5 py-4 text-gray-500 font-mono text-[11px]">
                                            {product.has_variants ? (
                                                <span className="inline-flex px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-sans font-semibold text-[10px] uppercase tracking-wider">Variant</span>
                                            ) : (
                                                product.sku
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right text-indigo-600 font-semibold">
                                            {product.has_variants ? '-' : formatCurrency(Number(product.price))}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {product.has_variants ? (
                                                <span className="text-gray-500 font-semibold">{product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0}</span>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {product.stock <= product.min_stock && (
                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                    )}
                                                    <span className={`font-semibold ${product.stock <= product.min_stock ? 'text-amber-600 dark:text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                                                        {product.stock}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide
                                                ${product.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50'}`}>
                                                {product.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.visit(`/products/${product.id}/edit`);
                                                    }}
                                                    className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(product);
                                                    }}
                                                    className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shadow-sm"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
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
