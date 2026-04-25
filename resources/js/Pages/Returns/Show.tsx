import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ArrowLeft, Printer, RotateCcw, AlertTriangle, Calendar, User, Receipt, Package, ArrowRight } from 'lucide-react';

import ThermalReturnReceipt from '@/Components/ThermalReturnReceipt';

interface Props extends PageProps {
    saleReturn: any;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

export default function ReturnsShow() {
    const { saleReturn } = usePage<Props>().props;

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Retur ${saleReturn.return_number}`} />
            
            <ThermalReturnReceipt saleReturn={saleReturn} />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/returns"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-indigo-600 transition shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">{saleReturn.return_number}</h1>
                                <span className="px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest">
                                    Return Processed
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-400 mt-1 italic">Rincian pengembalian barang dan refund dana</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold text-xs hover:text-indigo-600 border border-gray-200 dark:border-gray-800 transition-all shadow-sm uppercase tracking-widest"
                    >
                        <Printer className="w-4 h-4" /> Cetak Bukti
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Detail Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm shadow-indigo-500/5">
                            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informasi Retur</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" /> Tanggal Transaksi
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white font-bold">{formatDate(saleReturn.created_at)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" /> Petugas Kasir
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white font-bold uppercase tracking-tight">{saleReturn.user?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Receipt className="w-3.5 h-3.5" /> Invoice Terkait
                                    </p>
                                    <Link href={route('sales.show', saleReturn.sale_id)} className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-black hover:underline group">
                                        #{saleReturn.sale?.invoice_number}
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                
                                {saleReturn.notes && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic underline decoration-indigo-200 decoration-2">Alasan / Catatan:</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl italic border border-slate-100 dark:border-slate-800">
                                            "{saleReturn.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-orange-50 dark:bg-orange-500/5 rounded-3xl p-6 border border-orange-100 dark:border-orange-500/10 flex flex-col items-center justify-center text-center space-y-2">
                            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Total Dana Refund</p>
                            <p className="text-3xl font-black text-orange-600 dark:text-orange-400 tracking-tighter">
                                {formatCurrency(Number(saleReturn.total_refund))}
                            </p>
                        </div>
                    </div>

                    {/* Right: Items Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm shadow-indigo-500/5 h-full flex flex-col">
                            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Item Yang Dikembalikan
                                </h3>
                                <span className="text-[10px] font-black text-indigo-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-indigo-50">{saleReturn.items?.length} Unik</span>
                            </div>
                            
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-50 dark:border-gray-800">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produk / SKU</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Refund / Unit</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {saleReturn.items?.map((item: any) => (
                                            <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-xs leading-none mb-1.5">
                                                            {item.product?.name} {item.product_variant && `(${item.product_variant.name})`}
                                                        </span>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-gray-800 px-1.5 py-0.5 rounded leading-none">
                                                                {item.product?.sku}
                                                            </span>
                                                            {item.is_damaged ? (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase italic">
                                                                    <AlertTriangle className="w-2.5 h-2.5" /> Kondisi Rusak
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase italic">
                                                                    Kondisi Baik
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-xs font-black text-gray-500 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                                                        {item.qty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right font-semibold text-gray-500 text-xs">
                                                    {formatCurrency(Number(item.refund_price))}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <p className="text-xs font-black text-gray-900 dark:text-white tracking-tight">
                                                        {formatCurrency(item.qty * Number(item.refund_price))}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-8 bg-gray-50/30 dark:bg-gray-800/10 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] italic">
                                    --- Akhir Dari Rincian Transaksi ---
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
