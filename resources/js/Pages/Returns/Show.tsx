import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ArrowLeft, Printer, RotateCcw, AlertTriangle, Calendar, User } from 'lucide-react';

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

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/returns"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition shadow-sm border border-gray-100 dark:border-transparent"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{saleReturn.return_number}</h1>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Transaksi Pengembalian Barang
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:text-gray-900 border border-gray-200 dark:border-transparent dark:hover:text-white transition-colors shadow-sm"
                    >
                        <Printer className="w-4 h-4" /> Print Bukti
                    </button>
                </div>

                <div className="rounded-2xl bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 overflow-hidden shadow-sm">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 border-b border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-transparent">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Tanggal Retur
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white font-medium">{formatDate(saleReturn.created_at)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <User className="w-3 h-3" /> Petugas/Kasir
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white font-medium">{saleReturn.user?.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No. Invoice Asal</p>
                            <Link href={route('sales.show', saleReturn.sale_id)} className="text-sm text-cyan-600 dark:text-cyan-400 font-bold hover:underline">
                                {saleReturn.sale?.invoice_number}
                            </Link>
                        </div>
                    </div>

                    {/* Reasons */}
                    {saleReturn.notes && (
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800/50">
                            <p className="text-xs text-gray-500 mb-2 font-medium italic">Catatan / Alasan:</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200">{saleReturn.notes}</p>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800/50 bg-gray-50/30 dark:bg-transparent">
                                    <th className="text-left px-6 py-4 text-gray-500 font-medium">Item Barang</th>
                                    <th className="text-center px-6 py-4 text-gray-500 font-medium">Qty</th>
                                    <th className="text-right px-6 py-4 text-gray-500 font-medium">Harga Refund</th>
                                    <th className="text-right px-6 py-4 text-gray-500 font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/30">
                                {saleReturn.items?.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {item.product?.name} {item.product_variant && `(${item.product_variant.name})`}
                                            </p>
                                            {item.is_damaged && (
                                                <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase italic">
                                                    <AlertTriangle className="w-2.5 h-2.5" /> Barang Rusak
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300 font-mono">{item.qty}</td>
                                        <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(Number(item.refund_price))}</td>
                                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">{formatCurrency(item.qty * Number(item.refund_price))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-transparent flex flex-col items-end">
                        <p className="text-xs text-gray-500 mb-1">Total Dana Dikembalikan (Refund)</p>
                        <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{formatCurrency(Number(saleReturn.total_refund))}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-500">
                        Dokumen ini adalah bukti sah pengembalian barang. Silakan print jika diperlukan arsip fisik.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
