import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps, DashboardStats, Sale, WeeklySale } from '@/types';
import {
    ShoppingCart,
    Package,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    Clock,
} from 'lucide-react';

interface DashboardPageProps extends PageProps {
    stats: DashboardStats;
    recentSales: Sale[];
    weeklySales: WeeklySale[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function Dashboard() {
    const { stats, recentSales, weeklySales } = usePage<DashboardPageProps>().props;

    const statCards = [
        {
            title: 'OMSET HARI INI',
            value: formatCurrency(stats.todaySalesTotal),
            subtitle: `${stats.todaySalesCount} TRANSAKSI`,
            icon: TrendingUp,
            gradient: 'from-indigo-500 to-indigo-600',
            shadow: 'shadow-indigo-500/10',
        },
        {
            title: 'TOTAL PRODUK',
            value: stats.totalProducts.toString(),
            subtitle: 'KATALOG AKTIF',
            icon: Package,
            gradient: 'from-slate-700 to-slate-800',
            shadow: 'shadow-slate-500/10',
        },
        {
            title: 'STOK RENDAH',
            value: stats.lowStockProducts.toString(),
            subtitle: 'PERLU RESTOCK',
            icon: AlertTriangle,
            gradient: stats.lowStockProducts > 0 ? 'from-red-500 to-red-600' : 'from-emerald-500 to-emerald-600',
            shadow: stats.lowStockProducts > 0 ? 'shadow-red-500/10' : 'shadow-emerald-500/10',
        },
        {
            title: 'VOLUME SALES',
            value: stats.todaySalesCount.toString(),
            subtitle: 'ORDER HARI INI',
            icon: ShoppingCart,
            gradient: 'from-blue-600 to-indigo-700',
            shadow: 'shadow-blue-500/10',
        },
    ];

    // Simple bar chart data
    const maxSale = Math.max(...(weeklySales.map((s) => Number(s.total)) || [1]), 1);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Executive Dashboard</h1>
                    <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Ringkasan Performa & Operasional Toko</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card) => (
                        <div
                            key={card.title}
                            className={`relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm ${card.shadow}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{card.title}</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white">{card.value}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{card.subtitle}</p>
                                </div>
                                <div className={`w-9 h-9 rounded bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                                    <card.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br ${card.gradient} opacity-5 blur-xl`} />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Weekly chart */}
                    <div className="lg:col-span-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Penjualan 7 Hari</h3>
                        </div>
                        {weeklySales && weeklySales.length > 0 ? (
                            <div className="flex items-end gap-1.5 h-36 pt-6 px-1">
                                {weeklySales.map((day) => {
                                    const amount = Number(day.total || 0);
                                    const height = maxSale > 0 ? Math.max((amount / maxSale) * 100, 2) : 2;
                                    const dayName = new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' });
                                    
                                    return (
                                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full h-full flex items-end justify-center group relative pt-2">
                                                {/* Bar Rail (Subtle background) */}
                                                <div className="absolute inset-0 w-full max-w-[24px] mx-auto bg-gray-50 dark:bg-gray-800/50 rounded-t sm:rounded-t-md -z-0" />
                                                
                                                {/* Actual Bar */}
                                                <div
                                                    className={`w-full max-w-[24px] rounded-t sm:rounded-t-md transition-all duration-700 cursor-pointer relative z-10
                                                        ${amount > 0 ? 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_-4px_12px_rgba(99,102,241,0.2)]' : 'bg-gray-100 dark:bg-gray-800'}
                                                    `}
                                                    style={{ height: `${height}%` }}
                                                />
                                                
                                                {/* Tooltip */}
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-900 text-white text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 shadow-xl border border-gray-700 translate-y-2 group-hover:translate-y-0">
                                                    {formatCurrency(amount)}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{dayName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-36 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700">
                                <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Belum Ada Data</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Sales */}
                    <div className="lg:col-span-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Transaksi Terbaru</h3>
                            <a
                                href="/sales"
                                className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors uppercase tracking-widest"
                            >
                                SEMUA SALES <ArrowUpRight className="w-3 h-3" />
                            </a>
                        </div>
                        {recentSales.length > 0 ? (
                            <div className="space-y-3">
                                {recentSales.slice(0, 6).map((sale) => (
                                    <div
                                        key={sale.id}
                                        className="flex items-center justify-between p-2.5 rounded bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors border border-gray-100 dark:border-gray-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                <Receipt className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{sale.invoice_number}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {formatDate(sale.created_at).toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-indigo-600">{formatCurrency(Number(sale.total))}</p>
                                            <span className={`text-[9px] font-black uppercase px-1.5 rounded inline-block mt-0.5 tracking-tighter
                                                ${sale.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                  sale.status === 'voided' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                                                  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'}`}>
                                                {sale.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                                <div className="text-center">
                                    <Receipt className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                    Belum ada transaksi
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Receipt(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
            <path d="M14 8H8" /><path d="M16 12H8" /><path d="M13 16H8" />
        </svg>
    );
}
