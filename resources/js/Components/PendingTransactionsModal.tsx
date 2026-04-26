import React from 'react';
import Modal from './Modal';
import { Trash2, Clock, AlertCircle, RefreshCw, X } from 'lucide-react';
import { usePendingTransactions, PendingTransaction } from '@/stores/usePendingTransactions';

interface Props {
    show: boolean;
    onClose: () => void;
    onSync: () => void;
    isSyncing: boolean;
}

export default function PendingTransactionsModal({ show, onClose, onSync, isSyncing }: Props) {
    const pendingStore = usePendingTransactions();
    const transactions = pendingStore.transactions;

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
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Antrian Offline</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">
                            {transactions.length} Transaksi menunggu sinkronisasi
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {transactions.length === 0 ? (
                        <div className="py-12 text-center">
                            <Clock className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Tidak ada antrian</p>
                        </div>
                    ) : (
                        transactions.map((txn) => (
                            <div 
                                key={txn.id} 
                                className={`p-4 rounded-2xl border transition-all ${
                                    txn.status === 'failed' ? 'border-rose-200 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-800' : 
                                    txn.status === 'syncing' ? 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-800 animate-pulse' :
                                    'border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID: {txn.id.substring(4, 12)}</span>
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest
                                                ${txn.status === 'failed' ? 'bg-rose-500 text-white' : 
                                                  txn.status === 'syncing' ? 'bg-indigo-500 text-white' : 
                                                  'bg-amber-500 text-white'}`}
                                            >
                                                {txn.status}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase leading-tight">
                                            {txn.localSaleData?.customer?.name || 'Guest / Umum'}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">
                                            {formatDate(txn.createdAt)} • {txn.payload.items.length} Item
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">
                                            {formatCurrency(txn.localSaleData?.total || 0)}
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                            {txn.payload.payment_method}
                                        </p>
                                    </div>
                                </div>

                                {txn.lastError && (
                                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-100/50 dark:bg-rose-950/30 text-[10px] text-rose-600 dark:text-rose-400 font-bold mb-3 border border-rose-200/50">
                                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{txn.lastError}</span>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        disabled={txn.status === 'syncing' || isSyncing}
                                        onClick={() => pendingStore.removeTransaction(txn.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 flex gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all uppercase tracking-widest"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={onSync}
                        disabled={isSyncing || transactions.length === 0}
                        className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSyncing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        {isSyncing ? 'Menyinkronkan...' : 'Sinkron Sekarang'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
