import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, Sale } from '@/types';
import { ArrowLeft, Printer, RotateCcw, FileText, User, Calendar, Store, CreditCard, Tag, Package, ArrowRight, Receipt } from 'lucide-react';
import ThermalReceipt from '@/Components/ThermalReceipt';

interface Props extends PageProps {
    sale: Sale;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

export default function SaleShow() {
    const { sale } = usePage<Props>().props;

    return (
        <AuthenticatedLayout>
            <Head title={`Invoice #${sale.invoice_number}`} />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/sales"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-indigo-600 transition shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">#{sale.invoice_number}</h1>
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest
                                    ${sale.status === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                      sale.status === 'voided' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                      'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'}`}>
                                    {sale.status}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-400 mt-1 italic">{formatDate(sale.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {sale.status === 'completed' && (
                            <Link
                                href={route('returns.create', sale.id)}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs hover:bg-orange-600 hover:text-white border border-orange-100 dark:border-orange-500/20 transition-all shadow-sm uppercase tracking-widest"
                            >
                                <RotateCcw className="w-4 h-4" /> Retur Barang
                            </Link>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest group"
                        >
                            <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" /> Cetak Struk
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Thermal Preview (Sticky-ish) */}
                    <div className="lg:col-span-4 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/5">
                        <ThermalReceipt sale={sale} />
                    </div>

                    {/* Right: Detailed Info & Items Table */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Transaction Metadata Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operator Kasir</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate">{sale.user?.name}</p>
                                </div>
                            </div>
                            <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pelanggan</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate">{sale.customer?.name || 'UMUM'}</p>
                                </div>
                            </div>
                            <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pembayaran</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{sale.payment_method}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm shadow-indigo-500/5">
                            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Rincian Item Barang
                                </h3>
                                <span className="text-[10px] font-black text-indigo-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-indigo-50">{sale.items?.length} Items</span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-50 dark:border-gray-800">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Produk</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Harga</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {sale.items?.map((item) => (
                                            <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-xs leading-none">
                                                        {item.product_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right font-semibold text-gray-500 text-xs">
                                                    {formatCurrency(Number(item.price))}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-xs font-black text-indigo-500 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-50 dark:border-indigo-500/10">
                                                        {item.qty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <p className="text-xs font-black text-gray-900 dark:text-white tracking-tight">
                                                        {formatCurrency(Number(item.subtotal))}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Payment Summary Footer */}
                            <div className="p-8 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                                <div className="max-w-xs ml-auto space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(Number(sale.subtotal))}</span>
                                    </div>
                                    {Number(sale.discount) > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-rose-400 uppercase tracking-widest">Discount</span>
                                            <span className="font-bold text-rose-500">-{formatCurrency(Number(sale.discount))}</span>
                                        </div>
                                    )}
                                    {Number(sale.tax) > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-400 uppercase tracking-widest">Tax (PPN)</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(Number(sale.tax))}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center py-4 border-t border-gray-200 dark:border-gray-800">
                                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Grand Total</span>
                                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter italic">
                                            {formatCurrency(Number(sale.total))}
                                        </span>
                                    </div>
                                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-gray-400 uppercase tracking-widest">Amount Paid</span>
                                            <span className="font-black text-slate-700 dark:text-slate-300">{formatCurrency(Number(sale.paid))}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-emerald-400 uppercase tracking-widest">Change</span>
                                            <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(sale.change))}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
