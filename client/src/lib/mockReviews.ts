import type { AdminProduct } from "@/store/productsStore";

export type ReviewStatus = "pending" | "approved" | "rejected";
export type Review = {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  status: ReviewStatus;
  reply?: { text: string; createdAt: string };
};

const bodies = [
  "Helped me ship faster. Clear docs, no fluff. Would buy again.",
  "Good product but onboarding could be smoother. Support was quick though.",
  "Exactly what I needed for my portfolio. Clean code, easy to customize.",
  "Loved the writing style. Short chapters I could finish on lunch breaks.",
  "My kids ask to play this every evening. Calm and fun at the same time.",
  "Python course finally made loops click. Projects are small but real.",
  "Design system book saved our team weeks. Tokens chapter is gold.",
  "Not worth the price for me. Features feel unfinished.",
];

export function generateMockReviews(products: AdminProduct[], count = 64): Review[] {
  const names = ["Alex Rivera", "Priya Nair", "Samir Patel", "Jordan Lee", "Maya Chen", "Casey Wu", "Rosa Delgado", "Ibrahim Ali", "Tara Bell", "Lucas Martin", "Nora Okafor", "Ben Ortiz"];
  const statuses: ReviewStatus[] = ["approved", "approved", "approved", "pending", "pending", "rejected"];
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    const p = products[i % products.length];
    const id = `rv-${String(i + 1).padStart(3, "0")}`;
    const rating = 1 + Math.floor(Math.random() * 5);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString();
    reviews.push({
      id,
      productId: p.id,
      customerName: names[Math.floor(Math.random() * names.length)],
      rating,
      title: `Review for ${p.title.slice(0, 24)}`,
      body: bodies[Math.floor(Math.random() * bodies.length)],
      createdAt,
      status,
      reply: Math.random() < 0.12 ? { text: "Thanks for your feedback! We appreciate it.", createdAt: new Date().toISOString() } : undefined,
    });
  }
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
