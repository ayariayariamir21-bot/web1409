import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateMockReviews, type Review } from "@/lib/mockReviews";
import { useProductsStore } from "@/store/productsStore";
export type { Review };

type ReviewsState = {
  reviews: Review[];
  approve: (id: string) => void;
  reject: (id: string) => void;
  delete: (id: string) => void;
  reply: (id: string, text: string) => void;
};

function seed(): Review[] {
  try {
    const products = useProductsStore.getState().products as any;
    if (products.length) return generateMockReviews(products, 64);
  } catch {}
  return generateMockReviews([] as any, 64);
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: seed(),
      approve: (id) => set({ reviews: get().reviews.map((r) => (r.id === id ? { ...r, status: "approved" } : r)) }),
      reject: (id) => set({ reviews: get().reviews.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)) }),
      delete: (id) => set({ reviews: get().reviews.filter((r) => r.id !== id) }),
      reply: (id, text) => set({ reviews: get().reviews.map((r) => (r.id === id ? { ...r, reply: { text, createdAt: new Date().toISOString() } } : r)) }),
    }),
    { name: "ds-reviews-v1", partialize: (s) => ({ reviews: s.reviews }) }
  )
);
