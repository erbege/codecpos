import { Link } from '@inertiajs/react';
import { PropsWithChildren, useEffect } from 'react';
import { Code } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

interface Props extends PropsWithChildren {
    maxWidth?: string;
    showCard?: boolean;
    showBranding?: boolean;
}

export default function Guest({ children, maxWidth = 'max-w-md', showCard = true, showBranding = true }: Props) {
    const { initializeTheme } = useAppStore();

    useEffect(() => {
        initializeTheme();
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500/30 transition-colors duration-500">
            {/* Background Decorative Element */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 -right-48 w-80 h-80 bg-blue-600/20 dark:bg-navy-700 rounded-full blur-[100px]" />
            </div>

            <div className={`relative w-full ${maxWidth} z-10 transition-all duration-700`}>
                {/* Branding */}
                {showBranding && (
                    <div className="flex flex-col items-center mb-8 animate-fade-in-down">
                        <Link href="/" className="flex items-center justify-center">
                            <img src="/images/logo.png" alt="Logo" className="w-24 h-auto drop-shadow-xl mb-2" />
                        </Link>
                        <div className="mt-4 text-center">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Codec<span className="text-indigo-600">POS</span></h1>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Point of Sale System</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {showCard ? (
                    <div className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all">
                        <div className="p-8">
                            {children}
                        </div>
                        {/* Bottom accent */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600" />
                    </div>
                ) : (
                    <div className="transition-all animate-fade-in">
                        {children}
                    </div>
                )}

                {/* Footer Link */}
                {/* <p className="mt-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} CodeCrafter POS
                </p> */}
            </div>
        </div>
    );
}
