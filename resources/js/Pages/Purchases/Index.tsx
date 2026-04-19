import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { PageProps, PaginatedData } from '@/types';
import { Search, Plus, Eye, Package, Receipt, Calendar, User, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Purchase {
    id: number;
    reference_number: string;
    supplier_id: number | null;
    user_id: number;
    purchase_date: string;
    total_amount: string;
    supplier?: { id: number; name: string };
    user?: { id: number; name: string };
}

interface Props extends PageProps {
    purchases: PaginatedData<Purchase>;
    filters: { search?: string };
}

export default function PurchasesIndex() {
    const { purchases, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/purchases', { search }, { preserveState: true });
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Barang Masuk - Inventory" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Barang Masuk</h1>
                        <p className="text-sm font-semibold text-gray-400">Arsip pembelian stok dari Pemasok</p>
                    </div>
                    <Link
                        href="/purchases/create"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> TRANSAKSI BARU
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari Nomor Referensi / Supplier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-sm font-semibold text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </form>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 border-l border-gray-100 dark:border-gray-800 hidden md:flex">
                        <Receipt className="w-3.5 h-3.5" /> Total Records: {purchases.total}
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referensi</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pemasok</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operator</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Nilai Pembelian</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {purchases.data.length > 0 ? purchases.data.map((purchase) => (
                                    <tr 
                                        key={purchase.id} 
                                        className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all cursor-pointer group"
                                        onClick={() => router.get(`/purchases/${purchase.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{formatDate(purchase.purchase_date)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">{purchase.reference_number}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{purchase.supplier?.name || 'UMUM'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                                    {purchase.user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium">{purchase.user?.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{formatCurrency(purchase.total_amount)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
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
                                                    <Package className="w-8 h-8" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada catatan barang masuk ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {purchases.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-transparent">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{purchases.from}-{purchases.to} / {purchases.total} RECORDS</p>
                            <div className="flex gap-2">
                                {purchases.links.map((link, i) => (
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
