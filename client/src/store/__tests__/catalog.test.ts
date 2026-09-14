/**
 * Characterization tests — product catalog visibility (client-side).
 *
 * KEEP: inactive products hidden from storefront lists, slug uniqueness,
 * id-prefix convention per type, patch-merge update semantics.
 * CHANGE: `isActive` currently defaults client-side (`?? true`) with no
 * versioned persist migration; the server must own visibility and slug
 * uniqueness (client checks are advisory only).
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  getActiveProducts,
  useProductsStore,
  type AdminProduct,
} from "@/store/productsStore";

function fixture(
  overrides: Partial<AdminProduct> & { id: string },
): AdminProduct {
  return {
    slug: overrides.id,
    title: overrides.id,
    type: "software",
    category: "Software",
    price: 39,
    rating: 4.5,
    reviewsCount: 10,
    thumbnail: "https://picsum.photos/seed/x/400/300",
    gallery: [],
    description: "fixture",
    features: ["Instant access after checkout"],
    tags: ["test"],
    author: "Test Author",
    language: "English",
    isFree: false,
    isFeatured: false,
    createdAt: "2024-01-01",
    accent: "#635BFF",
    isActive: true,
    ...overrides,
  } as AdminProduct;
}

function seedCatalog() {
  localStorage.clear();
  useProductsStore.setState({
    products: [
      fixture({ id: "sw-01", slug: "alpha", title: "Alpha" }),
      fixture({
        id: "bk-01",
        slug: "bravo",
        title: "Bravo",
        type: "book",
        category: "Online Books",
        isActive: false,
      }),
      fixture({
        id: "kd-01",
        slug: "charlie",
        title: "Charlie",
        type: "kids",
        category: "Kids Room",
      }),
    ],
  });
}

beforeEach(() => {
  seedCatalog();
});

describe("storefront visibility (KEEP rule, CHANGE authority)", () => {
  it("hides inactive products from storefront lists", () => {
    const visible = getActiveProducts(useProductsStore.getState().products);

    expect(visible.map((p) => p.id).sort()).toEqual(["kd-01", "sw-01"]);
  });

  it("restores visibility when toggled back active", () => {
    useProductsStore.getState().toggleActive("bk-01");

    expect(
      getActiveProducts(useProductsStore.getState().products).map(
        (p) => p.id,
      ),
    ).toContain("bk-01");
  });

  it("new products are visible by default", () => {
    const created = useProductsStore.getState().addProduct({
      title: "Delta",
      type: "software",
      category: "Software",
      price: 19,
      description: "delta",
      author: "Test Author",
    } as Omit<AdminProduct, "id" | "slug">);

    expect(created.isActive).toBe(true);
    expect(
      getActiveProducts(useProductsStore.getState().products).some(
        (p) => p.id === created.id,
      ),
    ).toBe(true);
  });
});

describe("product identity (KEEP)", () => {
  it("resolves products by id and by slug", () => {
    const byId = useProductsStore.getState().getProduct("sw-01");
    const bySlug = useProductsStore.getState().getProduct("alpha");

    expect(byId?.title).toBe("Alpha");
    expect(bySlug?.id).toBe("sw-01");
  });

  it("returns undefined for unknown ids and empty input", () => {
    expect(useProductsStore.getState().getProduct("nope-00")).toBeUndefined();
    expect(useProductsStore.getState().getProduct()).toBeUndefined();
  });

  it("generates type-prefixed unique ids", () => {
    const created = useProductsStore.getState().addProduct({
      title: "Echo",
      type: "software",
      category: "Software",
      price: 29,
      description: "echo",
      author: "Test Author",
    } as Omit<AdminProduct, "id" | "slug">);

    // LEGACY QUIRK: genId uses type.slice(0, 2), so admin-created software
    // products get "so-" while seeds use "sw-". Characterized as-is; the
    // server must define the canonical id scheme.
    expect(created.id).toMatch(/^so-/);
    expect(
      useProductsStore
        .getState()
        .products.filter((p) => p.id === created.id),
    ).toHaveLength(1);
  });

  it("suffixes duplicate slugs instead of colliding", () => {
    const api = useProductsStore.getState();
    const first = api.addProduct({
      title: "Foxtrot",
      slug: "dupe",
      type: "software",
      category: "Software",
      price: 10,
      description: "one",
      author: "Test Author",
    } as Omit<AdminProduct, "id" | "slug">);
    const second = useProductsStore.getState().addProduct({
      title: "Foxtrot Again",
      slug: "dupe",
      type: "software",
      category: "Software",
      price: 10,
      description: "two",
      author: "Test Author",
    } as Omit<AdminProduct, "id" | "slug">);

    expect(first.slug).toBe("dupe");
    expect(second.slug).toBe("dupe-1");
  });

  it("merges patches without touching other fields", () => {
    useProductsStore.getState().updateProduct("sw-01", { price: 99 });

    const updated = useProductsStore.getState().getProduct("sw-01");
    expect(updated?.price).toBe(99);
    expect(updated?.title).toBe("Alpha");
  });

  it("removes products on delete", () => {
    useProductsStore.getState().deleteProduct("sw-01");

    expect(useProductsStore.getState().getProduct("sw-01")).toBeUndefined();
  });
});
