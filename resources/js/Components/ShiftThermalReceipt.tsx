import React from 'react';
import { usePage } from '@inertiajs/react';

interface Shift {
    id: number;
    user?: { name: string };
    outlet?: { name: string; address?: string; phone?: string };
    start_time: string;
    end_time: string | null;
    starting_cash: string | number;
    expected_ending_cash?: string | number | null;
    actual_ending_cash?: string | number | null;
    notes: string | null;
}

interface Props {
    shift: Shift;
}

const formatCurrency = (value: number | string | null | undefined) => {
    const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
    if (isNaN(num as number)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num as number);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

export default function ShiftThermalReceipt({ shift }: Props) {
    const { app_settings } = usePage<any>().props;

    const actual = Number(shift.actual_ending_cash || 0);
    const expected = Number(shift.expected_ending_cash || 0);
    const variance = actual - expected;

    return (
        <div id="shift-thermal-receipt" className="hidden print:block bg-white text-black font-mono text-[10px] w-[58mm] mx-auto p-1 leading-tight">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: 58mm auto;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #shift-thermal-receipt, #shift-thermal-receipt * {
                        visibility: visible;
                    }
                    #shift-thermal-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 58mm;
                        padding: 0 2mm;
                    }
                }
            `}} />
            
            {/* Header */}
            <div className="text-center mb-3 pt-4">
                <h1 className="text-[12px] font-black uppercase mb-0.5">REKAP SHIFT KASIR</h1>
                <p className="text-[11px] font-bold uppercase">{app_settings?.shop_name || 'CODECPOS'}</p>
                <p className="text-[8px]">{shift.outlet?.name || app_settings?.shop_name}</p>
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Info */}
            <div className="space-y-0.5 mb-2 text-[9px]">
                <div className="flex justify-between">
                    <span>Operator</span>
                    <span className="uppercase font-bold">{shift.user?.name || 'KASIR'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Mulai</span>
                    <span>{formatDate(shift.start_time)}</span>
                </div>
                {shift.end_time && (
                    <div className="flex justify-between">
                        <span>Selesai</span>
                        <span>{formatDate(shift.end_time)}</span>
                    </div>
                )}
            </div>

            <div className="border-t border-black my-2"></div>

            {/* Financial Details */}
            <div className="space-y-1.5 mb-2">
                <div className="flex justify-between">
                    <span>MODAL AWAL</span>
                    <span>{formatCurrency(shift.starting_cash)}</span>
                </div>
                <div className="flex justify-between">
                    <span>PENJUALAN TUNAI</span>
                    <span>{formatCurrency(expected - Number(shift.starting_cash))}</span>
                </div>
                
                <div className="border-t border-dotted border-black my-1"></div>
                
                <div className="flex justify-between font-bold">
                    <span>ESTIMASI KAS</span>
                    <span>{formatCurrency(expected)}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>KAS AKTUAL</span>
                    <span>{formatCurrency(actual)}</span>
                </div>

                <div className="border-t border-black my-1"></div>

                <div className={`flex justify-between font-black ${variance < 0 ? 'text-[11px]' : ''}`}>
                    <span>SELISIH</span>
                    <span>{variance === 0 ? 'PAS' : formatCurrency(variance)}</span>
                </div>
            </div>

            {shift.notes && (
                <div className="mt-3 p-1 border border-black text-[8px] italic whitespace-pre-wrap">
                    Catatan: {shift.notes}
                </div>
            )}

            <div className="border-t border-dashed border-black my-4"></div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 text-center pb-8 h-16">
                <div className="flex flex-col justify-between">
                    <span>Kasir</span>
                    <div className="border-t border-black w-full mt-8"></div>
                </div>
                <div className="flex flex-col justify-between">
                    <span>Saksi/SPV</span>
                    <div className="border-t border-black w-full mt-8"></div>
                </div>
            </div>

            <div className="text-center pt-2 pb-4 opacity-50 text-[7px]">
                Dokumen ini dicetak otomatis oleh sistem.<br/>
                Waktu Cetak: {formatDate(new Date().toISOString())}
            </div>
        </div>
    );
}
