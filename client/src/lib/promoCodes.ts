import type { Product } from "@/data";
import { getProduct } from "@/data";
import { useCouponsStore } from "@/store/couponsStore";

export type PromoCode = {
  code: string;
  discountPercent: number;
  appliesTo?: "all" | "kids" | string;
  maxDiscount?: number;
  fixedValue?: number;
  description: string;
};

// Keep static for fallback if store empty (first load before persist)
export const PROMO_CODES: Record<string, PromoCode> = {
  DIGITAL10: {
    code: "DIGITAL10",
    discountPercent: 10,
    appliesTo: "all",
    description: "10% off entire cart",
  },
  KIDS20: {
    code: "KIDS20",
    discountPercent: 20,
    appliesTo: "kids",
    description: "20% off kids items only",
  },
  FREE50: {
    code: "FREE50",
    discountPercent: 50,
    appliesTo: "all",
    maxDiscount: 20,
    description: "50% off, max $20 discount",
  },
};

export type AppliedPromo = PromoCode | null;

export type PromoValidationResult =
  | { valid: true; promo: PromoCode }
  | { valid: false; error: string };

function couponToPromo(code: string): PromoCode | null {
  try {
    const store = useCouponsStore.getState();
    const c = store.coupons.find((x) => x.code.toUpperCase() === code.toUpperCase());
    if (!c) return null;
    // check active, dates, maxUses
    if (!c.isActive) return null;
    const now = new Date().toISOString().slice(0, 10);
    if (c.startsAt && now < c.startsAt) return null;
    if (c.expiresAt && now > c.expiresAt) return null;
    if (c.maxUses && c.usedCount >= c.maxUses) return null;
    const isPercent = c.type === "percent";
    return {
      code: c.code,
      discountPercent: isPercent ? c.value : 0,
      fixedValue: !isPercent ? c.value : undefined,
      appliesTo: c.appliesTo as any,
      maxDiscount: isPercent && c.code === "FREE50" ? 20 : undefined,
      description: isPercent ? `${c.value}% off` : `$${c.value} off`,
    };
  } catch {
    return null;
  }
}

export function validatePromoCode(code: string): PromoValidationResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, error: "Enter a promo code" };
  // try store first
  const fromStore = couponToPromo(normalized);
  if (fromStore) return { valid: true, promo: fromStore };
  const promo = PROMO_CODES[normalized];
  if (!promo) return { valid: false, error: "Invalid promo code" };
  return { valid: true, promo };
}

export type CartItemForPromo = {
  productId: string;
  qty: number;
  price: number;
};

export function getEligibleSubtotal(
  items: CartItemForPromo[],
  promo: PromoCode | null,
  productLookup: (id: string) => Product | undefined = getProduct,
): number {
  if (!promo) return 0;
  const applies = promo.appliesTo ?? "all";
  if (applies === "kids") {
    return items.reduce((sum, item) => {
      const p = productLookup(item.productId);
      if (p?.type === "kids" || p?.category === "Kids Room") {
        return sum + item.price * item.qty;
      }
      return sum;
    }, 0);
  }
  if (applies !== "all") {
    // category slug or product id
    return items.reduce((sum, item) => {
      const p = productLookup(item.productId);
      if (!p) return sum;
      if (p.category.toLowerCase() === applies.toLowerCase() || p.type === applies || p.id === applies || p.slug === applies) {
        return sum + item.price * item.qty;
      }
      // also handle appliesTo as comma-separated ids
      if (applies.includes(",") && applies.split(",").map((s) => s.trim()).includes(p.id)) {
        return sum + item.price * item.qty;
      }
      return sum;
    }, 0);
  }
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function calculateDiscount(
  items: CartItemForPromo[],
  promo: PromoCode | null,
): number {
  if (!promo) return 0;
  const eligible = getEligibleSubtotal(items, promo);
  if (eligible <= 0) return 0;
  // fixed value
  if (promo.fixedValue !== undefined) {
    return Math.round(Math.min(promo.fixedValue, eligible) * 100) / 100;
  }
  let discount = (eligible * promo.discountPercent) / 100;
  if (promo.maxDiscount !== undefined) {
    discount = Math.min(discount, promo.maxDiscount);
  }
  return Math.round(discount * 100) / 100;
}
