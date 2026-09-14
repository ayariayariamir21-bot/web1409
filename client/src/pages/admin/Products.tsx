import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Plus, Pencil, Trash2, Eye, Power } from "lucide-react";
import { toast } from "sonner";
import { useProductsStore, type AdminProduct } from "@/store/productsStore";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyIllustration } from "@/components/EmptyIllustration";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/data";

type SortOpt = "newest" | "price-asc" | "price-desc" | "rating";

export function Products() {
  const products = useProductsStore((s) => s.products);
  const deleteProduct = useProductsStore((s) => s.deleteProduct);
  const toggleActive = useProductsStore((s) => s.toggleActive);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 300);
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [sort, setSort] = useState<SortOpt>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const categories = ["All", "Software", "Websites", "Open Source", "Online Books", "Kids Room", "Student Courses"];
  const types = ["All", "software", "website", "open-source", "book", "course", "kids"];

  const filtered = useMemo(() => {
    let list: AdminProduct[] = [...products];
    if (debounced.trim()) {
      const qq = debounced.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(qq));
    }
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (type !== "All") list = list.filter((p) => p.type === type);
    if (status !== "All") list = list.filter((p) => (status === "Active" ? p.isActive : !p.isActive));
    if (sort === "newest") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, debounced, category, type, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [debounced, category, type, status, sort, pageSize]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const selectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(paged.map((p) => p.id)));
    else setSelected(new Set());
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    toast.success("Product deleted");
    setConfirmId(null);
  };
  const handleBulkDelete = () => {
    selected.forEach((id) => deleteProduct(id));
    toast.success(`${selected.size} products deleted`);
    setSelected(new Set());
    setBulkConfirm(false);
  };
  const handleToggle = (id: string) => {
    toggleActive(id);
    const p = products.find((x) => x.id === id);
    toast.success(p?.isActive ? "Deactivated" : "Activated", { description: p?.title });
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
          <h1 className="font-display text-2xl font-bold tracking-[-.04em] text-[#24234f] dark:text-white">Products</h1>
          <p className="text-sm text-[#6f7184] dark:text-gray-400">{filtered.length} products</p>
        </div>
        <Link href="/admin/products/new" className="ds-button ds-button-primary h-10 px-5 text-sm">
          <Plus size={16} /> New product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9baa]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title" aria-label="Search products" className="h-9 w-full rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-[#f7f6f2] dark:bg-white/5 pl-9 pr-3 text-sm outline-none" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-xs font-semibold">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-xs font-semibold">
            {types.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-xs font-semibold">
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortOpt)} className="h-9 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-xs font-semibold">
            <option value="newest">Newest</option>
            <option value="price-asc">Price asc</option>
            <option value="price-desc">Price desc</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-[#635BFF] text-white px-4 py-3">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <button onClick={() => setBulkConfirm(true)} className="flex items-center gap-1 rounded-full bg-white text-[#635BFF] px-4 py-2 text-xs font-bold">
            <Trash2 size={14} /> Delete selected
          </button>
        </div>
      )}

      {/* Table desktop */}
      <div className="hidden md:block overflow-auto rounded-2xl border border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e]">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f6f2] dark:bg-white/5 text-left text-xs">
            <tr>
              <th className="px-3 py-3">
                <input type="checkbox" checked={paged.length > 0 && paged.every((p) => selected.has(p.id))} onChange={(e) => selectAll(e.target.checked)} aria-label="Select all" />
              </th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-right">Rating</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0efeb] dark:divide-gray-800">
            {paged.map((p) => (
              <tr key={p.id} className="hover:bg-[#f7f6f2]/50 dark:hover:bg-white/5">
                <td className="px-3 py-3">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} aria-label={`Select ${p.title}`} />
                </td>
                <td className="px-3 py-3 flex items-center gap-3 min-w-[220px]">
                  <img src={p.thumbnail} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#24234f] dark:text-white">{p.title}</p>
                    <p className="truncate text-xs text-[#9b9baa]">{p.slug}</p>
                  </div>
                </td>
                <td className="px-3 py-3 text-xs">{p.category}</td>
                <td className="px-3 py-3 text-xs">{p.type}</td>
                <td className="px-3 py-3 text-right tabular-nums font-bold">{formatPrice(p.price)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{p.rating.toFixed(1)}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${p.isActive ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"}`}>{p.isActive ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.title}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10 text-[#6f7184]">
                      <Pencil size={14} />
                    </Link>
                    <button aria-label={`Toggle ${p.title}`} onClick={() => handleToggle(p.id)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10 text-[#6f7184]">
                      <Power size={14} />
                    </button>
                    <button aria-label={`Delete ${p.title}`} onClick={() => setConfirmId(p.id)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600">
                      <Trash2 size={14} />
                    </button>
                    <Link href={`/product/${p.id}`} aria-label={`View ${p.title}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10 text-[#6f7184]">
                      <Eye size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="grid gap-3 md:hidden">
        {paged.map((p) => (
          <div key={p.id} className="rounded-2xl border border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e] p-3 flex gap-3">
            <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} aria-label={`Select ${p.title}`} className="mt-2" />
            <img src={p.thumbnail} alt="" width={64} height={64} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-[#24234f] dark:text-white">{p.title}</p>
              <p className="text-xs text-[#6f7184] dark:text-gray-400">{p.category} · {p.type} · {formatPrice(p.price)}</p>
              <div className="mt-2 flex gap-1">
                <Link href={`/admin/products/${p.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/5"><Pencil size={14} /></Link>
                <button onClick={() => handleToggle(p.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/5"><Power size={14} /></button>
                <button onClick={() => setConfirmId(p.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <span className={`h-fit rounded-full px-2 py-1 text-[10px] font-bold ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{p.isActive ? "Active" : "Inactive"}</span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-12 text-center">
          <EmptyIllustration type="search" />
          <p className="mt-4 font-display text-lg font-bold text-[#24234f] dark:text-white">No products match your filters</p>
          <p className="text-sm text-[#6f7184] dark:text-gray-400">Try adjusting search or filters.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6f7184] dark:text-gray-400">Rows per page</span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-8 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-2">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-[#6f7184] dark:text-gray-400">
            Page {page} of {totalPages} · {filtered.length} items
          </span>
        </div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-8 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-4 text-xs font-bold disabled:opacity-40">
            Prev
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="h-8 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-4 text-xs font-bold disabled:opacity-40">
            Next
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete product?"
        description="This cannot be undone. The product will be removed from the store."
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onClose={() => setConfirmId(null)}
      />
      <ConfirmDialog
        open={bulkConfirm}
        title={`Delete ${selected.size} products?`}
        description="This cannot be undone."
        onConfirm={handleBulkDelete}
        onClose={() => setBulkConfirm(false)}
      />
    </div>
  );
}
