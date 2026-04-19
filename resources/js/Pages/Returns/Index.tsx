import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Search, RotateCcw, Eye, Calendar, User, Receipt, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Props extends PageProps {
    returns: {
        data: any[];
        links: any[];
        total: number;
        from: number;
        to: number;
        last_page: number;
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/returns', { search }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Retur - Inventory" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Riwayat Retur</h1>
                        <p className="text-sm font-semibold text-gray-400">Arsip pengembalian barang dan refund dana</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari No. Retur atau No. Invoice..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-sm font-semibold text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500/20"
                        />
                    </form>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 border-l border-gray-100 dark:border-gray-800 hidden md:flex">
                        <RotateCcw className="w-3.5 h-3.5" /> Total Retur: {returns.total}
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">No. Retur</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice Asal</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kasir</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total Refund</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {returns.data.length > 0 ? returns.data.map((ret) => (
                                    <tr 
                                        key={ret.id} 
                                        className="hover:bg-orange-50/30 dark:hover:bg-orange-500/5 transition-all cursor-pointer group"
                                        onClick={() => router.get(route('returns.show', ret.id))}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:rotate-180 transition-transform duration-700">
                                                    <RotateCcw className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{ret.return_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tighter">
                                                #{ret.sale?.invoice_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">{formatDate(ret.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                    {ret.user?.name?.charAt(0)}
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium">{ret.user?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-orange-600 dark:text-orange-400 tracking-tight">{formatCurrency(Number(ret.total_refund))}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-orange-500 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
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
                                                    <RotateCcw className="w-8 h-8" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic leading-relaxed">Belum ada riwayat pengembalian barang dicatat.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {returns.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-transparent">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{returns.from}-{returns.to} / {returns.total} RECORDS</p>
                            <div className="flex gap-2">
                                {returns.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${link.active ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : link.url ? 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
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
