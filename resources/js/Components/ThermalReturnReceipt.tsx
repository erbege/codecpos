import React from 'react';
import { usePage } from '@inertiajs/react';

interface Props {
    saleReturn: any;
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

export default function ThermalReturnReceipt({ saleReturn }: Props) {
    const { app_settings } = usePage<any>().props;
    // For outlet info, since return doesn't have direct outlet, we can use the sale's outlet or fallback to app settings
    const outlet = saleReturn?.sale?.outlet;

    return (
        <div id="thermal-return-receipt" className="hidden print:block bg-white text-black font-mono text-[10px] w-[58mm] mx-auto p-1 leading-tight">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: 58mm auto;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #thermal-return-receipt, #thermal-return-receipt * {
                        visibility: visible;
                    }
                    #thermal-return-receipt {
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
                <h1 className="text-[14px] font-black uppercase mb-0.5">{app_settings?.shop_name || outlet?.name || 'CODECPOS'}</h1>
                <p className="text-[9px] mb-0.5">{outlet?.address || app_settings?.shop_address || 'Alamat Toko'}</p>
                <div className="text-[9px] space-y-0.5 mt-1">
                    <p>Tlp: {outlet?.phone || app_settings?.shop_phone || '-'}</p>
                    {app_settings?.shop_npwp && app_settings.shop_npwp !== '-' && (
                        <p className="text-[8px]">NPWP: {app_settings.shop_npwp}</p>
                    )}
                </div>
            </div>

            <div className="text-center border-y border-dashed border-black py-1 my-2">
                <h2 className="font-bold uppercase tracking-widest text-[12px]">BUKTI RETUR</h2>
            </div>

            {/* Info */}
            <div className="space-y-0.5 mb-2">
                <div className="flex justify-between">
                    <span>No. Retur</span>
                    <span>#{saleReturn?.return_number || '-'}</span>
                </div>
                <div className="flex justify-between">
                    <span>No. Invoice Asli</span>
                    <span>#{saleReturn?.sale?.invoice_number || '-'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tanggal</span>
                    <span>{saleReturn?.created_at ? formatDate(saleReturn.created_at) : '-'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Kasir</span>
                    <span className="uppercase">{saleReturn?.user?.name || 'KASIR'}</span>
                </div>
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Items */}
            <div className="space-y-1.5 mb-2">
                <div className="font-bold text-center mb-1">ITEM DIKEMBALIKAN</div>
                {saleReturn.items?.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                        <div className="font-bold uppercase leading-none">{item.product?.name} {item.product_variant ? `(${item.product_variant.name})` : ''}</div>
                        <div className="flex justify-between italic">
                            <span>{item.qty} x {formatCurrency(item.refund_price)}</span>
                            <span>{formatCurrency(item.qty * Number(item.refund_price))}</span>
                        </div>
                        <div className="text-[9px]">
                            {item.is_damaged ? '(Kondisi: Rusak)' : '(Kondisi: Baik)'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Totals */}
            <div className="space-y-1 mb-4">
                <div className="flex justify-between font-black text-[12px] pt-1">
                    <span>TOTAL REFUND</span>
                    <span>{formatCurrency(saleReturn.total_refund)}</span>
                </div>
                {saleReturn.notes && (
                    <div className="mt-2 text-[9px] border border-black p-1">
                        <span className="font-bold">Catatan:</span> {saleReturn.notes}
                    </div>
                )}
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Footer */}
            <div className="text-center space-y-1 pt-2 pb-8">
                <p className="font-bold">TERIMA KASIH</p>
                <p className="text-[8px] uppercase">Bukti pengembalian barang dan dana. Harap simpan dengan baik.</p>
                <p className="text-[8px] italic">Powered by CodecCrafter POS</p>
            </div>
        </div>
    );
}
