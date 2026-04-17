import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    ShoppingCart, 
    Package,
    Database,
    BarChart3,
    Settings,
    LogOut,
    ArrowUpRight,
    Code,
    Activity
} from 'lucide-react';
import { PageProps } from '@/types';

export default function Portal() {
    const { auth } = usePage<PageProps>().props;

    const menus = [
        {
            name: 'POS Terminal',
            label: 'POS',
            desc: 'Real-time sales.',
            href: route('pos'),
            icon: ShoppingCart,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-500/20',
            ringColor: 'ring-indigo-500/20 hover:ring-indigo-500/50',
            glow: 'group-hover:shadow-indigo-500/10',
            gradient: 'from-indigo-500/5 via-transparent to-transparent'
        },
        {
            name: 'Inventory System',
            label: 'STOCK',
            desc: 'Inventory control.',
            href: route('products.index'),
            icon: Package,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-500/20',
            ringColor: 'ring-emerald-500/20 hover:ring-emerald-500/50',
            glow: 'group-hover:shadow-emerald-500/10',
            gradient: 'from-emerald-500/5 via-transparent to-transparent'
        },
        {
            name: 'Master Data',
            label: 'MASTER',
            desc: 'Users & Data.',
            href: route('customers.index'),
            icon: Database,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-500/20',
            ringColor: 'ring-blue-500/20 hover:ring-blue-500/50',
            glow: 'group-hover:shadow-blue-500/10',
            gradient: 'from-blue-500/5 via-transparent to-transparent'
        },
        {
            name: 'Business Reports',
            label: 'REPORTS',
            desc: 'Sales Analytics.',
            href: route('reports.index'),
            icon: BarChart3,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-500/20',
            ringColor: 'ring-purple-500/20 hover:ring-purple-500/50',
            glow: 'group-hover:shadow-purple-500/10',
            gradient: 'from-purple-500/5 via-transparent to-transparent'
        },
        {
            name: 'System Settings',
            label: 'CONFIG',
            desc: 'Preferences.',
            href: route('settings.index'),
            icon: Settings,
            color: 'text-slate-600',
            bgColor: 'bg-slate-50 dark:bg-slate-500/20',
            ringColor: 'ring-slate-500/20 hover:ring-slate-500/50',
            glow: 'group-hover:shadow-slate-500/10',
            gradient: 'from-slate-500/5 via-transparent to-transparent'
        }
    ];

    return (
        <GuestLayout maxWidth="max-w-6xl" showCard={false} showBranding={false}>
            <Head title="Portal" />

            <div className="h-screen max-h-screen overflow-hidden flex flex-col py-4 px-6 md:px-12 selection:bg-indigo-500/30">
                
                {/* 1. Ultra-Compact Top Bar */}
                <header className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-800/60 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform hover:rotate-6">
                            <Code className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-widest uppercase leading-none">
                            Codec<span className="text-indigo-600">POS</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                                    {auth.roles?.[0] || 'Administrator'}
                                </p>
                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                    {auth.user?.name}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 flex items-center justify-center font-black text-indigo-600 text-[10px] shadow-sm">
                                {auth.user?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors uppercase text-[9px] font-black tracking-[0.2em]"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Logout</span>
                        </Link>
                    </div>
                </header>

                {/* 2. Main Content: Optimized for Viewport Center */}
                <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full py-4">
                    <div className="mb-10 text-center animate-in fade-in duration-1000">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 mb-3 cursor-default">
                           <Activity className="w-3 h-3 text-emerald-500" />
                           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600">
                               System Online
                           </span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-3">
                            Launch <span className="text-indigo-600">Workspace</span>
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                            Control Center & Operational Access Hub
                        </p>
                    </div>

                    {/* Horizontal Balanced Grid (5 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {menus.map((menu, idx) => (
                            <Link
                                key={menu.name}
                                href={menu.href}
                                className={`group relative flex flex-col p-5 rounded-[1.5rem] bg-white dark:bg-slate-950 bg-gradient-to-br ${menu.gradient} ring-1 ${menu.ringColor} transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${menu.glow}`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className={`w-10 h-10 rounded-xl ${menu.bgColor} flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                    <menu.icon className={`w-5 h-5 ${menu.color}`} />
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] mb-1.5 flex items-center justify-between">
                                        {menu.label}
                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-1 translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                                    </h3>
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold leading-tight">
                                        {menu.desc}
                                    </p>
                                </div>

                                <div className="mt-6 flex items-end justify-between">
                                    <div className="w-12 h-0.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                        <div className={`h-full w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r ${menu.color.replace('text-', 'from-')}`} />
                                    </div>
                                    <span className="text-[8px] font-black text-slate-300 group-hover:text-indigo-500 transition-colors uppercase italic">v1.5</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>

                {/* 3. Subtle Floating Footer Details */}
                <footer className="py-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between animate-in fade-in duration-1000">
                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.3em]">
                        &copy; 2026 CODECPOS PROFESSIONAL • ALL RIGHTS RESERVED
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest italic">Connection Encrypted</span>
                        </div>
                    </div>
                </footer>
            </div>
        </GuestLayout>
    );
}
