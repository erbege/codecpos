import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    TrendingUp, 
    Download, 
    FileText, 
    Grid, 
    Tag, 
    CreditCard,
    ArrowLeft,
    Calendar,
    ChevronDown,
    Filter,
    Package,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

interface Props {
    data: {
        byProduct: Array<{
            product_name: string;
            total_qty: number;
            total_amount: number;
        }>;
        byCategory: Array<{
            category_name: string;
            total_qty: number;
            total_amount: number;
        }>;
        byPayment: Array<{
            payment_method: string;
            count: number;
            total_amount: number;
        }>;
    };
    filters: {
        date_from: string;
        date_to: string;
        outlet_id: number | string | null;
    };
    outlets: Array<{
        id: number;
        name: string;
    }>;
    auth: any;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Sales({ data, filters, outlets, auth }: Props) {
    const [activeTab, setActiveTab] = useState<'product' | 'category' | 'payment'>('product');

    const handleFilterChange = (key: string, value: string | number | null) => {
        router.get(route('reports.sales'), {
            ...filters,
            [key]: value
        }, { preserveState: true, preserveScroll: true });
    };

    const handleExport = (type: 'excel' | 'pdf') => {
        const url = type === 'excel' ? route('reports.sales.export.excel') : route('reports.sales.export.pdf');
        const params = new URLSearchParams({
            date_from: filters.date_from,
            date_to: filters.date_to,
            outlet_id: String(filters.outlet_id || '')
        });
        window.open(`${url}?${params.toString()}`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Penjualan" />

            <div className="space-y-6">
                {/* Header & Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('reports.index')} className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 transition-colors shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Laporan Penjualan</h1>
                            <p className="text-sm text-gray-500">Detail performa berdasarkan item, kategori, dan pembayaran</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => handleExport('excel')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                        >
                            <Download className="w-4 h-4" /> EXCEL
                        </button>
                        <button 
                            onClick={() => handleExport('pdf')}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-all shadow-md shadow-rose-500/20 active:scale-95"
                        >
                            <FileText className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="bg-transparent border-gray-200 dark:border-gray-800 rounded-lg text-[11px] font-bold focus:ring-0 dark:text-gray-300 px-2 py-1"
                            />
                            <span className="text-gray-400">s/d</span>
                            <input 
                                type="date" 
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                className="bg-transparent border-gray-200 dark:border-gray-800 rounded-lg text-[11px] font-bold focus:ring-0 dark:text-gray-300 px-2 py-1"
                            />
                        </div>
                    </div>

                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 hidden md:block" />

                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        <select 
                            value={filters.outlet_id || ''}
                            onChange={(e) => handleFilterChange('outlet_id', e.target.value)}
                            className="bg-transparent border-none text-[11px] font-bold focus:ring-0 p-0 text-gray-700 dark:text-gray-300 flex-1"
                        >
                            <option value="">Semua Outlet</option>
                            {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                    {/* Inner Navigation Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-800 p-1 bg-gray-50/50 dark:bg-gray-800/50">
                        <button 
                            onClick={() => setActiveTab('product')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                                ${activeTab === 'product' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                            `}
                        >
                            <Package className="w-4 h-4" /> Per Produk
                        </button>
                        <button 
                            onClick={() => setActiveTab('category')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                                ${activeTab === 'category' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                            `}
                        >
                            <Grid className="w-4 h-4" /> Per Kategori
                        </button>
                        <button 
                            onClick={() => setActiveTab('payment')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                                ${activeTab === 'payment' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                            `}
                        >
                            <CreditCard className="w-4 h-4" /> Metode Pembayaran
                        </button>
                    </div>

                    <div className="flex-1 p-6">
                        {activeTab === 'product' && (
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                                    <tr>
                                        <th className="px-4 py-4">Nama Produk</th>
                                        <th className="px-4 py-4 text-center">Jumlah Terjual</th>
                                        <th className="px-4 py-4 text-right">Total Pendapatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {data.byProduct.length > 0 ? data.byProduct.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                            <td className="px-4 py-4 font-bold text-gray-900 dark:text-white uppercase tracking-tight">{item.product_name}</td>
                                            <td className="px-4 py-4 text-center font-black text-gray-600 dark:text-gray-300">{item.total_qty} <span className="text-[10px] text-gray-400">PCS</span></td>
                                            <td className="px-4 py-4 text-right font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(Number(item.total_amount))}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="px-4 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'category' && (
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                                    <tr>
                                        <th className="px-4 py-4">Nama Kategori</th>
                                        <th className="px-4 py-4 text-center">Jumlah Terjual</th>
                                        <th className="px-4 py-4 text-right">Total Pendapatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {data.byCategory.length > 0 ? data.byCategory.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-4 py-4 font-bold text-gray-900 dark:text-white uppercase tracking-tight">{item.category_name}</td>
                                            <td className="px-4 py-4 text-center font-black text-gray-600 dark:text-gray-300">{item.total_qty} <span className="text-[10px] text-gray-400">PCS</span></td>
                                            <td className="px-4 py-4 text-right font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(item.total_amount))}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="px-4 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'payment' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.byPayment.length > 0 ? data.byPayment.map((item, idx) => (
                                    <div key={idx} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-indigo-500 transition-colors shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.count} Transaksi</span>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{item.payment_method}</h4>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{formatCurrency(Number(item.total_amount))}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center mt-auto">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Total Ringkasan : {formatCurrency(data[activeTab === 'product' ? 'byProduct' : activeTab === 'category' ? 'byCategory' : 'byPayment'].reduce((acc, curr) => acc + Number(curr.total_amount), 0))}
                        </div>
                        <p className="text-[9px] text-gray-400 italic">Data ini mencakup periode {filters.date_from} s/d {filters.date_to}</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
