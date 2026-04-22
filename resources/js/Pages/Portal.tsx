import { useState, useRef, useEffect, useMemo } from 'react';
import GuestLayout from "@/Layouts/GuestLayout";
import { PageProps } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowUpRight,
    BarChart3,
    Clock3,
    Database,
    LogOut,
    Package,
    Settings,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    Store,
} from "lucide-react";

const FALLBACK_QUOTES = [
    { text: "Kualitas lebih penting daripada kuantitas. Satu home run jauh lebih baik daripada dua double.", author: "Steve Jobs" },
    { text: "Bisnis yang hebat tidak dibangun oleh satu orang, mereka dibangun oleh tim.", author: "Steve Jobs" },
    { text: "Kepuasan pelanggan adalah aset paling berharga dalam bisnis Anda.", author: "Anonim" },
    { text: "Inovasi adalah hal yang membedakan antara pemimpin dan pengikut.", author: "Steve Jobs" },
    { text: "Jangan menunggu kesempatan, ciptakanlah.", author: "Anonim" },
    { text: "Fokuslah pada pelayanan, maka keuntungan akan mengikuti.", author: "Anonim" },
    { text: "Keberhasilan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.", author: "Colin Powell" },
    { text: "Cara terbaik untuk memprediksi masa depan adalah dengan menciptakannya.", author: "Peter Drucker" },
];

interface Quote {
    text: string;
    author: string;
}

interface Props extends PageProps {
    quote: Quote;
}

export default function Portal({ quote: serverQuote }: Props) {
    const { auth } = usePage<PageProps>().props;

    // Permission helper — mirrors sidebar logic
    const can = (permission: string) => auth.permissions?.includes(permission);
    
    // Inisialisasi dengan kutipan dari server atau fallback lokal jika tidak ada
    const [quote, setQuote] = useState(serverQuote || FALLBACK_QUOTES[0]);

    // Tidak perlu lagi useEffect fetchQuote karena sudah ditangani di Backend (PHP)
    // Hal ini mencegah error CORS di browser.

    const currentDate = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date());

    const getGreeting = () => {
        const hour = new Date().getHours();
        let greeting = "";
        if (hour >= 0 && hour < 12) {
            greeting = "Selamat pagi";
        } else if (hour >= 12 && hour < 15) {
            greeting = "Selamat siang";
        } else if (hour >= 15 && hour < 18) {
            greeting = "Selamat sore";
        } else {
            greeting = "Selamat malam";
        }
        return `${greeting}, ${auth.user?.name || "User"}!`;
    };

    const menus = [
        {
            name: "Point of Sale",
            label: "CORE",
            desc: "Transaksi cepat dan checkout instan.",
            href: route("pos"),
            icon: ShoppingCart,
            isPrimary: true,
            accent: "text-white",
            tone: "from-white to-indigo-100",
            iconBrandColor: "text-indigo-600",
            surface: "border-indigo-600 bg-indigo-600 shadow-indigo-600/20 dark:border-indigo-500 dark:bg-indigo-600",
            permission: 'sales.create',
        },
        {
            name: "Inventory",
            label: "Stock",
            desc: "Stok, varian, dan pergerakan barang.",
            href: route("products.index"),
            icon: Package,
            accent: "text-blue-700 dark:text-blue-300",
            tone: "from-blue-500 to-indigo-500",
            surface:
                "border-blue-200/80 bg-blue-50/85 dark:border-blue-500/30 dark:bg-blue-500/10",
            permission: 'products.read',
        },
        {
            name: "Master Data",
            label: "Data",
            desc: "Pelanggan, user, dan data referensi.",
            href: route("customers.index"),
            icon: Database,
            accent: "text-violet-700 dark:text-violet-300",
            tone: "from-violet-500 to-indigo-500",
            surface:
                "border-violet-200/80 bg-violet-50/85 dark:border-violet-500/30 dark:bg-violet-500/10",
            permission: 'customers.read',
        },
        {
            name: "Reports",
            label: "Insight",
            desc: "Analitik penjualan dan performa toko.",
            href: route("reports.index"),
            icon: BarChart3,
            accent: "text-indigo-700 dark:text-indigo-300",
            tone: "from-indigo-500 to-violet-500",
            surface:
                "border-indigo-200/80 bg-indigo-50/85 dark:border-indigo-500/30 dark:bg-indigo-500/10",
            permission: 'reports.view',
        },
        {
            name: "Settings",
            label: "Config",
            desc: "Preferensi sistem dan konfigurasi outlet.",
            href: route("settings.index"),
            icon: Settings,
            accent: "text-indigo-700 dark:text-indigo-300",
            tone: "from-indigo-600 to-violet-500",
            surface:
                "border-indigo-200/80 bg-indigo-50/85 dark:border-indigo-500/30 dark:bg-indigo-500/10",
            permission: 'settings.manage',
        },
    ].filter(menu => !menu.permission || can(menu.permission));

    return (
        <GuestLayout
            maxWidth="max-w-[1720px]"
            showCard={false}
            showBranding={false}
        >
            <Head title="Portal" />

            {/* <div className="h-screen overflow-hidden px-3 py-3 text-slate-900 dark:bg-[#070b18] dark:text-slate-100 sm:px-4"> */}
                <div className="min-h-screen lg:h-screen relative mx-auto flex h-full w-full max-w-[1720px] overflow-y-auto lg:overflow-hidden lg:rounded-[34px] border-b lg:border border-indigo-300/30 shadow-[0_28px_90px_rgba(7,11,24,0.55)] dark:border-indigo-500/20 dark:bg-[#0f1631]">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-500/20" />
                        <div className="absolute -right-10 top-0 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/15" />
                        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
                    </div>

                    <div className="relative flex h-full w-full flex-col gap-3 p-3 sm:p-4 lg:p-5">
                        <header className="grid flex-none grid-cols-2 gap-3 lg:grid-cols-[1.45fr_0.5fr_0.5fr_0.5fr]">
                            <div className="col-span-2 lg:col-span-1 rounded-[28px] border border-indigo-300/30 bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900 px-5 py-4 text-white shadow-lg shadow-indigo-950/30 dark:border-indigo-500/30">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-indigo-300 to-blue-300 text-indigo-950 shadow-lg shadow-indigo-500/30">
                                            <Store className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                                                BikeShop POS
                                            </p>
                                            <h1 className="mt-1 text-lg font-black tracking-tight sm:text-2xl lg:text-[2rem] leading-tight">
                                                CodecPOS
                                            </h1>
                                            <p className="mt-1 text-sm text-slate-300">
                                                Fast launcher for daily
                                                operations.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 lg:flex">
                                        <Sparkles className="h-5 w-5 text-indigo-300" />
                                        <span className="text-sm font-semibold">
                                            Focused Control Surface
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[26px] border border-indigo-200/80 bg-indigo-50/95 px-4 py-4 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10 flex items-center justify-center">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
                                        <Clock3 className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">
                                            Tanggal
                                        </p>
                                        <p className="truncate text-sm font-black text-indigo-900 dark:text-indigo-100">
                                            {currentDate}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[26px] border border-violet-200/80 bg-violet-50/95 px-4 py-4 shadow-sm dark:border-violet-500/30 dark:bg-violet-500/10 flex items-center justify-center">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-500/25">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
                                            Status
                                        </p>
                                        <p className="truncate text-sm font-black text-violet-900 dark:text-violet-100">
                                            Ready
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="rounded-[26px] border border-rose-200/80 bg-rose-50/95 px-4 py-4 text-left shadow-sm transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 flex items-center justify-center"
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/25">
                                        <LogOut className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300">
                                            Session
                                        </p>
                                        <p className="truncate text-sm font-black text-rose-900 dark:text-rose-100">
                                            Logout
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </header>

                        <section className="grid flex-none grid-cols-2 gap-3 lg:grid-cols-[1.55fr_0.45fr]">
                            <div className="col-span-2 lg:col-span-1 rounded-[28px] border border-indigo-200/80 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-indigo-500/30 dark:bg-indigo-500/10">
                                <p className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-indigo-500">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Main Deck
                                </p>
                                <h2 className="mt-3 text-lg font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-2xl lg:text-[2rem]">
                                    {getGreeting()}
                                </h2>
                                <div className="mt-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <div className="h-px w-8 bg-indigo-500/30" />
                                    <p className="text-[10px] sm:text-xs italic font-medium">
                                        "{quote.text}" — <span className="font-bold not-italic text-indigo-600 dark:text-indigo-400">{quote.author}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-2 lg:col-span-1 grid grid-cols-2 gap-3">
                                <div className="rounded-[26px] border border-indigo-200/80 bg-indigo-50/85 p-4 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                        User
                                    </p>
                                    <p className="mt-2 truncate text-base font-black text-slate-900 dark:text-white">
                                        {auth.user?.name}
                                    </p>
                                </div>
                                <div className="rounded-[26px] border border-violet-200/80 bg-violet-50/85 p-4 shadow-sm dark:border-violet-500/30 dark:bg-violet-500/10">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                        Role
                                    </p>
                                    <p className="mt-2 truncate text-base font-black text-slate-900 dark:text-white">
                                        {auth.roles?.[0] || "Administrator"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <main className="min-h-0 flex-1 pb-6 lg:pb-0">
                            <div className="grid h-full grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {menus.map((menu, idx) => (
                                    <Link
                                        key={menu.name}
                                        href={menu.href}
                                        className={`group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] ${menu.surface} ${menu.isPrimary ? 'ring-4 ring-indigo-500/10' : ''}`}
                                        style={{
                                            animationDelay: `${idx * 80}ms`,
                                        }}
                                    >
                                        <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-white/60 blur-2xl dark:bg-white/10" />
                                        <div className="relative flex h-full flex-col">
                                            <div className="flex items-start justify-between gap-3">
                                                <div
                                                    className={`flex h-12 w-12 lg:h-20 lg:w-20 items-center justify-center rounded-[18px] lg:rounded-[26px] bg-gradient-to-br ${menu.tone} ${menu.isPrimary ? 'text-indigo-600' : 'text-white'} shadow-xl shadow-black/10`}
                                                >
                                                    <menu.icon className="h-6 w-6 lg:h-10 lg:w-10" />
                                                </div>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${menu.isPrimary ? 'bg-white text-indigo-700' : 'bg-white/80 dark:bg-slate-900/70 ' + menu.accent}`}
                                                >
                                                    {menu.label}
                                                </span>
                                            </div>

                                            <div className="mt-3 lg:mt-4 flex-1">
                                                <h3 className={`text-base lg:text-xl font-black tracking-tight ${menu.isPrimary ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                    {menu.name}
                                                </h3>
                                                <p className={`mt-1 lg:mt-2 text-[10px] lg:text-sm leading-relaxed lg:leading-6 ${menu.isPrimary ? 'text-indigo-50' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {menu.desc}
                                                </p>
                                            </div>

                                            <div className={`mt-4 flex items-center justify-between border-t pt-4 ${menu.isPrimary ? 'border-white/20' : 'border-slate-200/70 dark:border-slate-700/70'}`}>
                                                <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${menu.isPrimary ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    Open Module
                                                </span>
                                                <ArrowUpRight
                                                    className={`h-5 w-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${menu.accent}`}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </main>
                    </div>
                </div>
        </GuestLayout>
    );
}
