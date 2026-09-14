import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Eye, RotateCcw, Send, Download } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "@/store/ordersStore";
import type { Order } from "@/lib/mockOrders";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatDate } from "@/lib/format";

function StatusChip({ status }: { status: Order["status"] }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
    paid: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
    failed: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300",
    refunded: "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300",
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${map[status]}`}>{status}</span>;
}

export function Orders() {
  const orders = useOrdersStore((s) => s.orders);
  const refund = useOrdersStore((s) => s.refund);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 300);
  const [status, setStatus] = useState<"All" | Order["status"]>("All");
  const [range, setRange] = useState<"All" | "7" | "30" | "90">("All");
  const [sort, setSort] = useState<"newest" | "highest">("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmRefund, setConfirmRefund] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (debounced.trim()) {
      const qq = debounced.toLowerCase();
      list = list.filter((o) => o.id.toLowerCase().includes(qq) || o.customerName.toLowerCase().includes(qq) || o.customerEmail.toLowerCase().includes(qq));
    }
    if (status !== "All") list = list.filter((o) => o.status === status);
    if (range !== "All") {
      const days = Number(range);
      const cutoff = Date.now() - days * 86400000;
      list = list.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
    }
    if (sort === "newest") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else list.sort((a, b) => b.total - a.total);
    return list;
  }, [orders, debounced, status, range, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [debounced, status, range, sort, pageSize]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const selectAll = (c: boolean) => {
    if (c) setSelected(new Set(paged.map((o) => o.id)));
    else setSelected(new Set());
  };

  const handleRefund = (id: string) => {
    refund(id);
    toast.success("Order refunded");
    setConfirmRefund(null);
  };
  const handleBulkRefund = () => {
    selected.forEach((id) => refund(id));
    toast.success(`${selected.size} orders refunded`);
    setSelected(new Set());
  };
  const handleExport = () => {
    const csv = ["id,customer,total,status,date"].concat(filtered.map((o) => `${o.id},${o.customerName},${o.total},${o.status},${o.createdAt}`)).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported (fake)");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-.04em] text-[#24234f] dark:text-white">Orders</h1>
          <p className="text-sm text-[#6f7184] dark:text-gray-400">{filtered.length} orders</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9baa]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order ID, customer, email" className="h-9 w-full rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-[#f7f6f2] dark:bg-white/5 pl-9 pr-3 text-sm outline-none" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-xs font-semibold">
            <option>All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select value={range} onChange={(e) => setRange(e.target.value as any)} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-xs font-semibold">
            <option value="All">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-xs font-semibold">
            <option value="newest">Newest</option>
            <option value="highest">Highest total</option>
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-[#635BFF] text-white px-4 py-3">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkRefund} className="rounded-full bg-white text-[#635BFF] px-4 py-2 text-xs font-bold">Mark as refunded</button>
            <button onClick={handleExport} className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold flex items-center gap-1"><Download size={12} /> Export CSV</button>
          </div>
        </div>
      )}

      <div className="hidden md:block overflow-auto rounded-2xl border border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e]">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f6f2] dark:bg-white/5 text-left text-xs">
            <tr>
              <th className="px-3 py-3"><input type="checkbox" checked={paged.length>0 && paged.every(o=>selected.has(o.id))} onChange={e=>selectAll(e.target.checked)} aria-label="Select all" /></th>
              <th className="px-3 py-3">Order ID</th>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Items</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Payment</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0efeb] dark:divide-gray-800">
            {paged.map((o) => (
              <tr key={o.id} className="hover:bg-[#f7f6f2]/50 dark:hover:bg-white/5">
                <td className="px-3 py-3"><input type="checkbox" checked={selected.has(o.id)} onChange={()=>toggleSelect(o.id)} aria-label={`Select ${o.id}`} /></td>
                <td className="px-3 py-3 font-mono text-xs font-bold tabular-nums">{o.id}</td>
                <td className="px-3 py-3"><p className="text-sm font-bold truncate max-w-[140px]">{o.customerName}</p><p className="text-xs text-[#6f7184] dark:text-gray-400 truncate max-w-[140px]">{o.customerEmail}</p></td>
                <td className="px-3 py-3 text-xs">{o.items.length} items</td>
                <td className="px-3 py-3 text-right tabular-nums font-bold">{formatCurrency(o.total)}</td>
                <td className="px-3 py-3"><StatusChip status={o.status} /></td>
                <td className="px-3 py-3 text-xs">{o.paymentMethod}</td>
                <td className="px-3 py-3 text-xs tabular-nums">{formatDate(o.createdAt)}</td>
                <td className="px-3 py-3 flex gap-1">
                  <Link href={`/admin/orders/${o.id}`} aria-label={`View ${o.id}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10"><Eye size={14} /></Link>
                  {o.status === "paid" && <button aria-label={`Refund ${o.id}`} onClick={()=>setConfirmRefund(o.id)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600"><RotateCcw size={14} /></button>}
                  <button aria-label={`Resend ${o.id}`} onClick={()=>toast.success("Download link resent")} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10"><Send size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {paged.map((o) => (
          <div key={o.id} className="rounded-2xl border border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e] p-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs font-bold">{o.id}</p>
              <StatusChip status={o.status} />
            </div>
            <p className="mt-1 text-sm font-bold">{o.customerName}</p>
            <p className="text-xs text-[#6f7184] dark:text-gray-400">{o.customerEmail} · {o.items.length} items · {formatCurrency(o.total)}</p>
            <div className="mt-2 flex gap-1">
              <Link href={`/admin/orders/${o.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/5"><Eye size={14} /></Link>
              {o.status === "paid" && <button onClick={()=>setConfirmRefund(o.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30"><RotateCcw size={14} /></button>}
              <button onClick={()=>toast.success("Download link resent")} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/5"><Send size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length===0 && (
        <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-12 text-center">
          <p className="text-sm font-bold text-[#24234f] dark:text-white">No orders match your filters</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} className="h-8 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-2">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-[#6f7184] dark:text-gray-400">Page {page} of {totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="h-8 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-4 text-xs font-bold disabled:opacity-40">Prev</button>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="h-8 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-4 text-xs font-bold disabled:opacity-40">Next</button>
        </div>
      </div>

      <ConfirmDialog open={!!confirmRefund} title="Refund order?" description="This will mark the order as refunded." confirmText="Refund" onConfirm={()=>confirmRefund && handleRefund(confirmRefund)} onClose={()=>setConfirmRefund(null)} />
    </div>
  );
}
