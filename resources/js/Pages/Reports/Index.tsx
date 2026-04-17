import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    BarChart3, 
    TrendingUp, 
    Package, 
    DollarSign, 
    Calendar, 
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingCart,
    CreditCard,
    PieChart,
    ChevronRight,
    Search,
    Download,
    History
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

interface Props {
    summary: {
        sales: {
            total_orders: number;
            gross_sales: number;
            total_discount: number;
            total_tax: number;
        };
        inventory: {
            totalValue: number;
            lowStockCount: number;
        };
    };
    chartData: Array<{
        date: string;
        amount: number;
    }>;
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

export default function Index({ summary, chartData, filters, outlets, auth }: Props) {
    
    const handleFilterChange = (key: string, value: string | number | null) => {
        router.get(route('reports.index'), {
            ...filters,
            [key]: value
        }, { preserveState: true, preserveScroll: true });
    };

    const reportCards = [
        {
            title: 'Laporan Penjualan',
            desc: 'Analisis produk terlaris, kategori, dan metode pembayaran.',
            icon: TrendingUp,
            href: route('reports.sales'),
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-500/10'
        },
        {
            title: 'Stok & Inventori',
            desc: 'Status stok saat ini dan riwayat mutasi barang.',
            icon: Package,
            href: route('reports.inventory'),
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-500/10'
        },
        {
            title: 'Laporan Keuangan',
            desc: 'Ringkasan Laba Rugi, Arus Kas dan nilai aset.',
            icon: DollarSign,
            href: route('reports.financial'),
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-500/10'
        },
        {
            title: 'Laporan Operasional',
            desc: 'Rincian pajak, diskon, dan kinerja operasional.',
            icon: BarChart3,
            href: route('reports.index'), // Placeholder
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-500/10'
        },
        {
            title: 'Riwayat Shift',
            desc: 'Audit trail pergantian kasir dan selisih uang kas laci.',
            icon: History,
            href: route('reports.shifts'),
            color: 'text-rose-600',
            bgColor: 'bg-rose-50 dark:bg-rose-500/10'
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Pusat Laporan" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Pusat Laporan</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Statistik dan insight performa bisnis Anda</p>
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

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative group hover:border-indigo-500 transition-colors">
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Penjualan</p>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(summary.sales.gross_sales || 0)}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-indigo-50 dark:bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative group hover:border-emerald-500 transition-colors">
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Transaksi</p>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">{summary.sales.total_orders || 0}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-emerald-50 dark:bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative group hover:border-amber-500 transition-colors">
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nilai Inventori</p>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(summary.inventory.totalValue || 0)}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Package className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-amber-50 dark:bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative group hover:border-red-500 transition-colors">
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stok Menipis</p>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">{summary.inventory.lowStockCount || 0} Item</h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600">
                                <ArrowDownRight className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-red-50 dark:bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
                    </div>
                </div>

                {/* Main Insight Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales Trend Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Trend Penjualan</h3>
                                <p className="text-[10px] text-gray-500">Akumulasi pendapatan harian</p>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400">
                                <TrendingUp className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="h-72 w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
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
                                            contentStyle={{ 
                                                borderRadius: '12px', 
                                                border: 'none', 
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                backgroundColor: '#fff'
                                            }} 
                                            formatter={(val: number) => [formatCurrency(val), 'Penjualan']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="amount" 
                                            stroke="#4f46e5" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorSales)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                    Belum ada data periode ini
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Cards */}
                    <div className="space-y-4">
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg shadow-indigo-500/30">
                            <h3 className="text-lg font-black uppercase mb-1 relative z-10">Explore Laporan</h3>
                            <p className="text-indigo-100 text-xs mb-6 relative z-10 leading-relaxed">Pilih kategori untuk melihat data lebih detail dan melakukan ekspor PDF/Excel.</p>
                            <Link 
                                href={route('reports.sales')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-colors relative z-10"
                            >
                                Mulai Sekarang <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                            <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10" />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {reportCards.map((report) => (
                                <Link
                                    key={report.title}
                                    href={report.href}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 group transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-xl ${report.bgColor} flex items-center justify-center ${report.color} group-hover:scale-110 transition-transform shadow-sm`}>
                                        <report.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{report.title}</h4>
                                        <p className="text-[10px] text-gray-500 line-clamp-1">{report.desc}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
