import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PendingTransaction {
    id: string;                    // UUID-like ID for dedup
    payload: {
        items: Array<{
            product_id: number;
            product_variant_id: number | null;
            qty: number;
            discount: number;
        }>;
        tax: number;
        discount: number;
        paid: number;
        payment_method: string;
        customer_id: number | null;
        notes: string;
    };
    localSaleData: any;            // Snapshot of sale data for display/receipt
    createdAt: string;             // ISO string
    retryCount: number;
    lastError: string | null;
    status: 'pending' | 'syncing' | 'failed' | 'synced';
}

interface PendingTransactionsStore {
    transactions: PendingTransaction[];
    addTransaction: (payload: PendingTransaction['payload'], localSaleData: any) => string;
    removeTransaction: (id: string) => void;
    updateStatus: (id: string, status: PendingTransaction['status'], error?: string) => void;
    incrementRetry: (id: string) => void;
    clearSynced: () => void;
    getPendingCount: () => number;
}

/**
 * Generate a simple unique ID for pending transactions
 */
function generateId(): string {
    return `ptx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const usePendingTransactions = create<PendingTransactionsStore>()(
    persist(
        (set, get) => ({
            transactions: [],

            addTransaction: (payload, localSaleData) => {
                const id = generateId();
                const transaction: PendingTransaction = {
                    id,
                    payload,
                    localSaleData,
                    createdAt: new Date().toISOString(),
                    retryCount: 0,
                    lastError: null,
                    status: 'pending',
                };

                set((state) => ({
                    transactions: [...state.transactions, transaction],
                }));

                return id;
            },

            removeTransaction: (id) => {
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                }));
            },

            updateStatus: (id, status, error) => {
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id
                            ? { ...t, status, lastError: error || t.lastError }
                            : t
                    ),
                }));
            },

            incrementRetry: (id) => {
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id
                            ? { ...t, retryCount: t.retryCount + 1 }
                            : t
                    ),
                }));
            },

            clearSynced: () => {
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.status !== 'synced'),
                }));
            },

            getPendingCount: () => {
                return get().transactions.filter(
                    (t) => t.status === 'pending' || t.status === 'failed'
                ).length;
            },
        }),
        {
            name: 'pos-pending-transactions',
        }
    )
);
