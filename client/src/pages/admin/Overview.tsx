import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import { formatCurrency } from "@/lib/format";

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  revenue: 1200 + Math.round(Math.sin(i / 4) * 400 + Math.random() * 600),
}));

const ordersByCategory = [
  { name: "Software", orders: 42 },
  { name: "Websites", orders: 18 },
  { name: "Books", orders: 36 },
  { name: "Courses", orders: 28 },
  { name: "Kids", orders: 22 },
  { name: "Open Source", orders: 9 },
];

const recentOrders = [
  { id: "DS-2025-4821", customer: "Alex Rivera", total: 89, status: "paid" as const, date: "2025-06-10" },
  { id: "DS-2025-7392", customer: "Priya Nair", total: 39, status: "pending" as const, date: "2025-06-09" },
  { id: "DS-2025-1023", customer: "Samir Patel", total: 149, status: "paid" as const, date: "2025-06-08" },
  { id: "DS-2025-5581", customer: "Jordan Lee", total: 29, status: "failed" as const, date: "2025-06-07" },
  { id: "DS-2025-2204", customer: "Maya Chen", total: 59, status: "refunded" as const, date: "2025-06-06" },
];

const topProducts = [
  { title: "Regex Visual Debugger", sales: 842, revenue: 32838, thumb: "https://picsum.photos/seed/sw-01/80/80" },
  { title: "Stellar SaaS — Landing Kit", sales: 642, revenue: 57138, thumb: "https://picsum.photos/seed/web-01/80/80" },
  { title: "Pragmatic TypeScript", sales: 920, revenue: 31280, thumb: "https://picsum.photos/seed/bk-03/80/80" },
  { title: "Python for Beginners", sales: 2100, revenue: 207900, thumb: "https://picsum.photos/seed/co-02/80/80" },
  { title: "Luna and the Sleepy Moon", sales: 640, revenue: 6393, thumb: "https://picsum.photos/seed/kd-01/80/80" },
];

function StatusChip({ status }: { status: "paid" | "pending" | "failed" | "refunded" }) {
  const map = {
    paid: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
    pending: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
    failed: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300",
    refunded: "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300",
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${map[status]}`}>{status}</span>;
}

export function Overview() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-.04em] text-[#24234f] dark:text-white">Overview</h1>
        <p className="text-sm text-[#6f7184] dark:text-gray-400">Snapshot of your store this month.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value="$48,920" delta="+12.4%" positive spark={[40, 55, 62, 48, 70, 66, 80, 72, 85, 90, 78, 88]} />
        <StatCard label="Orders" value="1,284" delta="+8.1%" positive spark={[30, 45, 38, 52, 60, 55, 70, 68, 75, 80, 72, 77]} />
        <StatCard label="Customers" value="892" delta="+5.3%" positive spark={[20, 30, 28, 35, 40, 38, 45, 48, 50, 55, 52, 58]} />
        <StatCard label="Avg Order Value" value="$38.10" delta="-2.1%" positive={false} spark={[60, 58, 55, 52, 50, 48, 45, 42, 40, 38, 35, 32]} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-4">
          <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Revenue over 30 days</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e6e1" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9b9baa" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9b9baa" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#635BFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-4">
          <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Orders by category</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e6e1" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9b9baa" interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} stroke="#9b9baa" />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#635BFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e7e6e1] dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Recent orders</h3>
          </div>
          <div className="divide-y divide-[#f0efeb] dark:divide-gray-800">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-mono text-xs font-bold text-[#24234f] dark:text-white">{o.id}</p>
                  <p className="text-xs text-[#6f7184] dark:text-gray-400">{o.customer} · {o.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-[#24234f] dark:text-white">{formatCurrency(o.total)}</p>
                  <StatusChip status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e7e6e1] dark:border-gray-800">
            <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Top products</h3>
          </div>
          <div className="divide-y divide-[#f0efeb] dark:divide-gray-800">
            {topProducts.map((p) => (
              <div key={p.title} className="flex items-center gap-3 px-4 py-3">
                <img src={p.thumb} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-[#24234f] dark:text-white">{p.title}</p>
                  <p className="text-xs text-[#6f7184] dark:text-gray-400">{p.sales} sales</p>
                </div>
                <p className="text-sm font-bold tabular-nums text-[#24234f] dark:text-white">{formatCurrency(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
