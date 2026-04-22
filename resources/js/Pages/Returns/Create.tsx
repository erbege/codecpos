import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps, Sale } from '@/types';
import { ArrowLeft, Save, RotateCcw, AlertTriangle, Trash2, Receipt, Package, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import NumericInput from '@/Components/NumericInput';

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
        toast.info(`Item ${saleItem.product_name} dipilih untuk retur`);
    };

    const removeItem = (saleItemId: number) => {
        form.setData('items', form.data.items.filter(i => i.sale_item_id !== saleItemId));
        toast.error('Item dibatalkan dari list retur');
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
        form.post(route('returns.store'), {
            onSuccess: () => {
                toast.success('Retur penjualan berhasil diproses!');
            },
            onError: (err) => {
                toast.error('Gagal memproses retur. Silakan periksa data kembali.');
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Proses Retur - ${sale.invoice_number}`} />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <Link href={route('sales.show', sale.id)} className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 transition shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Proses Retur Barang</h1>
                            <p className="text-sm font-semibold text-gray-400">Pengembalian barang dari Nota <span className="text-indigo-600 dark:text-indigo-400">#{sale.invoice_number}</span></p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        {/* Summary Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Receipt className="w-4 h-4 text-orange-500" />
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Detail Refund</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Alasan Pengembalian</label>
                                    <textarea
                                        value={form.data.notes}
                                        onChange={e => form.setData('notes', e.target.value)}
                                        rows={4}
                                        required
                                        placeholder="Tulis alasan pelanggan mengembalikan barang..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-xs font-semibold text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500/20"
                                    />
                                    {form.errors.notes && <p className="mt-1 text-[10px] text-rose-500 font-bold">{form.errors.notes}</p>}
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Total Dana Dikembalikan</p>
                                    <p className="text-3xl font-black text-orange-600 dark:text-orange-400 tracking-tight leading-none">
                                        {formatCurrency(form.data.total_refund)}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing || form.data.items.length === 0}
                                className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" /> PROSES RETUR
                                </span>
                            </button>
                            
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed italic text-center">
                                    Dana refund akan dipotong dari saldo shift kasir saat ini.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sale Items Selection */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-[500px] shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4 text-indigo-500" />
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pilih Item Nota</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400">{sale.items.length} ITEMS</span>
                                </div>
                                <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {sale.items.map((item) => {
                                        const available = getRemainingQty(item.id);
                                        const isSelected = form.data.items.some(i => i.sale_item_id === item.id);
                                        
                                        return (
                                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-xs uppercase tracking-tight truncate">{item.product_name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">BISA RETUR: <span className="text-indigo-600">{available} PCS</span></p>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={available <= 0 || isSelected}
                                                    onClick={() => addItemToReturn(item)}
                                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${available <= 0 || isSelected 
                                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                                            : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm'}`}
                                                >
                                                    {isSelected ? 'DIPILIH' : available <= 0 ? 'HABIS' : 'PILIH'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Selection Status */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-[500px] shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-orange-500" />
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Daftar Retur</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400">{form.data.items.length} TERPILIH</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {form.data.items.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-3">
                                            <RotateCcw className="w-12 h-12 opacity-10" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-center px-8">Silakan pilih item dari daftar sebelah kiri untuk diproses</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {form.data.items.map((item) => (
                                                <div key={item.sale_item_id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                                    <div className="flex justify-between items-start">
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate leading-tight">{item.product_name}</h4>
                                                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">MAX: {item.max_qty} • REFUND: {formatCurrency(item.refund_price)}</p>
                                                        </div>
                                                        <button type="button" onClick={() => removeItem(item.sale_item_id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1.5">JUMLAH RETUR</label>
                                                            <NumericInput 
                                                                value={item.qty}
                                                                onChange={val => updateItem(item.sale_item_id, 'qty', val)}
                                                                className="w-full px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="flex-1 flex flex-col justify-end h-full mt-auto pb-1">
                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                <div className="relative">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={item.is_damaged}
                                                                        onChange={e => updateItem(item.sale_item_id, 'is_damaged', e.target.checked)}
                                                                        className="sr-only"
                                                                    />
                                                                    <div className={`w-8 h-4 rounded-full transition-colors ${item.is_damaged ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                                                                    <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${item.is_damaged ? 'translate-x-4' : ''}`}></div>
                                                                </div>
                                                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${item.is_damaged ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}`}>RUSAK</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    
                                                    {item.is_damaged && (
                                                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                                                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold leading-relaxed uppercase tracking-widest">
                                                                STOK TIDAK AKAN DIKEMBALIKAN KE INVENTARIS KARENA RUSAK.
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
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
