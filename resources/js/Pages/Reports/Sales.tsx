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
    ArrowDownRight,
    MousePointer2,
    PieChart as PieChartIcon,
    BarChart3
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
        dailyTrend: Array<{
            date: string;
            amount: number;
        }>;
        summary: {
            total_sales: number;
            prev_total_sales: number;
            growth: number;
            is_up: boolean;
        };
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

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Sales({ data, filters, outlets, auth }: Props) {
    const [activeTab, setActiveTab] = useState<'product' | 'category' | 'payment'>('product');
    const [showChart, setShowChart] = useState(true);

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

    // Prepare data for Top 5 Products Chart
    const topProductsData = data.byProduct.slice(0, 5).map(item => ({
        name: item.product_name.length > 15 ? item.product_name.substring(0, 15) + '...' : item.product_name,
        amount: Number(item.total_amount)
    }));

    // Prepare data for Categories Pie Chart
    const categoryPieData = data.byCategory.map(item => ({
        name: item.category_name,
        value: Number(item.total_amount)
    }));

    // Prepare data for Payment Bar Chart
    const paymentBarData = data.byPayment.map(item => ({
        name: item.payment_method,
        amount: Number(item.total_amount)
    }));

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Penjualan" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header & Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('reports.index')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 transition-all shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Laporan Penjualan</h1>
                            <p className="text-sm font-semibold text-gray-400">Analisis performa & tren pendapatan</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button 
                            onClick={() => handleExport('excel')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Download className="w-4 h-4" /> EXCEL
                        </button>
                        <button 
                            onClick={() => handleExport('pdf')}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
                        >
                            <FileText className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>

                {/* Growth & Quick Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                        <div className="flex-1 w-full">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Penjualan Periode Ini</p>
                            <div className="flex items-end gap-3">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{formatCurrency(data.summary.total_sales)}</h2>
                                <div className={`flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${data.summary.is_up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                                    {data.summary.is_up ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                    {Math.abs(data.summary.growth)}%
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 font-semibold mt-2 italic">
                                Dibandingkan periode sebelumnya: {formatCurrency(data.summary.prev_total_sales)}
                            </p>
                        </div>
                        <div className="w-px h-12 bg-gray-100 dark:bg-gray-800 hidden md:block" />
                        <div className="flex-1 w-full">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tren Penjualan Harian</p>
                            <div className="h-16 w-full">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <AreaChart data={data.dailyTrend}>
                                        <defs>
                                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorTrend)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Filter Aktif</p>
                            <div className="space-y-3 mt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-indigo-200" />
                                    <div className="flex items-center gap-1.5 flex-1">
                                        <input type="date" value={filters.date_from} onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                            className="bg-indigo-500/30 border-none rounded-lg text-xs font-black text-white px-2 py-1 w-full focus:ring-1 focus:ring-white/50" />
                                        <span className="text-indigo-300 text-xs">TO</span>
                                        <input type="date" value={filters.date_to} onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                            className="bg-indigo-500/30 border-none rounded-lg text-xs font-black text-white px-2 py-1 w-full focus:ring-1 focus:ring-white/50" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Filter className="w-4 h-4 text-indigo-200" />
                                    <select value={filters.outlet_id || ''} onChange={(e) => handleFilterChange('outlet_id', e.target.value)}
                                        className="bg-indigo-500/30 border-none rounded-lg text-xs font-black text-white px-2 py-1 w-full focus:ring-1 focus:ring-white/50">
                                        <option value="" className="text-gray-900">SEMUA OUTLET</option>
                                        {outlets.map(o => <option key={o.id} value={o.id} className="text-gray-900">{o.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 text-indigo-500/20 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                    {/* Inner Navigation Tabs */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-1 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex">
                            <button 
                                onClick={() => setActiveTab('product')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                                    ${activeTab === 'product' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                                `}
                            >
                                <Package className="w-4 h-4" /> Per Produk
                            </button>
                            <button 
                                onClick={() => setActiveTab('category')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                                    ${activeTab === 'category' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                                `}
                            >
                                <Grid className="w-4 h-4" /> Per Kategori
                            </button>
                            <button 
                                onClick={() => setActiveTab('payment')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                                    ${activeTab === 'payment' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                                `}
                            >
                                <CreditCard className="w-4 h-4" /> Metode Pembayaran
                            </button>
                        </div>
                        <div className="px-4">
                            <button 
                                onClick={() => setShowChart(!showChart)}
                                className={`p-2 rounded-lg border transition-all ${showChart ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400'}`}
                                title="Toggle Visualisasi Grafik"
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col lg:flex-row gap-8">
                        {/* Table Section */}
                        <div className={`transition-all duration-500 ${showChart ? 'lg:w-[60%]' : 'w-full'}`}>
                            {activeTab === 'product' && (
                                <table className="w-full text-xs text-left">
                                    <thead className="text-xs uppercase font-black text-gray-500 tracking-wider bg-gray-50/50 dark:bg-gray-800/50">
                                        <tr>
                                            <th className="px-4 py-4 rounded-l-xl">Nama Produk</th>
                                            <th className="px-4 py-4 text-center">Terjual</th>
                                            <th className="px-4 py-4 text-right rounded-r-xl">Omzet</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {data.byProduct.length > 0 ? data.byProduct.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                                <td className="px-4 py-4 font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{item.product_name}</td>
                                                <td className="px-4 py-4 text-center font-bold text-gray-600 dark:text-gray-400 text-sm">{item.total_qty} <span className="text-xs text-gray-500 font-medium ml-1">PCS</span></td>
                                                <td className="px-4 py-4 text-right font-black text-indigo-600 dark:text-indigo-400 text-sm">{formatCurrency(Number(item.total_amount))}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="px-4 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'category' && (
                                <table className="w-full text-xs text-left">
                                    <thead className="text-xs uppercase font-black text-gray-500 tracking-wider bg-gray-50/50 dark:bg-gray-800/50">
                                        <tr>
                                            <th className="px-4 py-4 rounded-l-xl">Nama Kategori</th>
                                            <th className="px-4 py-4 text-center">Terjual</th>
                                            <th className="px-4 py-4 text-right rounded-r-xl">Omzet</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {data.byCategory.length > 0 ? data.byCategory.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                                <td className="px-4 py-4 font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{item.category_name}</td>
                                                <td className="px-4 py-4 text-center font-bold text-gray-600 dark:text-gray-400 text-sm">{item.total_qty} <span className="text-xs text-gray-500 font-medium ml-1">PCS</span></td>
                                                <td className="px-4 py-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(Number(item.total_amount))}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="px-4 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'payment' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.byPayment.length > 0 ? data.byPayment.map((item, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-indigo-500 transition-colors shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-indigo-600 shadow-sm">
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.count} Transaksi</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{item.payment_method}</h4>
                                                <p className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(Number(item.total_amount))}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Chart Section */}
                        {showChart && (
                            <div className="flex-1 min-h-[350px] bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-6 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-2 mb-6">
                                    {activeTab === 'product' && <><TrendingUp className="w-4 h-4 text-indigo-500" /><h3 className="text-xs font-bold uppercase text-gray-500">Top 5 Produk (Omzet)</h3></>}
                                    {activeTab === 'category' && <><PieChartIcon className="w-4 h-4 text-emerald-500" /><h3 className="text-xs font-bold uppercase text-gray-500">Distribusi Kategori</h3></>}
                                    {activeTab === 'payment' && <><BarChart3 className="w-4 h-4 text-amber-500" /><h3 className="text-xs font-bold uppercase text-gray-500">Volume Pembayaran</h3></>}
                                </div>

                                <div className="flex-1 w-full min-h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        {activeTab === 'product' ? (
                                            <BarChart data={topProductsData} layout="vertical" margin={{ left: 20 }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fontWeight: '600' }} />
                                                <Tooltip 
                                                    cursor={{ fill: 'transparent' }} 
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) return (
                                                            <div className="bg-slate-900 text-white p-2 rounded-lg text-xs font-bold shadow-xl border border-white/10">
                                                                {formatCurrency(payload[0].value as number)}
                                                            </div>
                                                        );
                                                        return null;
                                                    }}
                                                />
                                                <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                            </BarChart>
                                        ) : activeTab === 'category' ? (
                                            <PieChart>
                                                <Pie
                                                    data={categoryPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {categoryPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) return (
                                                            <div className="bg-slate-900 text-white p-2 rounded-lg text-xs font-bold shadow-xl border border-white/10">
                                                                {payload[0].name}: {formatCurrency(payload[0].value as number)}
                                                            </div>
                                                        );
                                                        return null;
                                                    }}
                                                />
                                            </PieChart>
                                        ) : (
                                            <BarChart data={paymentBarData} margin={{ top: 20, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                                <Tooltip 
                                                    cursor={{ fill: '#f1f5f9' }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) return (
                                                            <div className="bg-slate-900 text-white p-2 rounded-lg text-xs font-bold shadow-xl border border-white/10">
                                                                {formatCurrency(payload[0].value as number)}
                                                            </div>
                                                        );
                                                        return null;
                                                    }}
                                                />
                                                <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>

                                {activeTab === 'category' && (
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        {categoryPieData.slice(0, 6).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                                <span className="text-xs font-bold text-gray-600 truncate max-w-[80px]">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
