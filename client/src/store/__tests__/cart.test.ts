/**
 * Characterization tests — cart domain (client-side, pre-server).
 *
 * KEEP on server migration: line-item merge by productId, qty floor at 1
 * (removal), free-product exclusion, 8% tax base, promo error clearing.
 * CHANGE on server migration: anything marked LEGACY below — cart snapshots
 * prices/titles client-side and totals trust them (see security tests).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { getProduct, type Product } from "@/data";
import {
  getCartTotals,
  useCartStore,
  type CartItem,
} from "@/store/cartStore";
import { useProductsStore } from "@/store/productsStore";

const sw01 = () => getProduct("sw-01") as Product;
const kd01 = () => getProduct("kd-01") as Product;
const os03 = () => getProduct("os-03") as Product;

const freeBook: Product = {
  ...(sw01() as Product),
  id: "test-free-book",
  slug: "test-free-book",
  type: "book",
  price: 9,
  isFree: true,
};

const zeroPriceSoftware: Product = {
  ...(sw01() as Product),
  id: "test-zero-sw",
  slug: "test-zero-sw",
  type: "software",
  price: 0,
  isFree: false,
};

function resetCart() {
  localStorage.clear();
  useCartStore.setState({
    items: [],
    isOpen: false,
    appliedPromo: null,
    promoError: null,
  });
}

beforeEach(() => {
  resetCart();
  useProductsStore.getState().reset();
});

describe("cart line items", () => {
  it("adds a paid product as a new line with snapshotted fields", () => {
    useCartStore.getState().addItem(sw01());

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: "sw-01",
      qty: 1,
      price: 39,
      title: "Regex Visual Debugger",
      type: "software",
    });
  });

  it("merges repeat adds of the same product into one line", () => {
    const api = useCartStore.getState();
    api.addItem(sw01());
    useCartStore.getState().addItem(sw01(), 2);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(3);
  });

  it("sets quantity directly with updateQty", () => {
    useCartStore.getState().addItem(sw01());
    useCartStore.getState().updateQty("sw-01", 5);

    expect(useCartStore.getState().items[0].qty).toBe(5);
  });

  it("removes the line when quantity drops below 1", () => {
    useCartStore.getState().addItem(sw01(), 2);
    useCartStore.getState().updateQty("sw-01", 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removes a line by product id", () => {
    const api = useCartStore.getState();
    api.addItem(sw01());
    api.addItem(kd01());
    useCartStore.getState().removeItem("sw-01");

    expect(
      useCartStore.getState().items.map((i) => i.productId),
    ).toEqual(["kd-01"]);
  });

  it("clears items and promo state on clearCart", () => {
    const api = useCartStore.getState();
    api.addItem(sw01());
    api.applyPromo("DIGITAL10");
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.appliedPromo).toBeNull();
    expect(state.promoError).toBeNull();
  });
});

describe("cart free-product exclusion (KEEP)", () => {
  it("refuses products flagged isFree", () => {
    useCartStore.getState().addItem(freeBook);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("refuses open-source products even when not flagged free", () => {
    // os-03 is price 0 / type open-source in the static catalog.
    expect(os03().price).toBe(0);
    useCartStore.getState().addItem(os03());

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("refuses zero-price products of paid types", () => {
    useCartStore.getState().addItem(zeroPriceSoftware);

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe("cart totals math (KEEP formulas, CHANGE authority)", () => {
  const line = (productId: string, qty: number, price: number): CartItem => ({
    productId,
    qty,
    price,
    title: productId,
    thumbnail: "",
    type: "software",
  });

  it("computes subtotal, 8% tax and total without promo", () => {
    const totals = getCartTotals([line("sw-01", 2, 39)], null);

    expect(totals.subtotal).toBe(78);
    expect(totals.discountAmount).toBe(0);
    expect(totals.tax).toBe(6.24);
    expect(totals.total).toBe(84.24);
    expect(totals.itemCount).toBe(2);
  });

  it("taxes the discounted subtotal, not the raw subtotal", () => {
    const totals = getCartTotals([line("sw-01", 2, 39)], {
      code: "DIGITAL10",
      discountPercent: 10,
      appliesTo: "all",
      description: "10% off entire cart",
    });

    // 78 - 7.80 = 70.20 taxable; tax 5.62; total 75.82.
    expect(totals.discountAmount).toBe(7.8);
    expect(totals.tax).toBe(5.62);
    expect(totals.total).toBe(75.82);
  });

  it("counts quantities across lines for the cart badge", () => {
    const totals = getCartTotals(
      [line("sw-01", 2, 39), line("kd-01", 3, 15)],
      null,
    );

    expect(totals.itemCount).toBe(5);
  });
});

describe("cart promo state (KEEP UX, CHANGE authority)", () => {
  it("stores a valid promo and clears previous errors", () => {
    const api = useCartStore.getState();
    expect(api.applyPromo("DIGITAL10")).toBe(true);

    const state = useCartStore.getState();
    expect(state.appliedPromo?.code).toBe("DIGITAL10");
    expect(state.promoError).toBeNull();
  });

  it("rejects unknown codes with an inline error and keeps no promo", () => {
    const api = useCartStore.getState();
    expect(api.applyPromo("NOPE-999")).toBe(false);

    const state = useCartStore.getState();
    expect(state.appliedPromo).toBeNull();
    expect(state.promoError).toBe("Invalid promo code");
  });

  it("clears promo and error on removePromo", () => {
    const api = useCartStore.getState();
    api.applyPromo("DIGITAL10");
    useCartStore.getState().removePromo();

    const state = useCartStore.getState();
    expect(state.appliedPromo).toBeNull();
    expect(state.promoError).toBeNull();
  });
});

describe("LEGACY cart price trust (MUST CHANGE on server migration)", () => {
  it("keeps the add-time price snapshot when the catalog price changes", () => {
    useCartStore.getState().addItem(sw01());
    useProductsStore
      .getState()
      .updateProduct("sw-01", { price: 999 } as Partial<Product>);

    // LEGACY: the cart still charges 39. The server must re-price lines.
    expect(useCartStore.getState().items[0].price).toBe(39);
    expect(useProductsStore.getState().getProduct("sw-01")?.price).toBe(
      999,
    );
  });

  it("totals follow attacker-controlled item prices, not the catalog", () => {
    // LEGACY: totals are derived from client-supplied CartItem.price.
    // A tampered persisted cart (price 0.01) totals ~0.01. Server totals
    // must be authoritative.
    const tampered: CartItem[] = [
      {
        productId: "sw-01",
        qty: 1,
        price: 0.01,
        title: "Regex Visual Debugger",
        thumbnail: "",
        type: "software",
      },
    ];

    expect(getCartTotals(tampered, null).total).toBe(0.01);
  });
});
