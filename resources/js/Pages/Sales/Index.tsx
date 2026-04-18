import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps, Sale, PaginatedData } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { Search, Eye, Ban, Receipt, Calendar } from 'lucide-react';
import { useState } from 'react';

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

const statusColor: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    voided: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    refunded: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
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
            message: `Apakah Anda yakin ingin membatalkan transaksi ${sale.invoice_number}? Stok barang akan dikembalikan secara otomatis dan status transaksi akan berubah menjadi VOID.`,
            confirmLabel: 'Ya, Void Transaksi',
            type: 'danger',
            onConfirm: () => {
                router.post(`/sales/${sale.id}/void`);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Penjualan" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Riwayat Transaksi</h1>
                    <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Arsip Penjualan & Laporan Aktivitas</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari Nomor Invoice..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </form>
                    {outlets && (
                        <select
                            onChange={(e) => handleFilter({ outlet_id: e.target.value || undefined })}
                            defaultValue={filters.outlet_id || ''}
                            className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[140px]"
                        >
                            <option value="">SEMUA CABANG</option>
                            {outlets.map(o => <option key={o.id} value={o.id}>{o.name.toUpperCase()}</option>)}
                        </select>
                    )}
                    <select
                        onChange={(e) => handleFilter({ status: e.target.value || undefined })}
                        defaultValue={filters.status || ''}
                        className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[140px]"
                    >
                        <option value="">STATUS: SEMUA</option>
                        <option value="completed">COMPLETED</option>
                        <option value="voided">VOIDED</option>
                        <option value="refunded">REFUNDED</option>
                    </select>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            defaultValue={filters.date_from || ''}
                            onChange={(e) => handleFilter({ date_from: e.target.value || undefined })}
                            className="px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                            type="date"
                            defaultValue={filters.date_to || ''}
                            onChange={(e) => handleFilter({ date_to: e.target.value || undefined })}
                            className="px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Invoice</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Cabang</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Kasir</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Pembayaran</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Total</th>
                                    <th className="text-center px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Tanggal</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.data.length > 0 ? sales.data.map((sale) => (
                                    <tr key={sale.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-black tracking-tighter uppercase">{sale.invoice_number}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                                {(sale as any).outlet?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-medium">{sale.user?.name}</td>
                                        <td className="px-4 py-3 text-gray-500 font-medium">{sale.customer?.name || 'UMUM'}</td>
                                        <td className="px-4 py-3 text-gray-500 font-black uppercase tracking-tighter">{paymentLabel[sale.payment_method]}</td>
                                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-black">{formatCurrency(Number(sale.total))}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${statusColor[sale.status]}`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 font-bold uppercase tracking-widest text-[10px]">{formatDate(sale.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/sales/${sale.id}`}
                                                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                                {sale.status === 'completed' && (
                                                    <button
                                                        onClick={() => handleVoid(sale)}
                                                        className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 transition-colors"
                                                    >
                                                        <Ban className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-16 text-center">
                                            <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400">Belum ada transaksi</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {sales.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-transparent">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {sales.from}-{sales.to} / {sales.total} TRANSAKSI
                            </p>
                            <div className="flex gap-1">
                                {sales.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded text-[10px] font-black transition-all
                                            ${link.active ? 'bg-indigo-500 text-white' : link.url ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
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
