import React from 'react';
import Modal from './Modal';
import { Trash2, Play, Clock, X, ShoppingBag } from 'lucide-react';
import { useHoldOrderStore, HeldOrder } from '@/stores/useHoldOrderStore';

interface Props {
    show: boolean;
    onClose: () => void;
    onRestore: (order: HeldOrder) => void;
}

export default function HeldOrdersModal({ show, onClose, onRestore }: Props) {
    const holdStore = useHoldOrderStore();
    const orders = holdStore.heldOrders;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Pesanan Tertahan</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">
                            {orders.length} Pesanan dalam antrean tunggu
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {orders.length === 0 ? (
                        <div className="py-12 text-center">
                            <ShoppingBag className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Tidak ada pesanan tertahan</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div 
                                key={order.id} 
                                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                                {formatDate(order.createdAt)}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                {order.items.length} ITEM
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase leading-tight">
                                            {order.customer_name}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">
                                            {formatCurrency(order.subtotal)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onRestore(order)}
                                        className="flex-[3] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        Buka Pesanan
                                    </button>
                                    <button
                                        onClick={() => holdStore.removeOrder(order.id)}
                                        className="flex-1 flex items-center justify-center py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all shadow-sm"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                        Pesanan tertahan hanya disimpan di browser ini
                    </p>
                </div>
            </div>
        </Modal>
    );
}
