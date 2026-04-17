import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartStore {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: number | string) => void;
    updateQuantity: (productId: number | string, qty: number) => void;
    updateDiscount: (productId: number | string, discount: number) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],

    addItem: (product: any) => {
        set((state) => {
            const existing = state.items.find((i) => i.product.id === product.id);
            if (existing) {
                // Increase qty, max = stock
                if (existing.qty >= product.stock) return state;
                return {
                    items: state.items.map((i) =>
                        i.product.id === product.id
                            ? { ...i, qty: i.qty + 1 }
                            : i
                    ),
                };
            }
            return {
                items: [...state.items, { product, qty: 1, discount: 0 }],
            };
        });
    },

    removeItem: (productId: number | string) => {
        set((state) => ({
            items: state.items.filter((i) => i.product.id !== productId),
        }));
    },

    updateQuantity: (productId: number | string, qty: number) => {
        set((state) => ({
            items: state.items.map((i) =>
                i.product.id === productId
                    ? { ...i, qty: Math.max(1, Math.min(qty, i.product.stock)) }
                    : i
            ),
        }));
    },

    updateDiscount: (productId: number | string, discount: number) => {
        set((state) => ({
            items: state.items.map((i) =>
                i.product.id === productId
                    ? { ...i, discount: Math.max(0, discount) }
                    : i
            ),
        }));
    },

    clearCart: () => set({ items: [] }),

    getSubtotal: () => {
        return get().items.reduce(
            (total, item) => total + item.product.price * item.qty - item.discount,
            0
        );
    },

    getItemCount: () => {
        return get().items.reduce((total, item) => total + item.qty, 0);
    },
}));
