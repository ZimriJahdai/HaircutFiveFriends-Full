import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  items: [],
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.id === item.id && i.type === (item.type || 'PRODUCT')
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === existing.id && i.type === existing.type
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: item.id,
                type: item.type || 'PRODUCT',
                name: item.name,
                price: item.price,
                image: item.image || null,
                quantity: item.quantity || 1,
              },
            ],
          });
        }
      },

      removeItem: (id, type) => {
        set({
          items: get().items.filter(
            (i) => !(i.id === id && i.type === (type || 'PRODUCT'))
          ),
        });
      },

      updateQuantity: (id, type, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.id === id && i.type === (type || 'PRODUCT')
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + Number(i.price || 0) * i.quantity, 0),

      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'haircut-mobile-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
