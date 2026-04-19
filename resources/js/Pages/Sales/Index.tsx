import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps, Sale, PaginatedData } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { Search, Eye, Ban, Receipt, Calendar, User, ArrowRight, Store, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props extends PageProps {
    sales: PaginatedData<Sale>;
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        outlet_id?: string;
    };
    outlets?: any[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

const statusStyle: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    voided: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    refunded: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
};

const paymentLabel: Record<string, string> = {
    cash: 'Cash', transfer: 'Transfer', qris: 'QRIS', debit: 'Debit',
};

export default function SalesIndex() {
    const { sales, filters, outlets } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (newFilters: any) => {
        router.get('/sales', { ...filters, ...newFilters }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter({ search });
    };

    const confirm = useAppStore(state => state.confirm);

    const handleVoid = (sale: Sale) => {
        confirm({
            title: 'Batalkan Transaksi (Void)',
            message: `Apakah Anda yakin ingin membatalkan transaksi ${sale.invoice_number}? Stok barang akan dikembalikan secara otomatis dan status transaksi akan berubah menjadi VOID. Action ini tidak dapat dibatalkan.`,
            confirmLabel: 'Ya, Void Transaksi',
            type: 'danger',
            onConfirm: () => {
                router.post(`/sales/${sale.id}/void`, {}, {
                    onSuccess: () => toast.success(`Transaksi ${sale.invoice_number} berhasil dibatalkan (VOID)`),
                    onError: () => toast.error('Gagal membatalkan transaksi.')
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Penjualan - Sales" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Riwayat Penjualan</h1>
                        <p className="text-sm font-semibold text-gray-400">Arsip transaksi dan laporan aktivitas harian</p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari Nomor Invoice / Pelanggan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-sm font-semibold text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </form>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            {outlets && (
                                <select
                                    onChange={(e) => handleFilter({ outlet_id: e.target.value || undefined })}
                                    value={filters.outlet_id || ''}
                                    className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-[11px] font-bold text-gray-500 uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">SEMUA CABANG</option>
                                    {outlets.map(o => <option key={o.id} value={o.id}>{o.name.toUpperCase()}</option>)}
                                </select>
                            )}
                            <select
                                onChange={(e) => handleFilter({ status: e.target.value || undefined })}
                                value={filters.status || ''}
                                className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-[11px] font-bold text-gray-500 uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="">SEMUA STATUS</option>
                                <option value="completed">COMPLETED</option>
                                <option value="voided">VOIDED</option>
                                <option value="refunded">REFUNDED</option>
                            </select>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-2 py-1 border border-gray-100 dark:border-gray-700/50">
                                <input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => handleFilter({ date_from: e.target.value || undefined })}
                                    className="bg-transparent border-none text-[11px] font-bold text-gray-500 uppercase focus:ring-0 p-2"
                                />
                                <span className="text-gray-300">/</span>
                                <input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => handleFilter({ date_to: e.target.value || undefined })}
                                    className="bg-transparent border-none text-[11px] font-bold text-gray-500 uppercase focus:ring-0 p-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaksi</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Outlet & Shift</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pelanggan</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Nilai Akhir</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {sales.data.length > 0 ? sales.data.map((sale) => (
                                    <tr 
                                        key={sale.id} 
                                        className="hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-all cursor-pointer group"
                                        onClick={() => router.get(`/sales/${sale.id}`)}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tighter uppercase mb-1">
                                                    #{sale.invoice_number}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                                                    <Calendar className="w-3 h-3" /> {formatDate(sale.created_at)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">{(sale as any).outlet?.name || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">{sale.user?.name?.charAt(0).toUpperCase()}</div>
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase italic">{sale.user?.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight truncate max-w-[120px]">
                                                {sale.customer?.name || 'UMUM'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{formatCurrency(Number(sale.total))}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <CreditCard className="w-2.5 h-2.5 text-gray-400" />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{paymentLabel[sale.payment_method]}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusStyle[sale.status]}`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <Link
                                                    href={`/sales/${sale.id}`}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-indigo-600 shadow-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {sale.status === 'completed' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleVoid(sale); }}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-rose-500 shadow-sm"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-24 text-center">
                                            <div className="max-w-xs mx-auto space-y-4">
                                                <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-300">
                                                    <Receipt className="w-8 h-8" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada riwayat transaksi ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {sales.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-transparent">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sales.from}-{sales.to} / {sales.total} TRANSAKSI</p>
                            <div className="flex gap-2">
                                {sales.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${link.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : link.url ? 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
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
