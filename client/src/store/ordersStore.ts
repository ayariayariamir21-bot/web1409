import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateMockOrders, type Order, type OrderStatus } from "@/lib/mockOrders";
import { useProductsStore } from "@/store/productsStore";
export type { Order, OrderStatus };

type OrdersState = {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus) => void;
  refund: (id: string) => void;
  resendDownload: (id: string) => void;
  addNote: (id: string, note: string) => void;
  ensureSeed: () => void;
};

function seed(): Order[] {
  try {
    const products = useProductsStore.getState().products;
    if (products.length) return generateMockOrders(products as any, 44);
  } catch {}
  // fallback without products
  return generateMockOrders([] as any, 44);
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: seed(),
      updateStatus: (id, status) =>
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, status, timeline: [...o.timeline, { status, at: new Date().toISOString() }] } : o)),
        }),
      refund: (id) =>
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, status: "refunded" as OrderStatus, timeline: [...o.timeline, { status: "refunded" as OrderStatus, at: new Date().toISOString(), note: "Refunded" }] } : o)),
        }),
      resendDownload: () => {},
      addNote: (id, note) =>
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, note } : o)),
        }),
      ensureSeed: () => {
        if (get().orders.length === 0) set({ orders: seed() });
      },
    }),
    {
      name: "ds-orders-v1",
      partialize: (s) => ({ orders: s.orders }),
    }
  )
);
