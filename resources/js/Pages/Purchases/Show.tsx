import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ArrowLeft, Printer, Package, User, Calendar, Store, CreditCard, Tag, ArrowRight, Receipt, FileText, Building2 } from 'lucide-react';

interface PurchaseItem {
    id: number;
    product: {
        name: string;
        sku: string;
    };
    product_variant?: {
        name: string;
    };
    qty: number;
    unit_cost: string;
    subtotal: string;
}

interface Purchase {
    id: number;
    reference_number: string;
    purchase_date: string;
    total_amount: string;
    notes: string | null;
    supplier?: {
        name: string;
        phone?: string;
        address?: string;
    };
    user?: {
        name: string;
    };
    outlet?: {
        name: string;
    };
    items: PurchaseItem[];
    created_at: string;
}

interface Props extends PageProps {
    purchase: Purchase;
    app_settings: {
        shop_name: string;
        shop_address: string;
        shop_phone: string;
        shop_email: string;
    };
}

const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value));
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

export default function PurchaseShow() {
    const { purchase, app_settings } = usePage<Props>().props;

    return (
        <AuthenticatedLayout>
            <Head title={`Cetak Pembelian #${purchase.reference_number}`} />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Action Header - Hidden on Print */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 print:hidden border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/purchases"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-indigo-600 transition shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">#{purchase.reference_number}</h1>
                                <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                    Stock Registered
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-400 mt-1 italic">Dokumen penerimaan barang masuk dari pemasok</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest group"
                        >
                            <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" /> CETAK DOKUMEN
                        </button>
                    </div>
                </div>

                {/* Main Document Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:space-y-4">
                    {/* Print Only Header */}
                    <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
                        <div className="flex justify-between items-start">
                            <div className="max-w-[60%]">
                                <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900 mb-0.5">BUKTI PENERIMAAN BARANG</h1>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                    No. Referensi: <span className="text-slate-900 font-black">{purchase.reference_number}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-lg font-black text-slate-900 italic uppercase leading-none">{app_settings.shop_name}</h2>
                                <p className="text-[8px] font-bold text-slate-500 leading-tight uppercase tracking-wider max-w-[200px] ml-auto mt-1">
                                    {app_settings.shop_address}<br />
                                    {purchase.outlet?.name || 'Gudang Pusat'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Left Side Info / Print Top Info */}
                    <div className="lg:col-span-4 space-y-6 print:grid print:grid-cols-2 print:gap-4 print:space-y-0 print:border-b print:pb-4">
                        {/* Transaction Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm shadow-indigo-500/5 print:border-none print:shadow-none print:bg-transparent">
                            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 print:hidden">
                                <Receipt className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informasi Dokumen</h3>
                            </div>
                            <div className="p-6 space-y-5 print:px-0 print:py-0 print:space-y-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 print:text-slate-500 print:text-[8px]">
                                        <Calendar className="w-3.5 h-3.5 print:hidden" /> Tanggal Masuk
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white font-bold print:text-slate-900 print:text-xs">{formatDate(purchase.purchase_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 print:text-slate-500 print:text-[8px]">
                                        <User className="w-3.5 h-3.5 print:hidden" /> Admin Penerima
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white font-bold uppercase tracking-tight print:text-slate-900 print:text-xs">{purchase.user?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Supplier Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm shadow-indigo-500/5 print:border-none print:shadow-none print:bg-transparent">
                            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 print:hidden">
                                <Building2 className="w-4 h-4 text-orange-500" />
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informasi Pemasok</h3>
                            </div>
                            <div className="p-6 space-y-3 print:px-0 print:py-0 print:space-y-1">
                                <h4 className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] hidden print:block">Informasi Pemasok</h4>
                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight print:text-slate-900 print:text-xs">{purchase.supplier?.name || 'UMUM / TANPA PEMASOK'}</p>
                                {purchase.supplier?.phone && (
                                    <p className="text-xs text-gray-500 font-medium print:text-slate-700 print:text-[10px]">Telp: {purchase.supplier.phone}</p>
                                )}
                                {purchase.supplier?.address && (
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed italic print:text-slate-700 print:not-italic print:text-[10px]">{purchase.supplier.address}</p>
                                )}
                            </div>
                        </div>

                        {/* Total Value - Repositioned for Print */}
                        <div className="bg-indigo-600 dark:bg-indigo-500 rounded-3xl p-8 shadow-xl shadow-indigo-500/20 text-center space-y-2 print:hidden">
                            <p className="text-[11px] font-bold text-indigo-100 uppercase tracking-[0.2em] opacity-80">Total Nilai Barang</p>
                            <p className="text-4xl font-black text-white tracking-tighter italic">
                                {formatCurrency(purchase.total_amount)}
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Items Table */}
                    <div className="lg:col-span-8 flex flex-col space-y-6 print:block print:space-y-2">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm shadow-indigo-500/5 flex flex-col h-full print:border-none print:shadow-none bg-transparent">
                            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between print:bg-transparent print:px-0 print:py-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 print:text-slate-900 print:text-[10px]">
                                    <Package className="w-4 h-4 print:hidden text-indigo-500" /> Daftar Barang Diterima
                                </h3>
                                <span className="text-[10px] font-black text-indigo-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-indigo-50 print:hidden">{purchase.items.length} SKUs</span>
                            </div>

                            <div className="overflow-x-auto print:overflow-visible flex-1">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 print:border-slate-300">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left print:text-slate-900 print:px-1 print:py-2">Produk / Varian</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right print:text-slate-900 print:px-1 print:py-2">Biaya Satuan</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center print:text-slate-900 print:px-1 print:py-2">Jumlah</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right print:text-slate-900 print:px-1 print:py-2">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800 print:divide-slate-200">
                                        {purchase.items.map((item) => (
                                            <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors print:hover:bg-transparent">
                                                <td className="px-6 py-5 print:px-1 print:py-1.5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-xs leading-none print:text-slate-900 print:text-[10px]">
                                                            {item.product.name}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-2 print:mt-0.5">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-gray-800 px-1.5 py-0.5 rounded leading-none print:border-none print:text-slate-400 print:p-0 print:text-[8px]">
                                                                {item.product.sku}
                                                            </span>
                                                            {item.product_variant && (
                                                                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest italic print:text-slate-500 print:text-[8px]">
                                                                    ({item.product_variant.name})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right font-semibold text-gray-500 text-xs tabular-nums print:text-slate-900 print:px-1 print:text-[10px]">
                                                    {formatCurrency(item.unit_cost)}
                                                </td>
                                                <td className="px-6 py-5 text-center print:px-1 print:text-[10px]">
                                                    <span className="text-xs font-black text-gray-900 dark:text-white px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 tabular-nums print:bg-transparent print:border-none print:px-0 print:text-[10px]">
                                                        {item.qty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right print:px-1 print:text-[10px]">
                                                    <p className="text-xs font-black text-gray-900 dark:text-white tracking-tight tabular-nums print:text-slate-900 print:text-[10px]">
                                                        {formatCurrency(item.subtotal)}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-slate-900">
                                            <td colSpan={3} className="px-6 py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right print:px-1 print:py-2 print:text-[10px]">TOTAL NILAI PEMBELIAN</td>
                                            <td className="px-6 py-4 text-right print:px-1 print:py-2">
                                                <p className="text-base font-black text-slate-900 tracking-tighter italic print:text-sm">
                                                    {formatCurrency(purchase.total_amount)}
                                                </p>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {purchase.notes && (
                                <div className="p-8 border-t border-gray-100 dark:border-gray-800 print:px-0 print:border-none print:pt-2">
                                    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 print:bg-slate-50 print:border-slate-200 print:p-2 print:rounded-xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 print:text-slate-600 print:mb-1 print:text-[8px]">
                                            <FileText className="w-3.5 h-3.5 print:hidden" /> Catatan Tambahan
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed print:text-slate-900 print:text-[9px]">
                                            "{purchase.notes}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Print Signature Section */}
                            <div className="hidden print:grid grid-cols-2 gap-20 mt-8 text-center">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-12 print:text-[8px] print:mb-8">Dipersiapkan Oleh,</p>
                                    <div className="border-b border-slate-900 w-32 mx-auto"></div>
                                    <p className="text-[10px] font-black text-slate-900 mt-2 uppercase print:text-[8px]">( {purchase.user?.name} )</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-12 print:text-[8px] print:mb-8">Pemasok / Supplier,</p>
                                    <div className="border-b border-slate-900 w-32 mx-auto"></div>
                                    <p className="text-[10px] font-black text-slate-900 mt-2 uppercase print:text-[8px]">( {purchase.supplier?.name || '________________'} )</p>
                                </div>
                            </div>

                            <div className="p-8 mt-auto border-t border-gray-100 dark:border-gray-800 text-center print:hidden">
                                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em] italic">
                                    --- Akhir Dari Laporan Penerimaan Barang ---
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 10mm; }
                    body { background: white !important; }
                    header, nav, aside, footer, .print\\:hidden { display: none !important; }
                    .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
                    * { color-adjust: exact !important; -webkit-print-color-adjust: exact !important; font-display: block; }
                }
            `}} />
        </AuthenticatedLayout>
    );
}
