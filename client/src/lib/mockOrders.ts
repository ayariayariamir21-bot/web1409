import type { AdminProduct } from "@/store/productsStore";

export type OrderItem = { productId: string; title: string; price: number; qty: number; thumbnail?: string };
export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "card" | "paypal" | "apple-pay";

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  promoCode?: string;
  note?: string;
  timeline: { status: OrderStatus; at: string; note?: string }[];
};

const names = [
  ["Alex Rivera", "alex.rivera@example.com"],
  ["Priya Nair", "priya.nair@example.com"],
  ["Samir Patel", "samir.patel@example.com"],
  ["Jordan Lee", "jordan.lee@example.com"],
  ["Maya Chen", "maya.chen@example.com"],
  ["Casey Wu", "casey.wu@example.com"],
  ["Rosa Delgado", "rosa.delgado@example.com"],
  ["Ibrahim Ali", "ibrahim.ali@example.com"],
  ["Tara Bell", "tara.bell@example.com"],
  ["Lucas Martin", "lucas.martin@example.com"],
  ["Nora Okafor", "nora.okafor@example.com"],
  ["Ben Ortiz", "ben.ortiz@example.com"],
  ["Sofia Lind", "sofia.lind@example.com"],
  ["Eli Morgan", "eli.morgan@example.com"],
  ["Aisha Khan", "aisha.khan@example.com"],
  ["Ravi Singh", "ravi.singh@example.com"],
  ["Mira Patel", "mira.patel@example.com"],
  ["Calvin Wu", "calvin.wu@example.com"],
  ["Maya Brooks", "maya.brooks@example.com"],
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function generateMockOrders(products: AdminProduct[], count = 44): Order[] {
  const statuses: OrderStatus[] = ["paid", "pending", "paid", "paid", "failed", "refunded", "pending", "paid"];
  const payments: PaymentMethod[] = ["card", "card", "card", "paypal", "apple-pay"];
  const orders: Order[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const idNum = String(100 + i).padStart(4, "0");
    const id = `DS-2025-${idNum}`;
    const [customerName, customerEmail] = rand(names);
    const customerId = `cu-${customerEmail.split("@")[0]}`;
    const itemCount = 1 + Math.floor(Math.random() * 3);
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    const items: OrderItem[] = shuffled.slice(0, itemCount).map((p) => ({
      productId: p.id,
      title: p.title,
      price: p.price,
      qty: 1 + Math.floor(Math.random() * 2),
      thumbnail: p.thumbnail,
    }));
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const hasPromo = Math.random() < 0.18;
    const promoCode = hasPromo ? rand(["DIGITAL10", "KIDS20"]) : undefined;
    let discount = 0;
    if (promoCode === "DIGITAL10") discount = Math.round(subtotal * 0.1 * 100) / 100;
    if (promoCode === "KIDS20") discount = Math.round(subtotal * 0.15 * 100) / 100;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * 0.08 * 100) / 100;
    const total = Math.round((taxable + tax) * 100) / 100;
    const status = rand(statuses);
    const paymentMethod = rand(payments);
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date(now - daysAgo * 86400000 - Math.floor(Math.random() * 86400000)).toISOString();
    orders.push({
      id,
      customerId,
      customerName,
      customerEmail,
      items,
      subtotal,
      discount,
      tax,
      total,
      status,
      paymentMethod,
      createdAt,
      promoCode,
      timeline: [
        { status: "pending" as OrderStatus, at: createdAt },
        ...(status !== "pending" ? [{ status, at: new Date(new Date(createdAt).getTime() + 3600000).toISOString() } as any] : []),
      ],
    });
  }
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return orders;
}
