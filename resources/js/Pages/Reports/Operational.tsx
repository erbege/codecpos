import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    BarChart3, 
    ArrowLeft,
    Calendar,
    Filter,
    TrendingUp,
    ShoppingCart,
    Tag,
    Receipt,
    Target,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    PieChart as PieChartIcon,
    DollarSign
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar 
} from 'recharts';

interface Props {
    data: {
        summary: {
            total_transactions: number;
            net_sales: number;
            total_tax: number;
            total_discount: number;
            void_count: number;
            avg_transaction_value: number;
        };
        byStatus: Array<{
            status: string;
            count: number;
            amount: number;
        }>;
        daily: Array<{
            date: string;
            transactions: number;
            tax: number;
            discount: number;
            sales: number;
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

const CHART_COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981'];

export default function Operational({ data, filters, outlets, auth }: Props) {
    const handleFilterChange = (key: string, value: string | number | null) => {
        router.get(route('reports.operational'), {
            ...filters,
            [key]: value
        }, { preserveState: true, preserveScroll: true });
    };

    const statusPieData = data.byStatus.map(item => ({
        name: item.status.toUpperCase(),
        value: item.count
    }));

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Operasional" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('reports.index')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 transition-all shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Laporan Operasional</h1>
                            <p className="text-sm font-semibold text-gray-400">Analisis pajak, diskon, dan kinerja transaksi</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <input 
                                type="date" 
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="bg-transparent border-none text-[12px] font-bold focus:ring-0 p-0 dark:text-gray-300"
                            />
                            <span className="text-gray-300">to</span>
                            <input 
                                type="date" 
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                className="bg-transparent border-none text-[12px] font-bold focus:ring-0 p-0 dark:text-gray-300"
                            />
                        </div>

                        {auth.user.role === 'admin' && (
                            <select 
                                value={filters.outlet_id || ''}
                                onChange={(e) => handleFilterChange('outlet_id', e.target.value)}
                                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl text-[12px] font-bold focus:ring-indigo-500 min-w-[150px]"
                            >
                                <option value="">Semua Outlet</option>
                                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Total Pajak (PPN)</p>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                            {formatCurrency(Number(data.summary.total_tax || 0))}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <Tag className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Total Diskon</p>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                            {formatCurrency(Number(data.summary.total_discount || 0))}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Target className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Avg. Transaction</p>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                            {formatCurrency(Number(data.summary.avg_transaction_value || 0))}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Voided Sales</p>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                            {data.summary.void_count || 0} <span className="text-[11px] text-gray-400">Order</span>
                        </h3>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">Analisis Pajak & Diskon</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={data.daily}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 'bold' }} 
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} tickFormatter={(val) => `${val/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} 
                                    />
                                    <Bar dataKey="tax" name="Pajak" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="discount" name="Diskon" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">Status Transaksi</h3>
                        <div className="flex-1 w-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={statusPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {statusPieData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                    <span className="text-xs font-bold text-gray-500 uppercase">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table Breakdown */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Rincian Operasional Harian</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4 text-center">Transaksi</th>
                                    <th className="px-6 py-4 text-right">Pajak</th>
                                    <th className="px-6 py-4 text-right">Diskon</th>
                                    <th className="px-6 py-4 text-right font-black text-indigo-600">Net Sales</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {data.daily.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">
                                            {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-600 dark:text-gray-400">{item.transactions}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-600 dark:text-gray-400">{formatCurrency(Number(item.tax))}</td>
                                        <td className="px-6 py-4 text-right font-medium text-orange-600 dark:text-orange-400">-{formatCurrency(Number(item.discount))}</td>
                                        <td className="px-6 py-4 text-right font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(Number(item.sales))}</td>
                                    </tr>
                                ))}
                                {data.daily.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Belum ada data operasional</td>
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
