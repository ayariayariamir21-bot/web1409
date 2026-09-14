/**
 * Characterization tests — promo validation and discount math.
 *
 * KEEP: percent math, FREE50 $20 cap, kids-only eligibility, fixed-value
 * cap at eligible subtotal, case-insensitive codes, empty-code error.
 * CHANGE: static PROMO_CODES fallback and all client-side checks
 * (isActive, dates, maxUses) must move to server validation; applied promos
 * must be re-validated server-side at checkout, not snapshotted.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { getProduct } from "@/data";
import {
  calculateDiscount,
  getEligibleSubtotal,
  validatePromoCode,
  type CartItemForPromo,
  type PromoCode,
} from "@/lib/promoCodes";
import { useCouponsStore } from "@/store/couponsStore";

const WIDE_OPEN = { startsAt: "2000-01-01", expiresAt: "2099-12-31" };

function seedCoupons() {
  localStorage.clear();
  useCouponsStore.setState({
    coupons: [
      {
        id: "cp-01",
        code: "DIGITAL10",
        type: "percent",
        value: 10,
        appliesTo: "all",
        usedCount: 0,
        isActive: true,
        ...WIDE_OPEN,
      },
      {
        id: "cp-02",
        code: "KIDS20",
        type: "percent",
        value: 20,
        appliesTo: "kids",
        usedCount: 0,
        isActive: true,
        ...WIDE_OPEN,
      },
      {
        id: "cp-03",
        code: "FREE50",
        type: "percent",
        value: 50,
        appliesTo: "all",
        maxUses: 100,
        usedCount: 0,
        isActive: true,
        ...WIDE_OPEN,
      },
    ],
  });
}

beforeEach(() => {
  seedCoupons();
});

const line = (
  productId: string,
  qty: number,
  price: number,
): CartItemForPromo => ({ productId, qty, price });

describe("promo validation (KEEP rules, CHANGE authority)", () => {
  it("accepts DIGITAL10 from the coupons store", () => {
    const result = validatePromoCode("DIGITAL10");

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.promo.discountPercent).toBe(10);
      expect(result.promo.appliesTo).toBe("all");
    }
  });

  it("accepts codes case-insensitively", () => {
    expect(validatePromoCode("digital10").valid).toBe(true);
    expect(validatePromoCode("  Kids20 ").valid).toBe(true);
  });

  it("rejects blank codes with an entry prompt, not 'invalid'", () => {
    expect(validatePromoCode("")).toEqual({
      valid: false,
      error: "Enter a promo code",
    });
    expect(validatePromoCode("   ")).toEqual({
      valid: false,
      error: "Enter a promo code",
    });
  });

  it("rejects unknown codes", () => {
    expect(validatePromoCode("NOPE-999")).toEqual({
      valid: false,
      error: "Invalid promo code",
    });
  });

  it("rejects deactivated coupons", () => {
    useCouponsStore.getState().toggleActive("cp-01");

    // OFF-store custom code path: use a non-fallback code to isolate the
    // store check from the static PROMO_CODES fallback (see legacy test).
    useCouponsStore.getState().addCoupon({
      code: "OFF5",
      type: "fixed",
      value: 5,
      appliesTo: "all",
      isActive: true,
      ...WIDE_OPEN,
    });
    const id = useCouponsStore
      .getState()
      .coupons.find((c) => c.code === "OFF5")!.id;
    useCouponsStore.getState().toggleActive(id);

    expect(validatePromoCode("OFF5")).toEqual({
      valid: false,
      error: "Invalid promo code",
    });
  });

  it("rejects expired coupons", () => {
    useCouponsStore.getState().addCoupon({
      code: "OLD5",
      type: "fixed",
      value: 5,
      appliesTo: "all",
      startsAt: "2000-01-01",
      expiresAt: "2000-01-02",
      isActive: true,
    });

    expect(validatePromoCode("OLD5").valid).toBe(false);
  });

  it("rejects coupons that hit max uses", () => {
    useCouponsStore.getState().addCoupon({
      code: "ONCE5",
      type: "fixed",
      value: 5,
      appliesTo: "all",
      maxUses: 1,
      isActive: true,
      ...WIDE_OPEN,
    });
    useCouponsStore.getState().incrementUse("ONCE5");

    expect(validatePromoCode("ONCE5").valid).toBe(false);
  });
});

describe("discount math (KEEP)", () => {
  const digital10: PromoCode = {
    code: "DIGITAL10",
    discountPercent: 10,
    appliesTo: "all",
    description: "10% off entire cart",
  };

  it("takes 10% off the whole cart for DIGITAL10", () => {
    expect(calculateDiscount([line("sw-01", 2, 39)], digital10)).toBe(7.8);
  });

  it("returns zero discount without a promo", () => {
    expect(calculateDiscount([line("sw-01", 1, 39)], null)).toBe(0);
  });

  it("caps FREE50 at $20", () => {
    const free50: PromoCode = {
      code: "FREE50",
      discountPercent: 50,
      appliesTo: "all",
      maxDiscount: 20,
      description: "50% off, max $20 discount",
    };

    expect(calculateDiscount([line("sw-01", 1, 100)], free50)).toBe(20);
    expect(calculateDiscount([line("sw-01", 1, 30)], free50)).toBe(15);
  });

  it("caps fixed-value coupons at the eligible subtotal", () => {
    const save5: PromoCode = {
      code: "SAVE5",
      discountPercent: 0,
      fixedValue: 5,
      appliesTo: "all",
      description: "$5 off",
    };

    expect(calculateDiscount([line("sw-01", 1, 100)], save5)).toBe(5);
    expect(calculateDiscount([line("sw-01", 1, 3)], save5)).toBe(3);
  });
});

describe("kids-only eligibility (KEEP)", () => {
  const kids20: PromoCode = {
    code: "KIDS20",
    discountPercent: 20,
    appliesTo: "kids",
    description: "20% off kids items only",
  };

  it("discounts only kids lines in a mixed cart", () => {
    const kidsPrice = getProduct("kd-01")!.price;
    const items = [line("kd-01", 1, kidsPrice), line("sw-01", 1, 39)];

    expect(getEligibleSubtotal(items, kids20)).toBe(kidsPrice);
    expect(calculateDiscount(items, kids20)).toBe(
      Math.round(kidsPrice * 0.2 * 100) / 100,
    );
  });

  it("discounts nothing when the cart has no kids items", () => {
    const items = [line("sw-01", 1, 39)];

    expect(getEligibleSubtotal(items, kids20)).toBe(0);
    expect(calculateDiscount(items, kids20)).toBe(0);
  });
});

describe("LEGACY coupon trust (MUST CHANGE on server migration)", () => {
  it("deactivating a hardcoded code does NOT block it via static fallback", () => {
    // LEGACY: validatePromoCode falls back to static PROMO_CODES when the
    // store lookup misses. Toggling DIGITAL10 inactive in the admin store
    // still validates through the fallback, so admin deactivation is
    // ineffective for the three hardcoded codes. The server must own the
    // single source of truth for coupon validity.
    useCouponsStore.getState().toggleActive("cp-01");

    const result = validatePromoCode("DIGITAL10");
    expect(result.valid).toBe(true);
  });
});
