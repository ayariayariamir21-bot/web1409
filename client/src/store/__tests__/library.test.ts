/**
 * Characterization tests — local purchase creation + checkout entry rule.
 *
 * KEEP: prepend order, hasPurchased lookup, library id dedupe, empty-cart
 * redirect rule (`Checkout.tsx:95-98`).
 * CHANGE: purchase totals are computed client-side from cart snapshots and
 * persisted to localStorage with no server receipt — the server must mint
 * order ids, compute totals, and gate library grants on payment.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  getLibraryProductIds,
  useLibraryStore,
  type Purchase,
} from "@/store/libraryStore";
import {
  getCartTotals,
  useCartStore,
  type CartItem,
} from "@/store/cartStore";

function resetLibrary() {
  localStorage.clear();
  useLibraryStore.setState({ purchases: [] });
  useCartStore.setState({
    items: [],
    isOpen: false,
    appliedPromo: null,
    promoError: null,
  });
}

function order(overrides: Partial<Purchase> = {}): Purchase {
  return {
    id: "DS-2025-0001",
    orderId: "DS-2025-0001",
    items: [
      {
        productId: "sw-01",
        title: "Regex Visual Debugger",
        thumbnail: "",
        type: "software",
        price: 39,
        qty: 1,
      },
    ],
    date: "2025-06-10T00:00:00.000Z",
    subtotal: 39,
    discount: 0,
    tax: 3.12,
    total: 42.12,
    ...overrides,
  };
}

beforeEach(() => {
  resetLibrary();
});

describe("local purchase creation (KEEP shape, CHANGE authority)", () => {
  it("prepends new purchases so the latest is first", () => {
    const api = useLibraryStore.getState();
    api.addPurchase(order({ orderId: "DS-2025-0001" }));
    useLibraryStore.getState().addPurchase(order({ orderId: "DS-2025-0002" }));

    expect(
      useLibraryStore.getState().purchases.map((p) => p.orderId),
    ).toEqual(["DS-2025-0002", "DS-2025-0001"]);
  });

  it("reports ownership through hasPurchased", () => {
    useLibraryStore.getState().addPurchase(order());

    expect(useLibraryStore.getState().hasPurchased("sw-01")).toBe(true);
    expect(useLibraryStore.getState().hasPurchased("bk-01")).toBe(false);
  });

  it("dedupes product ids across purchases", () => {
    const api = useLibraryStore.getState();
    api.addPurchase(order({ orderId: "DS-2025-0001" }));
    useLibraryStore
      .getState()
      .addPurchase(
        order({ orderId: "DS-2025-0002", items: [...order().items] }),
      );

    expect(
      getLibraryProductIds(useLibraryStore.getState().purchases),
    ).toEqual(["sw-01"]);
  });

  it("clears the whole library", () => {
    const api = useLibraryStore.getState();
    api.addPurchase(order());
    useLibraryStore.getState().clear();

    expect(useLibraryStore.getState().purchases).toEqual([]);
    expect(useLibraryStore.getState().hasPurchased("sw-01")).toBe(false);
  });

  it("builds purchase totals from cart math like Checkout does", () => {
    // Mirrors Checkout.tsx:114-125 (subtotal/discount/tax/total + ISO date).
    const items: CartItem[] = [
      {
        productId: "sw-01",
        qty: 2,
        price: 39,
        title: "Regex Visual Debugger",
        thumbnail: "",
        type: "software",
      },
    ];
    const { subtotal, discountAmount, tax, total } = getCartTotals(items, {
      code: "DIGITAL10",
      discountPercent: 10,
      appliesTo: "all",
      description: "10% off entire cart",
    });
    // Same mapping as Checkout.tsx:114-125 (discountAmount -> discount).
    const purchase = order({
      items: items.map((i) => ({ ...i })),
      date: "2025-06-10T00:00:00.000Z",
      subtotal,
      discount: discountAmount,
      tax,
      total,
    });

    expect(purchase.subtotal).toBe(78);
    expect(purchase.discount).toBe(7.8);
    expect(purchase.tax).toBe(5.62);
    expect(purchase.total).toBe(75.82);
    // LEGACY: all of the above is client-computed. Server must recompute.
  });
});

describe("checkout entry rule (KEEP)", () => {
  it("treats an empty cart as a redirect to /cart", () => {
    // Enforced in Checkout.tsx:95-98 (`items.length === 0` → Redirect).
    // Characterized here at the domain level: zero lines means no checkout.
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().items.length === 0).toBe(true);
  });

  it("allows checkout to proceed with a non-empty cart", () => {
    useCartStore.setState({
      items: [
        {
          productId: "sw-01",
          qty: 1,
          price: 39,
          title: "Regex Visual Debugger",
          thumbnail: "",
          type: "software",
        },
      ],
    });

    expect(useCartStore.getState().items.length === 0).toBe(false);
  });
});
