import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { PageProps, Outlet } from '@/types';
import { Calculator, PlayCircle, StopCircle, Receipt, AlertCircle, Clock, Wallet, History, ArrowRight, Printer, Eye, EyeOff, User } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import ShiftThermalReceipt from '@/Components/ShiftThermalReceipt';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Shift {
    id: number;
    user_id: number;
    start_time: string;
    end_time: string | null;
    starting_cash: string;
    expected_ending_cash?: number;
    actual_ending_cash: string | number | null;
    status: 'open' | 'closed';
    notes: string | null;
    user?: { name: string };
    outlet?: { name: string; address?: string };
}

interface Props extends PageProps {
    activeShift: Shift | null;
    historyShifts: Shift[];
    suggestedStartingCash: number;
    currentOutlet: Outlet | null;
    allOpenShifts: Shift[];
}

const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value));
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

export default function ShiftsIndex() {
    const { activeShift, historyShifts, suggestedStartingCash, auth, currentOutlet, allOpenShifts } = usePage<Props>().props;
    const [printingShift, setPrintingShift] = useState<Shift | null>(null);
    const [showExpected, setShowExpected] = useState(false);
    const [showHandover, setShowHandover] = useState(false);
    
    // Refs for focusing
    const startingCashRef = useRef<HTMLInputElement>(null);
    const actualEndingCashRef = useRef<HTMLInputElement>(null);

    const loginForm = useForm({
        email: '',
        password: '',
        remember: false,
        redirect_to: '/shifts',
    });

    const startForm = useForm({
        starting_cash: suggestedStartingCash.toString(),
    });

    useEffect(() => {
        if (!activeShift && !startForm.data.starting_cash) {
            startForm.setData('starting_cash', suggestedStartingCash.toString());
        }
    }, [suggestedStartingCash, activeShift]);

    const endForm = useForm({
        actual_ending_cash: '',
        notes: '',
    });

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        startForm.post('/shifts/start', {
            onSuccess: () => {
                startForm.reset();
                toast.success('Shift kasir berhasil dibuka. Selamat bertugas!');
            },
            onError: () => toast.error('Gagal membuka shift.')
        });
    };

    const handleEnd = (e: React.FormEvent) => {
        e.preventDefault();
        endForm.post('/shifts/end', {
            onSuccess: () => {
                const closedShift = {
                    ...activeShift!,
                    actual_ending_cash: endForm.data.actual_ending_cash,
                    notes: endForm.data.notes,
                    end_time: new Date().toISOString(),
                    status: 'closed' as const
                };
                setPrintingShift(closedShift);
                endForm.reset();
                toast.success('Shift kasir telah ditutup. Terima kasih!');
                setTimeout(() => {
                    window.print();
                    setShowHandover(true);
                }, 500);
            },
            onError: () => toast.error('Gagal menutup shift. Periksa kembali input Anda.')
        });
    };

    const handleHandoverLogin = (e: React.FormEvent) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onSuccess: () => {
                setShowHandover(false);
                toast.success('Ganti kasir berhasil. Selamat bertugas!');
            },
            onFinish: () => {
                loginForm.reset('password');
            },
        });
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);

            // Alt+P: To POS
            if (e.altKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                router.visit('/pos');
            }
            
            // Alt+L: To Reports
            if (e.altKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                router.visit('/reports');
            }

            if (e.key === 'F2' && !activeShift) {
                e.preventDefault();
                startingCashRef.current?.focus();
            }

            if (e.key === 'F9' && activeShift) {
                e.preventDefault();
                actualEndingCashRef.current?.focus();
            }

            if (e.key === 'Escape' && showHandover) {
                // Prevent closing handover modal via Esc to force login? 
                // Or let it be. Usually better to stay.
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeShift, showHandover]);

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Shift - Operational" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Sesi Shift Kasir</h1>
                        <p className="text-sm font-semibold text-gray-400">
                            {currentOutlet ? `Mengelola Kasir untuk: ${currentOutlet.name}` : 'Kelola saldo laci kasir dan sesi kerja operasional'}
                        </p>
                    </div>
                </div>

                {/* Multiple Shifts Notification for Admins */}
                {!auth.user.outlet_id && allOpenShifts.length > 1 && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-tight">Perhatian: Anda memiliki beberapa shift terbuka</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                                Anda memiliki shift aktif di outlet: <strong>{allOpenShifts.map(s => s.outlet?.name).join(', ')}</strong>. 
                                POS hanya akan memproses transaksi untuk outlet yang sedang aktif dipilih.
                            </p>
                        </div>
                    </div>
                )}

                {!activeShift ? (
                    <div className="rounded-3xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-500/20 p-8 shadow-xl shadow-indigo-500/5 relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                <PlayCircle className="w-12 h-12" />
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Mulai Sesi Shift Baru</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-lg">
                                    Anda belum memulai shift hari ini. Silakan konfirmasi jumlah modal kas awal yang tersedia di laci kasir untuk mulai menerima transaksi.
                                </p>
                            </div>
                            <form onSubmit={handleStart} className="w-full md:w-80 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Modal Kas Awal (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-300">Rp</span>
                                        <input
                                            ref={startingCashRef}
                                            type="number"
                                            min="0"
                                            required
                                            value={startForm.data.starting_cash}
                                            onChange={e => startForm.setData('starting_cash', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-lg font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    {startForm.errors.starting_cash && <p className="mt-1 text-[10px] text-rose-500 font-bold">{startForm.errors.starting_cash}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={startForm.processing}
                                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 uppercase"
                                >
                                    BUKA SESI KASIR [F2] <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Status Aktif Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 shadow-xl shadow-emerald-500/5 overflow-hidden flex flex-col">
                            <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-100 dark:border-emerald-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em]">Sesi Sedang Aktif</h3>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                                    <Clock className="w-3.5 h-3.5" /> {formatDate(activeShift.start_time)}
                                </div>
                            </div>

                            <div className="p-8 flex-1 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modal Awal Kas</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(activeShift.starting_cash)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Estimasi Kas Laci</p>
                                            <button 
                                                onClick={() => setShowExpected(!showExpected)}
                                                className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/10 text-emerald-600 transition-colors"
                                                title={showExpected ? "Sembunyikan" : "Lihat Estimasi"}
                                            >
                                                {showExpected ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </button>
                                        </div>
                                        <p className={`text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter transition-all duration-300 ${!showExpected ? 'blur-md select-none' : ''}`}>
                                            {formatCurrency(activeShift.expected_ending_cash || 0)}
                                        </p>
                                        <div className="flex items-center gap-1.5 p-2 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                                            <Calculator className="w-3 h-3 text-emerald-500" />
                                            <p className="text-[9px] text-emerald-600 font-bold uppercase">Saldo Awal + Penjualan Tunai</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                                    <Link
                                        href="/pos"
                                        className="flex-1 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Receipt className="w-4 h-4" /> Laman POS [Alt+P]
                                    </Link>
                                    <Link
                                        href="/reports"
                                        className="py-4 px-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        Laporan
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* End Shift Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <StopCircle className="w-4 h-4 text-rose-500" />
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Akhiri Sesi Shift</h3>
                                </div>
                                
                                <form onSubmit={handleEnd} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kas Aktual Di Laci (Uang Fisik) *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-rose-300">Rp</span>
                                            <input
                                                ref={actualEndingCashRef}
                                                type="number"
                                                min="0"
                                                required
                                                value={endForm.data.actual_ending_cash}
                                                onChange={e => endForm.setData('actual_ending_cash', e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-lg font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        {endForm.errors.actual_ending_cash && <p className="mt-1 text-[10px] text-rose-500 font-bold">{endForm.errors.actual_ending_cash}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Catatan Perbedaan (Jika ada)</label>
                                        <textarea
                                            value={endForm.data.notes}
                                            onChange={e => endForm.setData('notes', e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                            placeholder="Tulis alasan jika kas aktual tidak sama dengan estimasi..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={endForm.processing}
                                        className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-indigo-600 text-white font-bold text-xs tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 uppercase"
                                    >
                                        <StopCircle className="w-5 h-5" /> Tutup Shift [F9]
                                    </button>
                                </form>
                            </div>
                            
                            <div className="mt-6 flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                <p className="text-[9px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest italic">
                                    Pastikan laci kas sudah dihitung manual sebelum konfirmasi untuk menghindari selisih laporan.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Section */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Riwayat Sesi Sebelumnya</h3>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700">{historyShifts.length} Sesi Terakhir</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-gray-800">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Mulai Sesi</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Selesai Sesi</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Modal Awal</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Kas Akhir</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {historyShifts.length > 0 ? historyShifts.map((shift) => (
                                    <tr key={shift.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight">{formatDate(shift.start_time)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400 uppercase tracking-tight">{shift.end_time ? formatDate(shift.end_time) : '-'}</td>
                                        <td className="px-6 py-4 text-right text-xs font-bold text-gray-500">{formatCurrency(shift.starting_cash)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-black text-gray-900 dark:text-white tracking-tight">{formatCurrency(shift.actual_ending_cash || 0)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest
                                                ${shift.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {shift.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setPrintingShift(shift);
                                                    setTimeout(() => window.print(), 100);
                                                }}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 transition-colors"
                                                title="Cetak Struk Rekap"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <History className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-800" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada riwayat shift yang tersedia.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {printingShift && (
                <ShiftThermalReceipt shift={printingShift} />
            )}

            {/* Handover / Quick Switch Modal */}
            <Modal show={showHandover} onClose={() => {}} maxWidth="md">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4 mb-8">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <User className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Sesi Berakhir</h2>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Silakan Kasir Selanjutnya Login</p>
                        </div>
                    </div>

                    <form onSubmit={handleHandoverLogin} className="space-y-5">
                        <div className="space-y-2">
                            <InputLabel htmlFor="email" value="Email Kasir" className="text-[10px] font-bold uppercase tracking-widest text-gray-400" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={loginForm.data.email}
                                className="mt-1 block w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-3.5 px-4 font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-300"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => loginForm.setData('email', e.target.value)}
                                placeholder="nama@email.com"
                                required
                            />
                            {loginForm.errors.email && <p className="text-[10px] text-rose-500 font-bold uppercase mt-1">{loginForm.errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="password" value="Password / PIN" className="text-[10px] font-bold uppercase tracking-widest text-gray-400" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={loginForm.data.password}
                                className="mt-1 block w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-3.5 px-4 font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-300"
                                autoComplete="current-password"
                                onChange={(e) => loginForm.setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            {loginForm.errors.password && <p className="text-[10px] text-rose-500 font-bold uppercase mt-1">{loginForm.errors.password}</p>}
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <PrimaryButton 
                                className="w-full justify-center py-4 rounded-2xl text-xs tracking-[0.2em] font-black uppercase"
                                disabled={loginForm.processing}
                            >
                                MASUK KE SESI BARU
                            </PrimaryButton>
                            
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full py-4 text-[10px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                            >
                                KELUAR DARI APLIKASI
                            </Link>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
