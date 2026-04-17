import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Search, RotateCcw, Eye, Calendar, User } from 'lucide-react';
import { useState } from 'react';

interface Props extends PageProps {
    returns: {
        data: any[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

export default function ReturnsIndex() {
    const { returns, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search || '');

    return (
        <AuthenticatedLayout>
            <Head title="Data Retur Barang" />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Retur</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Daftar pengembalian barang dan refund dana</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800/50 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800/50">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari No. Retur atau No. Invoice..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-orange-500/50"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-transparent text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800/50 text-left">
                                <tr>
                                    <th className="px-6 py-4">No. Retur</th>
                                    <th className="px-6 py-4">Invoice Asal</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Kasir</th>
                                    <th className="px-6 py-4 text-right">Total Refund</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                {returns.data.length > 0 ? returns.data.map((ret) => (
                                    <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <RotateCcw className="w-4 h-4 text-orange-500" />
                                                <span className="font-semibold text-gray-900 dark:text-white">{ret.return_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <Link href={route('sales.show', ret.sale_id)} className="hover:text-blue-500 underline underline-offset-4 decoration-dotted">
                                                {ret.sale?.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(ret.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                {ret.user?.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(Number(ret.total_refund))}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={route('returns.show', ret.id)}
                                                className="p-2 inline-flex rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                            Belum ada data retur yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
