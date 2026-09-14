import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as seedProducts, type Product } from "@/data";

export type AdminProduct = Product & { isActive: boolean };

type ProductsState = {
  products: AdminProduct[];
  addProduct: (p: Omit<AdminProduct, "id" | "slug"> & { slug?: string; title: string }) => AdminProduct;
  updateProduct: (id: string, patch: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleActive: (id: string) => void;
  getProduct: (id?: string) => AdminProduct | undefined;
  reset: () => void;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function genId(type: string, existing: AdminProduct[]) {
  const prefix = type === "open-source" ? "os" : type === "website" ? "web" : type.slice(0, 2);
  const count = existing.filter((p) => p.id.startsWith(prefix + "-")).length + 1;
  const num = String(count).padStart(2, "0");
  let id = `${prefix}-${num}`;
  // ensure unique
  let n = 1;
  while (existing.some((p) => p.id === id)) {
    id = `${prefix}-${String(count + n).padStart(2, "0")}`;
    n++;
  }
  return id;
}

function seed(): AdminProduct[] {
  return seedProducts.map((p) => ({ ...p, isActive: (p as any).isActive ?? true }));
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: seed(),
      addProduct: (input) => {
        const products = get().products;
        const type = (input.type as string) || "software";
        const id = genId(type, products);
        const slugBase = input.slug?.trim() || slugify(input.title);
        let slug = slugBase;
        let i = 1;
        while (products.some((p) => p.slug === slug)) {
          slug = `${slugBase}-${i++}`;
        }
        const now = new Date().toISOString().slice(0, 10);
        const prod: AdminProduct = {
          id,
          slug,
          title: input.title,
          type: input.type as any,
          category: input.category,
          price: input.price,
          oldPrice: input.oldPrice,
          rating: input.rating ?? 4.5,
          reviewsCount: input.reviewsCount ?? 0,
          thumbnail: input.thumbnail || `https://picsum.photos/seed/${id}/400/300`,
          gallery: input.gallery?.length ? input.gallery : [`https://picsum.photos/seed/${id}-a/800/600`, `https://picsum.photos/seed/${id}-b/800/600`],
          description: input.description,
          features: input.features?.length ? input.features : ["Instant access after checkout"],
          tags: input.tags ?? [],
          author: input.author,
          language: input.language ?? "English",
          level: input.level,
          ageRange: input.ageRange,
          pages: input.pages,
          duration: input.duration,
          lessons: input.lessons,
          version: input.version,
          stars: input.stars,
          forks: input.forks,
          license: input.license,
          isFree: input.isFree ?? input.price === 0,
          isFeatured: input.isFeatured ?? false,
          createdAt: (input as any).createdAt ?? now,
          accent: input.accent ?? "#635BFF",
          isActive: (input as any).isActive ?? true,
        } as AdminProduct;
        set({ products: [prod, ...get().products] });
        return prod;
      },
      updateProduct: (id, patch) =>
        set({ products: get().products.map((p) => (p.id === id ? { ...p, ...patch } as AdminProduct : p)) }),
      deleteProduct: (id) => set({ products: get().products.filter((p) => p.id !== id) }),
      toggleActive: (id) =>
        set({ products: get().products.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)) }),
      getProduct: (id) => {
        if (!id) return undefined;
        return get().products.find((p) => p.id === id || p.slug === id);
      },
      reset: () => set({ products: seed() }),
    }),
    {
      name: "ds-products-v1",
      partialize: (s) => ({ products: s.products }),
    }
  )
);

// helpers for public pages: only active products
export const getActiveProducts = (products: AdminProduct[]) => products.filter((p) => p.isActive !== false);
