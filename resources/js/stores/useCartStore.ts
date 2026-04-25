import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
    items: CartItem[];
    selectedIndex: number | null;
    setSelectedIndex: (index: number | null) => void;
    addItem: (product: Product) => void;
    removeItem: (productId: number | string) => void;
    updateQuantity: (productId: number | string, qty: number) => void;
    updateDiscount: (productId: number | string, discount: number) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            selectedIndex: null,

            setSelectedIndex: (index: number | null) => set({ selectedIndex: index }),

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
                    const newItems = [...state.items, { product, qty: 1, discount: 0 }];
                    return {
                        items: newItems,
                        selectedIndex: newItems.length - 1
                    };
                });
            },

            removeItem: (productId: number | string) => {
                set((state) => {
                    const index = state.items.findIndex(i => i.product.id === productId);
                    const newItems = state.items.filter((i) => i.product.id !== productId);
                    let nextIndex = state.selectedIndex;
                    
                    if (newItems.length === 0) {
                        nextIndex = null;
                    } else if (state.selectedIndex !== null && state.selectedIndex >= newItems.length) {
                        nextIndex = newItems.length - 1;
                    }

                    return {
                        items: newItems,
                        selectedIndex: nextIndex
                    };
                });
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

            clearCart: () => set({ items: [], selectedIndex: null }),

            getSubtotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.product.price * item.qty - item.discount,
                    0
                );
            },

            getItemCount: () => {
                return get().items.reduce((total, item) => total + item.qty, 0);
            },
        }),
        {
            name: 'pos-cart-storage', // name of the item in the storage (must be unique)
        }
    )
);
