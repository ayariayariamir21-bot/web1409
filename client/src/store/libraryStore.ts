import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct } from "@/data";

export type PurchaseItem = {
  productId: string;
  title: string;
  thumbnail: string;
  type: string;
  price: number;
  qty: number;
};

export type Purchase = {
  id: string; // internal id
  orderId: string; // DS-YYYY-XXXX
  items: PurchaseItem[];
  date: string; // ISO string
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
};

type LibraryState = {
  purchases: Purchase[];
  addPurchase: (order: Purchase) => void;
  hasPurchased: (productId: string) => boolean;
  clear: () => void;
};

function seedPurchases(): Purchase[] {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000 * 2);
  const mk = (ids: string[], orderId: string, date: Date): Purchase => {
    const items: PurchaseItem[] = ids
      .map((id) => getProduct(id))
      .filter(Boolean)
      .map((p) => ({
        productId: p!.id,
        title: p!.title,
        thumbnail: p!.thumbnail,
        type: p!.type,
        price: p!.price,
        qty: 1,
      }));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    return {
      id: orderId,
      orderId,
      items,
      date: date.toISOString(),
      subtotal,
      discount: 0,
      tax,
      total: Math.round((subtotal + tax) * 100) / 100,
    };
  };
  return [
    mk(["bk-01"], "DS-2025-4821", yesterday),
    mk(["co-08"], "DS-2025-7392", new Date(now.getTime() - 86400000 * 9)),
  ];
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      purchases: seedPurchases(),
      addPurchase: (order) =>
        set({ purchases: [order, ...get().purchases] }),
      hasPurchased: (productId) =>
        get().purchases.some((p) =>
          p.items.some((i) => i.productId === productId),
        ),
      clear: () => set({ purchases: [] }),
    }),
    {
      name: "ds-library-v2",
      partialize: (s) => ({ purchases: s.purchases }),
    },
  ),
);

// Helper to get flat productIds
export function getLibraryProductIds(purchases: Purchase[]): string[] {
  return Array.from(
    new Set(purchases.flatMap((p) => p.items.map((i) => i.productId))),
  );
}
