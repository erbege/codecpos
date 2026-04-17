import React from 'react';
import { Sale } from '@/types';
import { usePage } from '@inertiajs/react';

interface Props {
    sale: Sale;
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

export default function ThermalReceipt({ sale }: Props) {
    const { app_settings } = usePage<any>().props;

    return (
        <div id="thermal-receipt" className="hidden print:block bg-white text-black font-mono text-[10px] w-[58mm] mx-auto p-1 leading-tight">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: 58mm auto;
                        margin: 0;
                    }
                     body * {
                        visibility: hidden;
                    }
                    #thermal-receipt, #thermal-receipt * {
                        visibility: visible;
                    }
                    #thermal-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 58mm;
                        padding: 0 2mm;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}} />
            
            {/* Header */}
            <div className="text-center mb-4 pt-4">
                <h1 className="text-[14px] font-black uppercase mb-0.5">{app_settings?.shop_name || sale?.outlet?.name || 'CODECPOS'}</h1>
                <p className="text-[9px] mb-0.5">{sale?.outlet?.address || app_settings?.shop_address || 'Alamat Toko'}</p>
                <div className="text-[9px] space-y-0.5 mt-1">
                    <p>Tlp: {sale?.outlet?.phone || app_settings?.shop_phone || '-'}</p>
                    {app_settings?.shop_npwp && app_settings.shop_npwp !== '-' && (
                        <p className="text-[8px]">NPWP: {app_settings.shop_npwp}</p>
                    )}
                </div>
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Info */}
            <div className="space-y-0.5 mb-2">
                <div className="flex justify-between">
                    <span>Invoice</span>
                    <span>#{sale?.invoice_number || 'INV-TEMP'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tanggal</span>
                    <span>{sale?.created_at ? formatDate(sale.created_at) : '-'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Kasir</span>
                    <span className="uppercase">{sale?.user?.name || 'KASIR'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Pelanggan</span>
                    <span className="uppercase">{sale?.customer?.name || 'UMUM'}</span>
                </div>
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Items */}
            <div className="space-y-1.5 mb-2">
                {sale.items?.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                        <div className="font-bold uppercase leading-none">{item.product_name}</div>
                        <div className="flex justify-between italic">
                            <span>{item.qty} x {formatCurrency(item.price)}</span>
                            <span>{formatCurrency(item.subtotal)}</span>
                        </div>
                        {item.discount > 0 && (
                            <div className="flex justify-between text-[9px]">
                                <span>(Diskon Item)</span>
                                <span>-{formatCurrency(item.discount)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Totals */}
            <div className="space-y-1 mb-4">
                <div className="flex justify-between">
                    <span>SUBTOTAL</span>
                    <span>{formatCurrency(sale.subtotal)}</span>
                </div>
                {Number(sale.discount) > 0 && (
                    <div className="flex justify-between">
                        <span>DISKON</span>
                        <span>-{formatCurrency(sale.discount)}</span>
                    </div>
                )}
                {Number(sale.tax) > 0 && (
                    <div className="flex justify-between">
                        <span>PAJAK</span>
                        <span>{formatCurrency(sale.tax)}</span>
                    </div>
                )}
                <div className="flex justify-between font-black text-[12px] pt-1 border-t border-black">
                    <span>TOTAL</span>
                    <span>{formatCurrency(sale.total)}</span>
                </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-0.5 mb-4 text-[9px]">
                <div className="flex justify-between">
                    <span className="uppercase">Metode Bayar</span>
                    <span className="uppercase font-bold">{sale.payment_method === 'cash' ? 'TUNAI' : sale.payment_method}</span>
                </div>
                <div className="flex justify-between">
                    <span className="uppercase">{sale.payment_method === 'cash' ? 'Uang Tunai' : 'Dibayar'}</span>
                    <span>{formatCurrency(sale.paid)}</span>
                </div>
                <div className="flex justify-between font-black border-t border-black pt-0.5 mt-0.5">
                    <span className="uppercase">Kembalian</span>
                    <span>{formatCurrency(sale.change)}</span>
                </div>
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Footer */}
            <div className="text-center space-y-1 pt-2 pb-8">
                <p className="font-bold">TERIMA KASIH</p>
                <p className="text-[8px] uppercase">{app_settings?.shop_footer_notes || 'Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.'}</p>
                <p className="text-[8px] italic">Powered by CodecPOS Professional</p>
            </div>
        </div>
    );
}
