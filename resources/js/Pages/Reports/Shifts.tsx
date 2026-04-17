import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Clock, 
    ArrowLeft,
    Calendar,
    Filter,
    User,
    Store,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    FileText,
    History
} from 'lucide-react';

interface Shift {
    id: number;
    user: { name: string };
    outlet: { name: string };
    start_time: string;
    end_time: string | null;
    starting_cash: number;
    expected_ending_cash: number;
    actual_ending_cash: number | null;
    discrepancy: number;
    status: string;
    notes: string | null;
}

interface Props {
    shifts: Shift[];
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

export default function ShiftsReport({ shifts, filters, outlets, auth }: Props) {
    
    const handleFilterChange = (key: string, value: string | number | null) => {
        router.get(route('reports.shifts'), {
            ...filters,
            [key]: value
        }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Pergantian Shift" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('reports.index')} className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 transition-colors shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Riwayat Pergantian Shift</h1>
                            <p className="text-sm text-gray-500">Audit trail aktivitas kasir dan kepatuhan kas laci</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-xs hover:text-indigo-600 transition-all shadow-sm active:scale-95">
                            <Download className="w-4 h-4" /> EXCEL
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-xs hover:text-indigo-600 transition-all shadow-sm active:scale-95">
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

                {/* Main Table Area */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                                <tr>
                                    <th className="px-6 py-4">Informasi Shift</th>
                                    <th className="px-6 py-4">Waktu (Mulai - Selesai)</th>
                                    <th className="px-6 py-4 text-right">Modal Awal</th>
                                    <th className="px-6 py-4 text-right">Ekspektasi Kas</th>
                                    <th className="px-6 py-4 text-right">Aktual Kas</th>
                                    <th className="px-6 py-4 text-center">Selisih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {shifts.length > 0 ? shifts.map((shift) => (
                                    <tr key={shift.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-xs">{shift.user.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase">
                                                        <Store className="w-2.5 h-2.5" /> {shift.outlet.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                                                {new Date(shift.start_time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                            <p className="text-[10px] text-gray-400 italic">
                                                {shift.end_time 
                                                    ? new Date(shift.end_time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
                                                    : 'Masih Aktif'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-gray-600 dark:text-gray-400">
                                            {formatCurrency(Number(shift.starting_cash))}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-indigo-600">
                                            {formatCurrency(Number(shift.expected_ending_cash))}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">
                                            {shift.actual_ending_cash ? formatCurrency(Number(shift.actual_ending_cash)) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {shift.status === 'closed' ? (
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-inset 
                                                    ${shift.discrepancy === 0 
                                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' 
                                                        : shift.discrepancy > 0 
                                                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 ring-blue-500/20' 
                                                            : 'bg-red-50 dark:bg-red-500/10 text-red-600 ring-red-500/20'}
                                                `}>
                                                    {shift.discrepancy > 0 && <ArrowUpRight className="w-3 h-3" />}
                                                    {shift.discrepancy < 0 && <ArrowDownRight className="w-3 h-3" />}
                                                    {shift.discrepancy === 0 ? 'Sesuai' : formatCurrency(shift.discrepancy)}
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic animate-pulse">On-Going</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada riwayat shift</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center mt-auto">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <AlertCircle className="w-3 h-3" /> Total Selisih Kas: {formatCurrency(shifts.reduce((acc, curr) => acc + (curr.discrepancy || 0), 0))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
