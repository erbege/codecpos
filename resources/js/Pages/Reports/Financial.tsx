import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    DollarSign, 
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Activity,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    FileText,
    Percent,
    ShoppingCart,
    Package
} from 'lucide-react';

interface Props {
    data: {
        revenue: number;
        cogs: number;
        grossProfit: number;
        margin: number;
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

export default function Financial({ data, filters, outlets, auth }: Props) {
    
    const handleFilterChange = (key: string, value: string | number | null) => {
        router.get(route('reports.financial'), {
            ...filters,
            [key]: value
        }, { preserveState: true, preserveScroll: true });
    };

    const profitMetrics = [
        {
            label: 'Total Pendapatan (Revenue)',
            value: data.revenue,
            desc: 'Total kotor dari seluruh transaksi selesai',
            icon: TrendingUp,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-500/10'
        },
        {
            label: 'Harga Pokok Penjualan (COGS)',
            value: data.cogs,
            desc: 'Total modal/biaya pengadaan barang terjual',
            icon: Package,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50 dark:bg-rose-500/10'
        },
        {
            label: 'Laba Kotor (Gross Profit)',
            value: data.grossProfit,
            desc: 'Pendapatan dikurangi biaya modal barang',
            icon: DollarSign,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-500/10'
        },
        {
            label: 'Profit Margin',
            value: data.margin,
            isPercent: true,
            desc: 'Persentase keuntungan dari total pendapatan',
            icon: Percent,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-500/10'
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Keuangan" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('reports.index')} className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 transition-colors shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Laporan Keuangan</h1>
                            <p className="text-sm text-gray-500">Analisis Laba Rugi dan Efisiensi Bisnis</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md active:scale-95">
                            <Download className="w-4 h-4" /> EXCEL
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-all shadow-md active:scale-95">
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

                {/* Profit Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {profitMetrics.map((metric) => (
                        <div key={metric.label} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center ${metric.color}`}>
                                    <metric.icon className="w-6 h-6" />
                                </div>
                                {metric.label.includes('Gross Profit') && (
                                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                                        Sehat <Activity className="w-3 h-3" />
                                    </span>
                                )}
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{metric.label}</h3>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {metric.isPercent ? `${metric.value}%` : formatCurrency(metric.value)}
                                    </p>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 italic leading-relaxed">{metric.desc}</p>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800/10 group-hover:scale-110 transition-transform" />
                        </div>
                    ))}
                </div>

                {/* Visual Summary */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Analisis Laba Rugi</h2>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Berdasarkan periode terpilih, bisnis Anda menghasilkan margin keuntungan kotor sebesar 
                                    <span className="font-black text-indigo-600 mx-1">{data.margin}%</span>. 
                                    Ini berarti dari setiap rupiah pendapatan, Anda menyimpan {Math.round(data.margin)} sen sebagai laba setelah dikurangi modal barang.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-gray-400">Struktur Biaya (COGS)</span>
                                        <span className="text-rose-600">{Math.round((data.cogs / data.revenue) * 100) || 0}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-rose-500 transition-all duration-1000" 
                                            style={{ width: `${(data.cogs / data.revenue) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-gray-400">Margin Laba Kotor</span>
                                        <span className="text-emerald-600">{data.margin}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 transition-all duration-1000" 
                                            style={{ width: `${data.margin}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-64 h-64 bg-gray-50 dark:bg-gray-800/50 rounded-full flex flex-col items-center justify-center border-8 border-white dark:border-gray-900 shadow-inner group relative">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Laba</p>
                                <p className="text-lg font-black text-indigo-600">{formatCurrency(data.grossProfit)}</p>
                            </div>
                            {/* Decorative ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                    className="text-gray-100 dark:text-gray-800"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="110"
                                    cx="128"
                                    cy="128"
                                />
                                <circle
                                    className="text-indigo-600 transition-all duration-1000"
                                    strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 110}
                                    strokeDashoffset={2 * Math.PI * 110 * (1 - data.margin / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="110"
                                    cx="128"
                                    cy="128"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
