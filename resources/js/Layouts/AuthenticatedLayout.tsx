import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    FolderTree,
    Home,
    Users,
    Receipt,
    ChevronLeft,
    LogOut,
    User,
    Menu,
    X,
    Code,
    Sun,
    Moon,
    Settings,
    RotateCcw,
    Shield,
    Store,
    Clock,
    ClipboardList,
    BarChart3,
} from 'lucide-react';
import { PropsWithChildren, useState, useEffect } from 'react';
import { PageProps } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { Toaster, toast } from 'sonner';
import GlobalDialog from '@/Components/GlobalDialog';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    permission?: string;
    active?: boolean;
}

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps>().props;
    const { sidebarOpen, setSidebarOpen, theme, setTheme } = useAppStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const currentUrl = window.location.pathname;

    // Handle Toast notifications via flash messages
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, {
                className: 'rounded-xl font-bold border-l-4 border-emerald-500 shadow-xl',
                duration: 4000
            });
        }
        if (flash.error) {
            toast.error(flash.error, {
                className: 'rounded-xl font-bold border-l-4 border-red-500 shadow-xl',
                duration: 5000
            });
        }
    }, [flash.success, flash.error]);

    const can = (permission: string) => {
        return auth.permissions?.includes(permission);
    };

    interface NavGroup {
        title: string;
        items: NavItem[];
    }

    const navGroups: NavGroup[] = [
        {
            title: 'Utama',
            items: [
                { name: 'Portal Beranda', href: '/portal', icon: Home, permission: 'dashboard.read' },
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard.read' },
            ],
        },
        {
            title: 'POS',
            items: [
                { name: 'POS Kasir', href: '/pos', icon: ShoppingCart, permission: 'sales.create' },
                { name: 'Shift Kasir', href: '/shifts', icon: Clock, permission: 'sales.create' },
            ].filter((item) => !item.permission || can(item.permission)),
        },
        {
            title: 'Inventory',
            items: [
                { name: 'Produk', href: '/products', icon: Package, permission: 'products.read' },
                { name: 'Kategori', href: '/categories', icon: FolderTree, permission: 'categories.read' },
                { name: 'Stock Opname', href: '/inventory/adjustment', icon: ClipboardList, permission: 'products.update' },
                { name: 'Barang Masuk', href: '/purchases', icon: Package, permission: 'stock.read' },
            ].filter((item) => !item.permission || can(item.permission)),
        },
        {
            title: 'Master Data',
            items: [
                { name: 'Pelanggan', href: '/customers', icon: Users, permission: 'customers.read' },
                { name: 'Pemasok', href: '/suppliers', icon: Users, permission: 'stock.read' },
            ].filter((item) => !item.permission || can(item.permission)),
        },
        {
            title: 'Laporan',
            items: [
                { name: 'Pusat Analitik', href: '/reports', icon: BarChart3, permission: 'reports.view' },
                { name: 'Riwayat Penjualan', href: '/sales', icon: Receipt, permission: 'sales.read' },
                { name: 'Retur Barang', href: '/returns', icon: RotateCcw, permission: 'sales.read' },
            ].filter((item) => !item.permission || can(item.permission)),
        },
        {
            title: 'Pengaturan',
            items: [
                { name: 'Kasir & User', href: '/users', icon: Users, permission: 'users.read' },
                { name: 'Peran & Izin', href: '/roles', icon: Shield, permission: 'roles.manage' },
                { name: 'Manajemen Cabang', href: '/outlets', icon: Store, permission: 'dashboard.view' },
                { name: 'Pengaturan Toko', href: '/settings', icon: Settings, permission: 'dashboard.view' },
            ].filter((item) => !item.permission || can(item.permission)),
        }
    ].filter(group => group.items.length > 0);

    const isActive = (href: string) => {
        if (href === '/dashboard') return currentUrl === '/dashboard';
        return currentUrl.startsWith(href);
    };

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'light' : 'dark');
    };

    const posRoutes = ['/pos', '/shifts', '/sales', '/returns', '/inventory/adjustment', '/customers', '/products'];
    const isHeaderQuickMenu = posRoutes.some(route => currentUrl === route || currentUrl.startsWith(route + '/'));
    const isSidebarHidden = ['/pos', '/shifts'].some(route => currentUrl === route || currentUrl.startsWith(route + '/'));

    const headerNavItems = [
        { name: 'POS', href: '/pos', icon: ShoppingCart, color: 'text-indigo-500' },
        { name: 'Shift', href: '/shifts', icon: Clock, color: 'text-emerald-500' },
        { name: 'Analitik', href: '/reports', icon: BarChart3, color: 'text-indigo-600' },
        { name: 'Sales', href: '/sales', icon: Receipt, color: 'text-blue-500' },
        { name: 'Retur', href: '/returns', icon: RotateCcw, color: 'text-orange-500' },
        { name: 'Opname', href: '/inventory/adjustment', icon: ClipboardList, color: 'text-purple-500' },
        { name: 'Customers', href: '/customers', icon: Users, color: 'text-indigo-500' },
        { name: 'Produk', href: '/products', icon: Package, color: 'text-rose-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
            <Toaster position="top-right" expand={true} richColors closeButton />
            <GlobalDialog />

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            {!isSidebarHidden && (
                <aside
                    className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out
                        ${sidebarOpen ? 'w-64' : 'w-20'}
                        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        bg-indigo-950 dark:bg-indigo-950 border-r border-indigo-900/50 flex flex-col shadow-2xl`}
                >
                {/* Logo */}
                <div className={`flex items-center h-16 px-4 border-b border-indigo-900/50 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    {sidebarOpen && (
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Code className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <span className="text-base font-black text-white tracking-tight">
                                    CodecPOS
                                </span>
                                <span className="block text-[9px] text-indigo-400 font-bold tracking-tighter uppercase -mt-1">
                                    Management System
                                </span>
                            </div>
                        </Link>
                    )}
                    <button
                        onClick={() => {
                            setSidebarOpen(!sidebarOpen);
                            setMobileMenuOpen(false);
                        }}
                        className="hidden lg:flex items-center justify-center w-7 h-7 rounded bg-indigo-900/50 text-indigo-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-indigo-400 hover:text-white hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
                    {navGroups.map((group, groupIdx) => (
                        <div key={groupIdx}>
                            {sidebarOpen && (
                                <p className="px-3 mb-1 text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.2em]">
                                    {group.title}
                                </p>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 relative
                                                ${active
                                                    ? 'bg-indigo-500/20 text-white font-bold'
                                                    : 'text-indigo-300/70 hover:text-white hover:bg-white/5'
                                                }
                                                ${!sidebarOpen ? 'justify-center' : ''}`}
                                        >
                                            <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${active ? 'text-indigo-400' : 'group-hover:scale-110'}`} />
                                            {sidebarOpen && (
                                                <span className="text-[13px]">{item.name}</span>
                                            )}
                                            {active && sidebarOpen && (
                                                <div className="absolute right-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-l-full shadow-[0_0_10px_indigo]" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User info */}
                <div className={`border-t border-indigo-900/50 p-3 ${!sidebarOpen ? 'px-2' : ''}`}>
                    <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 rounded bg-indigo-900 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0 border border-indigo-800/50">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{auth.user.name}</p>
                                <p className="text-[10px] text-indigo-400 truncate uppercase font-black tracking-tighter">
                                    {auth.user.outlet?.name || 'No Outlet'}
                                </p>
                            </div>
                        )}
                        {sidebarOpen && (
                            <div className="flex gap-1">
                                <Link
                                    href="/profile"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-indigo-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-indigo-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
            )}

            {/* Main content */}
            <div className={`transition-all duration-300 ${isSidebarHidden ? 'lg:ml-0' : (sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')} min-h-screen flex flex-col`}>
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-indigo-900/95 backdrop-blur-xl border-b border-indigo-800/50 flex items-center px-4 lg:px-6 shadow-lg shadow-indigo-950/20">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className={`${isSidebarHidden ? 'hidden' : 'lg:hidden'} mr-3 w-10 h-10 flex items-center justify-center rounded-xl text-indigo-400 hover:text-white hover:bg-white/10 transition-colors`}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {isHeaderQuickMenu && (
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
                            <Link href="/portal" className="p-2 rounded-lg text-indigo-400 hover:text-white hover:bg-white/10 transition-all mr-2">
                                <Home className="w-5 h-5" />
                            </Link>
                            <div className="w-px h-6 bg-indigo-800/50 mr-2" />
                            {headerNavItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 group whitespace-nowrap
                                            ${active 
                                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' 
                                                : 'text-indigo-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 ${active ? 'text-white' : item.color} group-hover:scale-110 transition-transform`} />
                                        <span className={`text-[11px] font-black uppercase tracking-wider ${active ? 'block' : 'hidden md:block'}`}>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex-1" />
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-indigo-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Toggle Light/Dark Mode"
                        >
                            <Sun className="w-4 h-4 hidden dark:block" />
                            <Moon className="w-4 h-4 block dark:hidden" />
                        </button>
                        
                        <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-800"></div>

                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-white leading-tight">{auth.user.name}</p>
                            <p className="text-[10px] text-indigo-400 uppercase font-black tracking-tighter truncate max-w-[120px]">
                                {auth.user.outlet?.name || 'CENTRAL'}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-md bg-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/50">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
