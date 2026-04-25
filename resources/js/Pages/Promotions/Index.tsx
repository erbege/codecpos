import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Tag,
    Plus,
    Search,
    Calendar,
    ToggleLeft,
    ToggleRight,
    Pencil,
    Trash2,
    Package,
    Globe,
    Store,
    Percent,
    DollarSign,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Copy,
} from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';

interface Promotion {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    scope: 'product' | 'global';
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_discount: number | null;
    min_purchase: number | null;
    start_date: string;
    end_date: string;
    max_usage: number | null;
    usage_count: number;
    priority: number;
    is_active: boolean;
    status: string;
    items: any[];
    outlets: any[];
    created_by: { name: string } | null;
    created_at: string;
}

interface Props extends PageProps {
    promotions: {
        data: Promotion[];
        links: any[];
        meta?: any;
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string;
        scope?: string;
        search?: string;
    };
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const getStatusConfig = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);

    if (!promo.is_active) return { label: 'Nonaktif', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: XCircle };
    if (now < start) return { label: 'Akan Datang', color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', icon: Clock };
    if (now > end) return { label: 'Berakhir', color: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400', icon: XCircle };
    if (promo.max_usage && promo.usage_count >= promo.max_usage) return { label: 'Kuota Habis', color: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400', icon: AlertCircle };
    return { label: 'Aktif', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: CheckCircle2 };
};

export default function PromotionsIndex() {
    const { promotions, filters } = usePage<Props>().props;
    const { confirm: appConfirm } = useAppStore();
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key: string, value: string | null) => {
        router.get('/promotions', {
            ...filters,
            [key]: value || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const handleToggle = (promo: Promotion) => {
        appConfirm({
            title: promo.is_active ? 'Nonaktifkan Promo' : 'Aktifkan Promo',
            message: `${promo.is_active ? 'Nonaktifkan' : 'Aktifkan'} promo "${promo.name}"?`,
            confirmLabel: 'Ya, Lanjutkan',
            cancelLabel: 'Batal',
            onConfirm: () => {
                router.post(`/promotions/${promo.id}/toggle`);
            }
        });
    };

    const handleDelete = (promo: Promotion) => {
        const msg = promo.usage_count > 0
            ? `Promo "${promo.name}" sudah digunakan ${promo.usage_count} kali. Promo akan dinonaktifkan (bukan dihapus) untuk menjaga audit trail. Lanjutkan?`
            : `Hapus promo "${promo.name}"? Tindakan ini tidak dapat dibatalkan.`;

        appConfirm({
            title: 'Hapus Promo',
            message: msg,
            confirmLabel: promo.usage_count > 0 ? 'Ya, Nonaktifkan' : 'Ya, Hapus',
            cancelLabel: 'Batal',
            type: promo.usage_count > 0 ? 'info' : 'danger',
            onConfirm: () => {
                router.delete(`/promotions/${promo.id}`);
            }
        });
    };

    const statusFilters = [
        { value: '', label: 'Semua' },
        { value: 'active', label: 'Aktif' },
        { value: 'upcoming', label: 'Akan Datang' },
        { value: 'expired', label: 'Berakhir' },
        { value: 'inactive', label: 'Nonaktif' },
    ];

    const scopeFilters = [
        { value: '', label: 'Semua' },
        { value: 'product', label: 'Produk' },
        { value: 'global', label: 'Global' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Promo Diskon" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Promo Diskon</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola promo dan diskon otomatis untuk produk dan transaksi</p>
                    </div>
                    <Link
                        href="/promotions/create"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" /> Buat Promo Baru
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau kode promo..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </form>

                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status:</span>
                            <div className="flex gap-1">
                                {statusFilters.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => handleFilter('status', f.value || null)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            (filters.status || '') === f.value
                                                ? 'bg-indigo-500 text-white shadow-sm'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scope:</span>
                            <div className="flex gap-1">
                                {scopeFilters.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => handleFilter('scope', f.value || null)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            (filters.scope || '') === f.value
                                                ? 'bg-indigo-500 text-white shadow-sm'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase font-black text-gray-500 tracking-wider bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-5 py-4">Promo</th>
                                    <th className="px-5 py-4 text-center">Scope</th>
                                    <th className="px-5 py-4 text-center">Diskon</th>
                                    <th className="px-5 py-4 text-center">Periode</th>
                                    <th className="px-5 py-4 text-center">Outlet</th>
                                    <th className="px-5 py-4 text-center">Terpakai</th>
                                    <th className="px-5 py-4 text-center">Status</th>
                                    <th className="px-5 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {promotions.data.length > 0 ? promotions.data.map((promo) => {
                                    const status = getStatusConfig(promo);
                                    const StatusIcon = status.icon;

                                    return (
                                        <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{promo.name}</p>
                                                    {promo.code && (
                                                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold">
                                                            {promo.code}
                                                        </span>
                                                    )}
                                                    {promo.min_purchase && (
                                                        <p className="text-xs text-gray-400 mt-0.5">Min. belanja: {formatCurrency(promo.min_purchase)}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                    promo.scope === 'product'
                                                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                                                        : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                                }`}>
                                                    {promo.scope === 'product' ? <Package className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                                                    {promo.scope === 'product' ? 'Produk' : 'Global'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="font-black text-gray-900 dark:text-white">
                                                    {promo.discount_type === 'percentage'
                                                        ? `${promo.discount_value}%`
                                                        : formatCurrency(promo.discount_value)
                                                    }
                                                </span>
                                                {promo.max_discount && promo.discount_type === 'percentage' && (
                                                    <p className="text-xs text-gray-400">Maks. {formatCurrency(promo.max_discount)}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="text-xs">
                                                    <p className="font-bold text-gray-700 dark:text-gray-300">{formatDate(promo.start_date)}</p>
                                                    <p className="text-gray-400">s/d</p>
                                                    <p className="font-bold text-gray-700 dark:text-gray-300">{formatDate(promo.end_date)}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {promo.outlets && promo.outlets.length > 0 ? (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <Store className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                                            {promo.outlets.length} outlet
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Semua</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="font-black text-gray-900 dark:text-white">{promo.usage_count}</span>
                                                {promo.max_usage && (
                                                    <span className="text-xs text-gray-400"> / {promo.max_usage}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${status.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleToggle(promo)}
                                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                        title={promo.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    >
                                                        {promo.is_active
                                                            ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                                                            : <ToggleLeft className="w-5 h-5 text-gray-400" />
                                                        }
                                                    </button>
                                                    <Link
                                                        href={`/promotions/${promo.id}/edit`}
                                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4 text-indigo-500" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(promo)}
                                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-20 text-center">
                                            <Tag className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                                            <p className="text-sm font-bold text-gray-400">Belum ada promo</p>
                                            <p className="text-xs text-gray-400 mt-1">Buat promo pertama Anda untuk menarik pelanggan</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {promotions.links && promotions.links.length > 3 && (
                        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-1">
                            {promotions.links.map((link: any, idx: number) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        link.active
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : link.url
                                                ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveState
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
