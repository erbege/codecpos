import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { PageProps, DashboardStats, Sale, WeeklySale } from '@/types';
import {
    ShoppingCart,
    Package,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    Clock,
    Receipt,
    Wallet,
    ArrowRight
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
            title: 'Omzet Hari Ini',
            value: formatCurrency(stats.todaySalesTotal),
            subtitle: `${stats.todaySalesCount} Transaksi Selesai`,
            icon: Wallet,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 dark:bg-indigo-500/10',
            border: 'border-indigo-100 dark:border-indigo-500/20',
        },
        {
            title: 'Total Produk',
            value: stats.totalProducts.toLocaleString(),
            subtitle: 'Katalog Produk Aktif',
            icon: Package,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            border: 'border-amber-100 dark:border-amber-500/20',
        },
        {
            title: 'Stok Terbatas',
            value: stats.lowStockProducts.toLocaleString(),
            subtitle: 'Produk di bawah limit',
            icon: AlertTriangle,
            color: stats.lowStockProducts > 0 ? 'text-rose-600' : 'text-emerald-600',
            bg: stats.lowStockProducts > 0 ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10',
            border: stats.lowStockProducts > 0 ? 'border-rose-100 dark:border-rose-500/20' : 'border-emerald-100 dark:border-emerald-500/20',
        },
        {
            title: 'Volume Order',
            value: stats.todaySalesCount.toLocaleString(),
            subtitle: 'Pesanan Hari Ini',
            icon: ShoppingCart,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            border: 'border-blue-100 dark:border-blue-500/20',
        },
    ];

    const maxSale = Math.max(...(weeklySales?.map((s) => Number(s.total)) || [0]), 1);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Executive Dashboard</h1>
                        <p className="text-sm font-semibold text-gray-400 mt-1">Selamat datang kembali! Berikut ringkasan performa hari ini.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card) => (
                        <div
                            key={card.title}
                            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border ${card.border} p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 shadow-sm`}
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{card.title}</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{card.value}</p>
                                    <p className="text-[10px] text-gray-400 font-semibold">{card.subtitle}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                    {/* Weekly chart */}
                    <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Performa Mingguan</h3>
                                <p className="text-[10px] text-gray-400 font-medium">Omzet 7 hari terakhir</p>
                            </div>
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        
                        {weeklySales && weeklySales.length > 0 ? (
                            <div className="flex-1 flex items-end gap-2 h-48 pt-4">
                                {weeklySales.map((day) => {
                                    const amount = Number(day.total || 0);
                                    const height = maxSale > 0 ? Math.max((amount / maxSale) * 100, 4) : 4;
                                    const dayName = new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' });
                                    
                                    return (
                                        <div key={day.date} className="flex-1 flex flex-col items-center gap-3 group relative h-full">
                                            <div className="flex-1 w-full flex items-end justify-center relative">
                                                {/* Bar Track */}
                                                <div className="absolute inset-0 w-full max-w-[28px] mx-auto bg-gray-50 dark:bg-gray-800/30 rounded-t-lg" />
                                                
                                                {/* Tooltip */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 shadow-2xl border border-white/5 scale-90 group-hover:scale-100">
                                                    {formatCurrency(amount)}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                                </div>

                                                {/* Bar */}
                                                <div
                                                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-1000 ease-out cursor-pointer relative z-10
                                                        ${amount > 0 ? 'bg-indigo-500 group-hover:bg-indigo-400 shadow-[0_-4px_15px_rgba(99,102,241,0.2)]' : 'bg-gray-200 dark:bg-gray-800'}
                                                    `}
                                                    style={{ height: `${height}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate w-full text-center">{dayName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700">
                                <TrendingUp className="w-10 h-10 mb-2 opacity-10" />
                                <p className="text-[10px] font-bold uppercase tracking-widest italic">Belum tersedia data transaksi</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Sales List */}
                    <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aktivitas Transaksi</h3>
                                <p className="text-[10px] text-gray-400 font-medium">Daftar penjualan terbaru</p>
                            </div>
                            <Link
                                href="/sales"
                                className="group px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all uppercase tracking-widest flex items-center gap-2"
                            >
                                Lihat Semua <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {recentSales.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {recentSales.slice(0, 5).map((sale) => (
                                    <div
                                        key={sale.id}
                                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:px-2 -mx-2 rounded-xl transition-all hover:bg-gray-50/50 dark:hover:bg-gray-800/30 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm text-gray-400 group-hover:text-indigo-500">
                                                <Receipt className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{sale.invoice_number}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold uppercase">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(sale.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{formatCurrency(Number(sale.total))}</p>
                                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter mt-1
                                                ${sale.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                  sale.status === 'voided' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                                  'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'}`}>
                                                {sale.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic">
                                <Receipt className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-xs font-semibold">Tidak ada aktivitas transaksi terbaru.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
