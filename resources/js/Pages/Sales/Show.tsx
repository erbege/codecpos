import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, Sale } from '@/types';
import { ArrowLeft, Printer, RotateCcw, FileText } from 'lucide-react';
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
            <Head title={`Invoice ${sale.invoice_number}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/sales"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sale.invoice_number}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{formatDate(sale.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {sale.status === 'completed' && (
                            <Link
                                href={route('returns.create', sale.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors shadow-sm"
                            >
                                <RotateCcw className="w-4 h-4" /> Retur Barang
                            </Link>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
                        >
                            <Printer className="w-4 h-4" /> Cetak Struk
                        </button>
                    </div>
                </div>

                <ThermalReceipt sale={sale} />

                <div className="rounded-2xl bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 overflow-hidden shadow-sm dark:shadow-none">
                    {/* Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-gray-800/50">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Kasir</p>
                            <p className="text-sm text-gray-900 dark:text-white font-medium">{sale.user?.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Customer</p>
                            <p className="text-sm text-gray-900 dark:text-white font-medium">{sale.customer?.name || 'Umum'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Pembayaran</p>
                            <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">{sale.payment_method}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${sale.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                  sale.status === 'voided' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                                  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'}`}>
                                {sale.status}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800/50 bg-gray-50 dark:bg-transparent">
                                    <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-400 font-medium">Produk</th>
                                    <th className="text-right px-6 py-3 text-gray-600 dark:text-gray-400 font-medium">Harga</th>
                                    <th className="text-right px-6 py-3 text-gray-600 dark:text-gray-400 font-medium">Qty</th>
                                    <th className="text-right px-6 py-3 text-gray-600 dark:text-gray-400 font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items?.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800/30">
                                        <td className="px-6 py-3 text-gray-900 dark:text-white">{item.product_name}</td>
                                        <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(Number(item.price))}</td>
                                        <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-300">{item.qty}</td>
                                        <td className="px-6 py-3 text-right text-gray-900 dark:text-white font-medium">{formatCurrency(Number(item.subtotal))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="p-6 space-y-2 bg-gray-50/50 dark:bg-transparent border-t border-gray-200 dark:border-transparent">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(Number(sale.subtotal))}</span>
                        </div>
                        {Number(sale.discount) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Diskon</span>
                                <span className="text-red-500 dark:text-red-400">-{formatCurrency(Number(sale.discount))}</span>
                            </div>
                        )}
                        {Number(sale.tax) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Pajak</span>
                                <span className="text-gray-900 dark:text-white">{formatCurrency(Number(sale.tax))}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-800/50 pt-3">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-cyan-600 dark:text-cyan-400">{formatCurrency(Number(sale.total))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Dibayar</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(Number(sale.paid))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Kembalian</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(sale.change))}</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
