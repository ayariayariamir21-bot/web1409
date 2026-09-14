/**
 * Characterization tests — persisted-store rehydration contracts.
 *
 * KEEP: persist key names, partialize shapes (what survives a refresh).
 * CHANGE: everything asserted here lives in readable/writable
 * localStorage. Any of it can be forged, so the server must treat all of
 * it (cart, promos, library, admin flags) as untrusted input.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "@/store/cartStore";
import { useLibraryStore } from "@/store/libraryStore";
import { useCouponsStore } from "@/store/couponsStore";
import type { CartItem } from "@/store/cartStore";

const line: CartItem = {
  productId: "sw-01",
  qty: 2,
  price: 39,
  title: "Regex Visual Debugger",
  thumbnail: "",
  type: "software",
};

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({
    items: [],
    isOpen: false,
    appliedPromo: null,
    promoError: null,
  });
  useLibraryStore.setState({ purchases: [] });
});

describe("persist shapes (KEEP)", () => {
  it("persists only items and promo for the cart, never UI state", () => {
    const partialize = useCartStore.persist.getOptions()
      .partialize as (s: Record<string, unknown>) => Record<string, unknown>;

    expect(
      partialize({
        items: [line],
        isOpen: true,
        appliedPromo: { code: "DIGITAL10" },
        promoError: "boom",
      }),
    ).toEqual({ items: [line], appliedPromo: { code: "DIGITAL10" } });
  });

  it("persists library purchases under ds-library-v2", () => {
    const partialize = useLibraryStore.persist.getOptions()
      .partialize as (s: Record<string, unknown>) => Record<string, unknown>;
    const purchases = [{ id: "DS-2025-0001" }];

    expect(partialize({ purchases })).toEqual({ purchases });
    expect(useLibraryStore.persist.getOptions().name).toBe("ds-library-v2");
  });

  it("persists coupons under ds-coupons-v1", () => {
    expect(useCouponsStore.persist.getOptions().name).toBe("ds-coupons-v1");
  });

  it("keeps the cart persist key stable for existing users", () => {
    expect(useCartStore.persist.getOptions().name).toBe("ds-cart-v2");
  });
});

describe("rehydration (KEEP behavior, CHANGE trust)", () => {
  it("rehydrates cart items written by a previous session", async () => {
    localStorage.setItem(
      "ds-cart-v2",
      JSON.stringify({ state: { items: [line], appliedPromo: null } }),
    );

    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().items).toEqual([line]);
  });

  it("writes cart mutations straight to readable localStorage", () => {
    // LEGACY security note: cart state is plain JSON under a documented
    // key. Nothing stops a user from editing prices — see cart.test.ts
    // "totals follow attacker-controlled item prices". Server checkout
    // must ignore these values except as a wishlist of product ids.
    useCartStore.setState({ items: [line] });

    const raw = JSON.parse(localStorage.getItem("ds-cart-v2") as string);
    expect(raw.state.items[0].productId).toBe("sw-01");
    expect(raw.state.items[0].price).toBe(39);
  });
});
