import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  appliesTo: "all" | "kids" | string;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

type CouponsState = {
  coupons: Coupon[];
  addCoupon: (c: Omit<Coupon, "id" | "usedCount">) => void;
  updateCoupon: (id: string, patch: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleActive: (id: string) => void;
  incrementUse: (code: string) => void;
};

function seed(): Coupon[] {
  const now = new Date();
  const plus30 = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  const minus10 = new Date(now.getTime() - 10 * 86400000).toISOString().slice(0, 10);
  return [
    { id: "cp-01", code: "DIGITAL10", type: "percent", value: 10, appliesTo: "all", usedCount: 12, startsAt: minus10, expiresAt: plus30, isActive: true },
    { id: "cp-02", code: "KIDS20", type: "percent", value: 20, appliesTo: "kids", usedCount: 4, startsAt: minus10, expiresAt: plus30, isActive: true },
    { id: "cp-03", code: "FREE50", type: "percent", value: 50, appliesTo: "all", maxUses: 100, usedCount: 22, startsAt: minus10, expiresAt: plus30, isActive: true },
  ];
}

export const useCouponsStore = create<CouponsState>()(
  persist(
    (set, get) => ({
      coupons: seed(),
      addCoupon: (c) => {
        const id = `cp-${String(get().coupons.length + 1).padStart(2, "0")}`;
        set({ coupons: [...get().coupons, { ...c, id, usedCount: 0 }] });
      },
      updateCoupon: (id, patch) => set({ coupons: get().coupons.map((x) => (x.id === id ? { ...x, ...patch } : x)) }),
      deleteCoupon: (id) => set({ coupons: get().coupons.filter((x) => x.id !== id) }),
      toggleActive: (id) => set({ coupons: get().coupons.map((x) => (x.id === id ? { ...x, isActive: !x.isActive } : x)) }),
      incrementUse: (code) => set({ coupons: get().coupons.map((x) => (x.code === code ? { ...x, usedCount: x.usedCount + 1 } : x)) }),
    }),
    { name: "ds-coupons-v1", partialize: (s) => ({ coupons: s.coupons }) }
  )
);
