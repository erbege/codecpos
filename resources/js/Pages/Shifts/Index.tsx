import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Calculator, PlayCircle, StopCircle, Receipt, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

interface Shift {
    id: number;
    user_id: number;
    start_time: string;
    end_time: string | null;
    starting_cash: string;
    expected_ending_cash?: number;
    actual_ending_cash: string | null;
    status: 'open' | 'closed';
    notes: string | null;
}

interface Props extends PageProps {
    activeShift: Shift | null;
    historyShifts: Shift[];
    suggestedStartingCash: number;
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
    const { activeShift, historyShifts, suggestedStartingCash } = usePage<Props>().props;

    const startForm = useForm({
        starting_cash: suggestedStartingCash.toString(),
    });

    // Handle auto-suggest if the form is empty
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
            onSuccess: () => startForm.reset(),
        });
    };

    const handleEnd = (e: React.FormEvent) => {
        e.preventDefault();
        endForm.post('/shifts/end', {
            onSuccess: () => endForm.reset(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Shift" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Shift Kasir</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Buka dan tutup sesi kasir harian Anda</p>
                </div>

                {!activeShift ? (
                    <div className="rounded-2xl bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 p-6 shadow-sm dark:shadow-none bg-gradient-to-br from-white to-cyan-50 dark:from-gray-900/50 dark:to-cyan-900/10">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                                <PlayCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Buka Shift Baru</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Anda belum memulai shift hari ini. Masukkan jumlah modal kas awal di laci kaser saat ini untuk mulai menerima transaksi POS.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleStart} className="max-w-md space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Modal Awal Kasir (Rp)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={startForm.data.starting_cash}
                                        onChange={e => startForm.setData('starting_cash', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                        placeholder="0"
                                    />
                                </div>
                                {startForm.errors.starting_cash && <p className="mt-1 text-sm text-red-500">{startForm.errors.starting_cash}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={startForm.processing}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
                            >
                                <PlayCircle className="w-5 h-5" /> Buka Shift & Mulai Transaksi
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-emerald-200 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-emerald-50 dark:bg-emerald-500/5 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-emerald-400">Shift Sedang Aktif</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Mulai Sejak</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(activeShift.start_time)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Modal Kas Awal</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(activeShift.starting_cash)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                        <Calculator className="w-4 h-4" /> Estimasi Kas (Sistem)
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(activeShift.expected_ending_cash || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Modal Awal + Transaksi Pembayaran Cash Saja</p>
                                </div>
                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                                    <Link
                                        href="/pos"
                                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                    >
                                        <Receipt className="w-4 h-4" /> Buka Laman POS (Kasir)
                                    </Link>
                                </div>
                            </div>

                            <form onSubmit={handleEnd} className="space-y-4 md:border-l border-gray-100 md:pl-8 dark:border-gray-800">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Tutup Shift Kasir</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Uang Kas Aktual Laci (Rp) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={endForm.data.actual_ending_cash}
                                        onChange={e => endForm.setData('actual_ending_cash', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Hitung uang riil di laci saat ini"
                                    />
                                    {endForm.errors.actual_ending_cash && <p className="mt-1 text-sm text-red-500">{endForm.errors.actual_ending_cash}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan (Opsional)</label>
                                    <textarea
                                        value={endForm.data.notes}
                                        onChange={e => endForm.setData('notes', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Alasan selisih uang jika ada..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={endForm.processing}
                                    className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                >
                                    <StopCircle className="w-5 h-5" /> Akhiri / Tutup Shift
                                </button>
                                <p className="text-xs text-indigo-600 dark:text-indigo-500/80 mt-2 flex items-center gap-1 leading-snug">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                    Pastikan nilai uang kas pada laci dihitung dengan sebenar-benarnya sebelum menutup shift.
                                </p>
                            </form>
                        </div>
                    </div>
                )}

                {/* History Table */}
                <div className="rounded-2xl bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-none overflow-hidden mt-8">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800/50">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Riwayat Shift Anda</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800/50 bg-gray-50 dark:bg-transparent">
                                    <th className="text-left px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">Masuk Shift</th>
                                    <th className="text-left px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">Tutup Shift</th>
                                    <th className="text-right px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">Kas Awal</th>
                                    <th className="text-right px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">Kas Akhir</th>
                                    <th className="text-center px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyShifts.length > 0 ? historyShifts.map((shift) => (
                                    <tr key={shift.id} className="border-b border-gray-100 dark:border-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/20">
                                        <td className="px-5 py-4 text-gray-900 dark:text-white whitespace-nowrap">{formatDate(shift.start_time)}</td>
                                        <td className="px-5 py-4 text-gray-900 dark:text-white whitespace-nowrap">{shift.end_time ? formatDate(shift.end_time) : '-'}</td>
                                        <td className="px-5 py-4 text-right text-gray-600 dark:text-gray-300">{formatCurrency(shift.starting_cash)}</td>
                                        <td className="px-5 py-4 text-right text-gray-900 dark:text-white font-medium">{formatCurrency(shift.actual_ending_cash || 0)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                {shift.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Belum ada riwayat shift sebelumnya.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
