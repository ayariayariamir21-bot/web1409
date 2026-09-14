import { Link } from "wouter";
import { ArrowLeft, Ban, Mail } from "lucide-react";
import { toast } from "sonner";
import { useCustomersStore } from "@/store/customersStore";
import { useOrdersStore } from "@/store/ordersStore";
import { formatCurrency, formatDate } from "@/lib/format";

export function CustomerDetail({ id }: { id: string }) {
  const customer = useCustomersStore((s) => s.customers.find((c) => c.id === id));
  const toggleActive = useCustomersStore((s) => s.toggleActive);
  const orders = useOrdersStore((s) => s.orders.filter((o) => o.customerId === id));

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm">Customer not found</p>
        <Link href="/admin/customers" className="text-sm font-bold text-[#635BFF]">Back</Link>
      </div>
    );
  }

  const avg = customer.ordersCount ? customer.totalSpent / customer.ordersCount : 0;

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-1 text-xs font-semibold text-[#6f7184] dark:text-gray-400">
        <ArrowLeft size={13} /> Back to customers
      </Link>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-6 text-center">
            <img src={customer.avatarUrl} alt="" width={80} height={80} loading="lazy" className="mx-auto h-20 w-20 rounded-full object-cover" />
            <h1 className="mt-3 font-display text-xl font-bold text-[#24234f] dark:text-white">{customer.name}</h1>
            <p className="text-sm text-[#6f7184] dark:text-gray-400">{customer.email}</p>
            <p className="text-xs text-[#9b9baa]">{customer.country} · Joined {formatDate(customer.joinedAt)}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${customer.isActive ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300"}`}>{customer.isActive ? "Active" : "Blocked"}</span>
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => { toggleActive(customer.id); toast.success(customer.isActive ? "Blocked" : "Unblocked"); }} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-4 text-xs font-bold flex items-center gap-1">
                <Ban size={14} /> {customer.isActive ? "Block" : "Unblock"}
              </button>
              <button onClick={() => toast.success("Email sent (fake)")} className="h-9 rounded-full bg-[#635BFF] text-white px-4 text-xs font-bold flex items-center gap-1">
                <Mail size={14} /> Send email
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-5 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-[#9b9baa]">Total orders</p>
              <p className="font-display text-lg font-bold">{customer.ordersCount}</p>
            </div>
            <div>
              <p className="text-xs text-[#9b9baa]">Total spent</p>
              <p className="font-display text-lg font-bold tabular-nums">{formatCurrency(customer.totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-[#9b9baa]">Avg order</p>
              <p className="font-display text-lg font-bold tabular-nums">{formatCurrency(avg)}</p>
            </div>
            <div>
              <p className="text-xs text-[#9b9baa]">Last login</p>
              <p className="text-xs font-bold">{formatDate(customer.lastLoginAt)}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e7e6e1] dark:border-gray-800">
              <h3 className="text-sm font-bold">Order history</h3>
            </div>
            <div className="divide-y divide-[#f0efeb] dark:divide-gray-800">
              {orders.length ? orders.map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-[#f7f6f2] dark:hover:bg-white/5">
                  <div>
                    <p className="font-mono text-xs font-bold">{o.id}</p>
                    <p className="text-xs text-[#6f7184] dark:text-gray-400">{formatDate(o.createdAt)} · {o.status}</p>
                  </div>
                  <p className="text-sm font-bold tabular-nums">{formatCurrency(o.total)}</p>
                </Link>
              )) : <p className="p-4 text-sm text-[#6f7184]">No orders yet.</p>}
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-4">
            <h3 className="text-sm font-bold">Owned products (mock)</h3>
            <p className="text-xs text-[#6f7184] dark:text-gray-400">Derived from purchases — static demo list.</p>
            <div className="mt-3 space-y-2">
              {["Regex Visual Debugger", "Stellar SaaS — Landing Kit"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm">
                  <span className="h-8 w-8 rounded-lg bg-[#ecebff] dark:bg-white/10" />
                  <span className="font-semibold">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
