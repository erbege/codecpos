import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { PageProps, PaginatedData } from '@/types';
import { Search, Plus, Eye, Package, ArrowRightLeft } from 'lucide-react';
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
            <Head title="Barang Masuk / Pembelian" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Barang Masuk</h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Log Pembelian & Restock Inventory</p>
                    </div>
                    <Link
                        href="/purchases/create"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
                    >
                        <Plus className="w-3.5 h-3.5" /> TRANSAKSI BARU
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari Nomor Referensi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </form>

                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Tanggal</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Referensi</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Pemasok</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Input Oleh</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Total Nilai</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.data.length > 0 ? purchases.data.map((purchase) => (
                                    <tr key={purchase.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">{formatDate(purchase.purchase_date)}</td>
                                        <td className="px-4 py-3 text-indigo-600 font-black uppercase tracking-tighter">{purchase.reference_number}</td>
                                        <td className="px-4 py-3 text-gray-900 dark:text-white font-bold uppercase tracking-tight">{purchase.supplier?.name || '-'}</td>
                                        <td className="px-4 py-3 text-gray-500 font-medium">{purchase.user?.name}</td>
                                        <td className="px-4 py-3 text-right font-black text-gray-900 dark:text-white tracking-tighter">{formatCurrency(purchase.total_amount)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/purchases/${purchase.id}`} className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 transition-colors">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center">
                                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400">Belum ada data barang masuk.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {purchases.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-transparent">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{purchases.from}-{purchases.to} / {purchases.total}</p>
                            <div className="flex gap-1">
                                {purchases.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1 rounded text-[10px] font-black transition-all ${link.active ? 'bg-indigo-500 text-white' : link.url ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-gray-300 cursor-not-allowed'}`}
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
