import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps, Sale } from '@/types';
import { ArrowLeft, Save, RotateCcw, AlertTriangle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props extends PageProps {
    sale: Sale & {
        items: any[];
        returns: any[];
    };
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function ReturnsCreate() {
    const { sale } = usePage<Props>().props;

    // Calculate maximum returnable quantity for each item
    const getRemainingQty = (itemId: number) => {
        const saleItem = sale.items.find(i => i.id === itemId);
        if (!saleItem) return 0;
        
        const returnedQty = sale.returns?.reduce((acc, ret) => {
            const retItem = ret.items.find((ri: any) => 
                ri.product_id === saleItem.product_id && 
                ri.product_variant_id === saleItem.product_variant_id
            );
            return acc + (retItem ? retItem.qty : 0);
        }, 0) || 0;

        return saleItem.qty - returnedQty;
    };

    const form = useForm({
        sale_id: sale.id,
        total_refund: 0,
        notes: '',
        items: [] as any[],
    });

    const addItemToReturn = (saleItem: any) => {
        const maxQty = getRemainingQty(saleItem.id);
        if (maxQty <= 0) return;

        const existing = form.data.items.find(i => i.sale_item_id === saleItem.id);
        if (existing) return;

        form.setData('items', [
            ...form.data.items,
            {
                sale_item_id: saleItem.id,
                product_id: saleItem.product_id,
                product_variant_id: saleItem.product_variant_id,
                product_name: saleItem.product_name,
                qty: 1,
                max_qty: maxQty,
                refund_price: Number(saleItem.price),
                is_damaged: false,
            }
        ]);
    };

    const removeItem = (saleItemId: number) => {
        form.setData('items', form.data.items.filter(i => i.sale_item_id !== saleItemId));
    };

    const updateItem = (saleItemId: number, key: string, value: any) => {
        form.setData('items', form.data.items.map(item => {
            if (item.sale_item_id === saleItemId) {
                let newValue = value;
                if (key === 'qty') {
                    newValue = Math.max(1, Math.min(item.max_qty, parseInt(value) || 1));
                }
                return { ...item, [key]: newValue };
            }
            return item;
        }));
    };

    // Auto-calculate total refund
    useEffect(() => {
        const total = form.data.items.reduce((acc, item) => acc + (item.qty * item.refund_price), 0);
        form.setData('total_refund', total);
    }, [form.data.items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('returns.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Proses Retur - ${sale.invoice_number}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('sales.show', sale.id)} className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proses Retur Barang</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Nota: <span className="font-semibold text-gray-700 dark:text-gray-200">{sale.invoice_number}</span></p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Sale Items Selection */}
                        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800/50 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800/50 bg-gray-50 dark:bg-transparent">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Pilih Item dari Nota</h3>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                {sale.items.map((item) => {
                                    const available = getRemainingQty(item.id);
                                    const isSelected = form.data.items.some(i => i.sale_item_id === item.id);
                                    
                                    return (
                                        <div key={item.id} className="p-4 flex items-center justify-between group">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                                                <p className="text-xs text-gray-500">Tersedia: {available} / {item.qty} item</p>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={available <= 0 || isSelected}
                                                onClick={() => addItemToReturn(item)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                                    ${available <= 0 || isSelected ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : 
                                                    'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20'}`}
                                            >
                                                {isSelected ? 'Sudah Dipilih' : available <= 0 ? 'Sudah Diretur' : 'Pilih Item'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected Items Form */}
                        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800/50 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800/50 bg-gray-50 dark:bg-transparent flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Daftar Barang Diretur</h3>
                                <span className="text-xs text-gray-500">{form.data.items.length} item unik</span>
                            </div>
                            <div className="p-4 bg-gray-50/50 dark:bg-transparent min-h-[100px]">
                                {form.data.items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                                        <p className="text-sm">Belum ada item yang dipilih untuk diretur</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {form.data.items.map((item) => (
                                            <div key={item.sale_item_id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white">{item.product_name}</h4>
                                                        <p className="text-xs text-gray-500">Maksimal retur: {item.max_qty}</p>
                                                    </div>
                                                    <button type="button" onClick={() => removeItem(item.sale_item_id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Jumlah</label>
                                                        <input 
                                                            type="number" 
                                                            value={item.qty}
                                                            onChange={e => updateItem(item.sale_item_id, 'qty', e.target.value)}
                                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Nilai Refund/Item</label>
                                                        <input 
                                                            type="number" 
                                                            value={item.refund_price}
                                                            onChange={e => updateItem(item.sale_item_id, 'refund_price', e.target.value)}
                                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex items-end pb-1.5">
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <div className="relative">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={item.is_damaged}
                                                                    onChange={e => updateItem(item.sale_item_id, 'is_damaged', e.target.checked)}
                                                                    className="sr-only"
                                                                />
                                                                <div className={`w-8 h-4 rounded-full transition-colors ${item.is_damaged ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                                                                <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${item.is_damaged ? 'translate-x-4' : ''}`}></div>
                                                            </div>
                                                            <span className={`text-xs font-medium ${item.is_damaged ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>Kondisi Rusak</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                {item.is_damaged && (
                                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                        <p className="text-[10px] text-red-600 dark:text-red-400 font-medium italic">
                                                            Peringatan: Stok barang ini tidak akan ditambahkan kembali ke inventaris.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 dark:border-gray-800/50 shadow-sm space-y-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Ringkasan Refund</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alasan Retur</label>
                                    <textarea
                                        value={form.data.notes}
                                        onChange={e => form.setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Alasan pengembalian barang..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500/50"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs text-gray-500 mb-1">Total Nominal yang Dikembalikan</p>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {formatCurrency(form.data.total_refund)}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing || form.data.items.length === 0}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold hover:from-orange-400 hover:to-red-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                            >
                                <Save className="w-5 h-5" /> Konfirmasi Retur
                            </button>
                            
                            <p className="text-[10px] text-gray-500 text-center italic">
                                * Dana akan dipotong dari saldo Shift kasir saat ini jika transaksi dilakukan hari ini.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
