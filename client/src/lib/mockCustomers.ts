import type { Order } from "@/lib/mockOrders";

export type Customer = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  joinedAt: string;
  lastLoginAt: string;
  ordersCount: number;
  totalSpent: number;
  isActive: boolean;
  country: string;
};

const countries = ["United States", "United Kingdom", "Canada", "Germany", "France", "Australia", "India", "Brazil"];
const extraNames: [string, string][] = [
  ["Elena Rossi", "elena.rossi@example.com"],
  ["David Kim", "david.kim@example.com"],
  ["Fatima Al-Hassan", "fatima.alhassan@example.com"],
  ["Omar Farouk", "omar.farouk@example.com"],
  ["Sophie Laurent", "sophie.laurent@example.com"],
  ["Hiro Tanaka", "hiro.tanaka@example.com"],
  ["Isabella Garcia", "isabella.garcia@example.com"],
  ["Kwame Asante", "kwame.asante@example.com"],
  ["Olivia Brown", "olivia.brown@example.com"],
  ["Liam Smith", "liam.smith@example.com"],
];

export function generateMockCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();
  for (const o of orders) {
    const existing = map.get(o.customerEmail);
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += o.total;
      if (new Date(o.createdAt) > new Date(existing.lastLoginAt)) existing.lastLoginAt = new Date(new Date(o.createdAt).getTime() + 86400000).toISOString();
    } else {
      const avatarUrl = `https://picsum.photos/seed/${o.customerId}/80/80`;
      const joinedAt = new Date(new Date(o.createdAt).getTime() - Math.floor(Math.random() * 30) * 86400000).toISOString();
      map.set(o.customerEmail, {
        id: o.customerId,
        name: o.customerName,
        email: o.customerEmail,
        avatarUrl,
        joinedAt,
        lastLoginAt: new Date(new Date(o.createdAt).getTime() + 86400000).toISOString(),
        ordersCount: 1,
        totalSpent: o.total,
        isActive: Math.random() > 0.12,
        country: countries[Math.floor(Math.random() * countries.length)],
      });
    }
  }
  // add 10 extras
  for (const [name, email] of extraNames) {
    if (map.has(email)) continue;
    const id = `cu-${email.split("@")[0]}`;
    map.set(email, {
      id,
      name,
      email,
      avatarUrl: `https://picsum.photos/seed/${id}/80/80`,
      joinedAt: new Date(Date.now() - Math.floor(Math.random() * 200) * 86400000).toISOString(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString(),
      ordersCount: Math.floor(Math.random() * 3),
      totalSpent: Math.round(Math.random() * 400 * 100) / 100,
      isActive: Math.random() > 0.15,
      country: countries[Math.floor(Math.random() * countries.length)],
    });
  }
  return Array.from(map.values()).sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
}
