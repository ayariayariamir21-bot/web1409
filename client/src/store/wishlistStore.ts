import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  items: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: ["sw-02", "bk-04"],
      toggle: (id) =>
        set({
          items: get().items.includes(id)
            ? get().items.filter((x) => x !== id)
            : [...get().items, id],
        }),
      has: (id) => get().items.includes(id),
      add: (id) =>
        set((s) =>
          s.items.includes(id) ? s : { items: [...s.items, id] },
        ),
      remove: (id) =>
        set({ items: get().items.filter((x) => x !== id) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "ds-wishlist-v2",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
