import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data";
import {
  calculateDiscount,
  validatePromoCode,
  type AppliedPromo,
} from "@/lib/promoCodes";

export type CartItem = {
  productId: string;
  qty: number;
  price: number;
  title: string;
  thumbnail: string;
  type: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  appliedPromo: AppliedPromo;
  promoError: string | null;
  setOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
};

const TAX_RATE = 0.08;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedPromo: null,
      promoError: null,

      setOpen: (open) => set({ isOpen: open }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, qty = 1) => {
        if (product.isFree || product.type === "open-source" || product.price === 0) {
          return;
        }
        const existing = get().items.find((i) => i.productId === product.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === product.id ? { ...i, qty: i.qty + qty } : i,
            ),
          });
        } else {
          const newItem: CartItem = {
            productId: product.id,
            qty,
            price: product.price,
            title: product.title,
            thumbnail: product.thumbnail,
            type: product.type,
          };
          set({ items: [...get().items, newItem] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQty: (productId, qty) => {
        if (qty < 1) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, qty } : i,
          ),
        });
      },

      clearCart: () => set({ items: [], appliedPromo: null, promoError: null }),

      applyPromo: (code) => {
        const result = validatePromoCode(code);
        if (!result.valid) {
          set({ promoError: result.error });
          return false;
        }
        set({ appliedPromo: result.promo, promoError: null });
        return true;
      },

      removePromo: () => set({ appliedPromo: null, promoError: null }),
    }),
    {
      name: "ds-cart-v2",
      partialize: (state) => ({
        items: state.items,
        appliedPromo: state.appliedPromo,
      }),
    },
  ),
);

// Derived selectors (not stored)
export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmount = calculateDiscount(
    items.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price })),
    appliedPromo,
  );
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  return { subtotal, discountAmount, tax, total, itemCount, taxable };
}

export function getCartTotals(items: CartItem[], appliedPromo: AppliedPromo) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmount = calculateDiscount(
    items.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price })),
    appliedPromo,
  );
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  return { subtotal, discountAmount, tax, total, itemCount, taxable };
}
