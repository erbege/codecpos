import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

export interface HeldOrder {
    id: string;
    customer_id: number | null;
    customer_name: string;
    items: CartItem[];
    subtotal: number;
    createdAt: string;
    notes: string;
}

interface HoldOrderStore {
    heldOrders: HeldOrder[];
    holdOrder: (data: Omit<HeldOrder, 'id' | 'createdAt'>) => void;
    restoreOrder: (id: string) => HeldOrder | null;
    removeOrder: (id: string) => void;
    getHoldCount: () => number;
}

export const useHoldOrderStore = create<HoldOrderStore>()(
    persist(
        (set, get) => ({
            heldOrders: [],

            holdOrder: (data) => {
                const newOrder: HeldOrder = {
                    ...data,
                    id: `hold_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    heldOrders: [newOrder, ...state.heldOrders],
                }));
            },

            restoreOrder: (id) => {
                const order = get().heldOrders.find((o) => o.id === id);
                if (order) {
                    set((state) => ({
                        heldOrders: state.heldOrders.filter((o) => o.id !== id),
                    }));
                    return order;
                }
                return null;
            },

            removeOrder: (id) => {
                set((state) => ({
                    heldOrders: state.heldOrders.filter((o) => o.id !== id),
                }));
            },

            getHoldCount: () => get().heldOrders.length,
        }),
        {
            name: 'pos-held-orders',
        }
    )
);
