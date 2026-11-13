import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_COMPARE = 4

export const useCompareStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const { items } = get()
        const exists = items.some((i) => i.id === product.id)
        if (exists) {
          set({ items: items.filter((i) => i.id !== product.id) })
          return { removed: true }
        }
        if (items.length >= MAX_COMPARE) {
          return { full: true }
        }
        set({ items: [...items, product] })
        return { added: true }
      },

      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      restore: (items) => set({ items }),
      isInCompare: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'compare-items' },
  ),
)
