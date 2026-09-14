import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Eye, Ban, Mail } from "lucide-react";
import { toast } from "sonner";
import { useCustomersStore } from "@/store/customersStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatDate } from "@/lib/format";

export function Customers() {
  const customers = useCustomersStore((s) => s.customers);
  const toggleActive = useCustomersStore((s) => s.toggleActive);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 300);
  const [status, setStatus] = useState<"All" | "Active" | "Blocked">("All");
  const [sort, setSort] = useState<"newest" | "spent">("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = [...customers];
    if (debounced.trim()) {
      const qq = debounced.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(qq) || c.email.toLowerCase().includes(qq));
    }
    if (status !== "All") list = list.filter((c) => (status === "Active" ? c.isActive : !c.isActive));
    if (sort === "newest") list.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
    else list.sort((a, b) => b.totalSpent - a.totalSpent);
    return list;
  }, [customers, debounced, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [debounced, status, sort, pageSize]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const selectAll = (c: boolean) => {
    if (c) setSelected(new Set(paged.map((x) => x.id)));
    else setSelected(new Set());
  };
  const handleBulkBlock = () => {
    selected.forEach((id) => toggleActive(id));
    toast.success(`${selected.size} customers updated`);
    setSelected(new Set());
  };
  const handleExport = () => {
    const csv = ["id,name,email,orders,spent"].concat(filtered.map((c) => `${c.id},${c.name},${c.email},${c.ordersCount},${c.totalSpent}`)).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
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
          <h1 className="font-display text-2xl font-bold tracking-[-.04em] text-[#24234f] dark:text-white">Customers</h1>
          <p className="text-sm text-[#6f7184] dark:text-gray-400">{filtered.length} customers</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9baa]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="h-9 w-full rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-[#f7f6f2] dark:bg-white/5 pl-9 pr-3 text-sm outline-none" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-xs font-semibold">
            <option>All</option>
            <option>Active</option>
            <option>Blocked</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-xs font-semibold">
            <option value="newest">Newest</option>
            <option value="spent">Spent desc</option>
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-[#635BFF] text-white px-4 py-3">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkBlock} className="rounded-full bg-white text-[#635BFF] px-4 py-2 text-xs font-bold">Block selected</button>
            <button onClick={handleExport} className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold">Export CSV</button>
          </div>
        </div>
      )}

      <div className="hidden md:block overflow-auto rounded-2xl border border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e]">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f6f2] dark:bg-white/5 text-left text-xs">
            <tr>
              <th className="px-3 py-3"><input type="checkbox" checked={paged.length>0 && paged.every(c=>selected.has(c.id))} onChange={e=>selectAll(e.target.checked)} aria-label="Select all" /></th>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3 text-right">Orders</th>
              <th className="px-3 py-3 text-right">Total spent</th>
              <th className="px-3 py-3">Last login</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0efeb] dark:divide-gray-800">
            {paged.map((c) => (
              <tr key={c.id} className="hover:bg-[#f7f6f2]/50 dark:hover:bg-white/5">
                <td className="px-3 py-3"><input type="checkbox" checked={selected.has(c.id)} onChange={()=>toggleSelect(c.id)} aria-label={`Select ${c.name}`} /></td>
                <td className="px-3 py-3 flex items-center gap-2">
                  <img src={c.avatarUrl} alt="" width={32} height={32} loading="lazy" className="h-8 w-8 rounded-full object-cover" />
                  <span className="text-sm font-bold truncate max-w-[120px]">{c.name}</span>
                </td>
                <td className="px-3 py-3 text-xs truncate max-w-[180px]">{c.email}</td>
                <td className="px-3 py-3 text-right tabular-nums">{c.ordersCount}</td>
                <td className="px-3 py-3 text-right tabular-nums font-bold">{formatCurrency(c.totalSpent)}</td>
                <td className="px-3 py-3 text-xs tabular-nums">{formatDate(c.lastLoginAt)}</td>
                <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${c.isActive ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300"}`}>{c.isActive ? "Active" : "Blocked"}</span></td>
                <td className="px-3 py-3 flex gap-1">
                  <Link href={`/admin/customers/${c.id}`} aria-label={`View ${c.name}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10"><Eye size={14} /></Link>
                  <button aria-label={`Block ${c.name}`} onClick={()=>{toggleActive(c.id); toast.success(c.isActive? "Blocked":"Unblocked")}} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10"><Ban size={14} /></button>
                  <button aria-label={`Email ${c.name}`} onClick={()=>toast.success("Email sent (fake)")} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10"><Mail size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {paged.map((c) => (
          <div key={c.id} className="rounded-2xl border border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e] p-3 flex gap-3">
            <input type="checkbox" checked={selected.has(c.id)} onChange={()=>toggleSelect(c.id)} aria-label={`Select ${c.name}`} className="mt-2" />
            <img src={c.avatarUrl} alt="" width={48} height={48} loading="lazy" className="h-12 w-12 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{c.name}</p>
              <p className="text-xs truncate text-[#6f7184] dark:text-gray-400">{c.email}</p>
              <p className="text-xs">{c.ordersCount} orders · {formatCurrency(c.totalSpent)}</p>
              <div className="mt-2 flex gap-1">
                <Link href={`/admin/customers/${c.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/5"><Eye size={14} /></Link>
                <button onClick={()=>{toggleActive(c.id); toast.success(c.isActive? "Blocked":"Unblocked")}} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/5"><Ban size={14} /></button>
                <button onClick={()=>toast.success("Email sent (fake)")} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/5"><Mail size={14} /></button>
              </div>
            </div>
            <span className={`h-fit rounded-full px-2 py-1 text-[10px] font-bold ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{c.isActive ? "Active" : "Blocked"}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} className="h-8 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-2">
            <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
          </select>
          <span className="text-[#6f7184] dark:text-gray-400">Page {page} of {totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="h-8 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-4 text-xs font-bold disabled:opacity-40">Prev</button>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="h-8 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-4 text-xs font-bold disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
