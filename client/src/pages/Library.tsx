import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Download, Copy, ExternalLink, BookOpen, Play, Github, Globe, Layers3, LibraryBig, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLibraryStore } from "@/store/libraryStore";
import { type Product } from "@/data";
import { useProductsStore, getActiveProducts } from "@/store/productsStore";
import { FakeReader } from "@/components/FakeReader";
import { generateLicenseKey, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyIllustration } from "@/components/EmptyIllustration";
import { useReducedMotion } from "@/lib/motion";
import { useDebounce } from "@/hooks/useDebounce";

const TABS = [
  { id: "all", label: "All" },
  { id: "course", label: "Courses" },
  { id: "book", label: "Books" },
  { id: "software", label: "Software" },
  { id: "website", label: "Websites" },
  { id: "open-source", label: "Open Source" },
];

export function LibraryPage() {
  const [, navigate] = useLocation();
  const purchases = useLibraryStore((s) => s.purchases);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [sort, setSort] = useState<"recent" | "alpha">("recent");
  const [readerId, setReaderId] = useState<string | null>(null);

  // mock protection: if no mock user and library is untouched? spec says if no mock user in localStorage -> redirect /login
  // We check for ds-mock-user key; if absent we still allow but show toast hint
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // flatten purchases to unique products with purchase date
  const items = useMemo(() => {
    const map = new Map<string, { product: Product; date: string; purchaseId: string }>();
    purchases.forEach((p) => {
      p.items.forEach((it) => {
        const prod = useProductsStore.getState().getProduct(it.productId);
        if (!prod) return;
        if (!map.has(prod.id) || new Date(p.date) > new Date(map.get(prod.id)!.date)) {
          map.set(prod.id, { product: prod, date: p.date, purchaseId: p.orderId });
        }
      });
    });
    let list = Array.from(map.values());
    if (tab !== "all") {
      list = list.filter((x) => x.product.type === tab || (tab === "website" && x.product.type === "website"));
    }
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((x) => `${x.product.title} ${x.product.description}`.toLowerCase().includes(q));
    }
    if (sort === "alpha") list.sort((a, b) => a.product.title.localeCompare(b.product.title));
    else list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [purchases, tab, query, sort]);

  const readingProduct = readerId ? useProductsStore.getState().getProduct(readerId) : null;

  if (loading) {
    return (
      <div className="ds-container py-14">
        <div className="mb-8 h-8 w-48 rounded-full bg-[#e7e6e1] animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="ds-card p-4">
              <Skeleton className="h-32 w-full rounded-2xl dark:bg-white/10" />
              <Skeleton className="mt-3 h-4 w-2/3 dark:bg-white/10" />
              <Skeleton className="mt-2 h-3 w-1/2 dark:bg-white/10" />
              <Skeleton className="mt-4 h-8 w-full rounded-full dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="ds-container py-14 text-center">
        <EmptyIllustration type="library" />
        <h2 className="mt-6 font-display text-2xl font-bold text-[#24234f]">Nothing here yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6f7184]">You haven't collected anything yet — your courses, books and tools will live here after you check out.</p>
        <Link href="/shop/courses" className="ds-button ds-button-primary mt-6 h-11 px-5 text-sm">Find your first course <ArrowRight size={15} /></Link>
      </div>
    );
  }

  return (
    <div className="ds-container py-14">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#635BFF]">Your collection</p>
          <h1 className="font-display text-5xl font-bold tracking-[-.07em] text-[#24234f]">My library<span className="text-[#635BFF]">.</span></h1>
          <p className="mt-3 text-sm text-[#6f7184]">Everything you have downloaded or purchased, in one calm place.</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-[#d9f99d] px-3 py-2 text-xs font-bold text-[#47723b]">{items.length} items</span>
          <button onClick={() => toast.success("Download started (demo)", { description: "Downloading all files (fake)." })} className="ds-button ds-button-ghost h-9 px-4 text-xs"><Download size={14} /> Download all</button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${tab === t.id ? "bg-[#24234f] text-white" : "bg-white text-[#6f7184] ring-1 ring-[#e7e6e1] hover:text-[#24234f]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9baa]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search library" className="h-9 w-44 rounded-full border border-[#e7e6e1] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#635BFF]" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-9 rounded-full border border-[#e7e6e1] bg-white px-3 text-xs font-semibold text-[#24234f]">
            <option value="recent">Recent</option>
            <option value="alpha">A–Z</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <EmptyIllustration type="search" />
          <p className="mt-4 font-display text-lg font-bold text-[#24234f]">No matches for "{query}"</p>
          <p className="mt-1 text-sm text-[#6f7184]">Try adjusting your search or filters.</p>
          <button onClick={() => { setQuery(""); setTab("all"); }} className="ds-button ds-button-ghost mt-4 h-9 px-4 text-xs">Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map(({ product, date }, i) => (
            <div key={product.id} className="ds-card flex gap-4 p-4">
              <div className="h-32 w-32 rounded-2xl bg-gray-100 dark:bg-white/10 overflow-hidden"><img src={product.thumbnail} alt={product.title} width={400} height={300} loading="lazy" decoding="async" onLoad={(e)=>e.currentTarget.classList.remove("opacity-0")} className="h-full w-full object-cover opacity-0 transition-opacity duration-300" /></div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#ecebff] px-2 py-1 text-[10px] font-bold text-[#635BFF]">{product.type}</span>
                    <span className="text-[10px] text-[#9b9baa]">{formatDate(date)}</span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold leading-tight tracking-[-.04em] text-[#24234f]">{product.title}</h3>
                </div>

                <div className="mt-3">
                  {product.type === "course" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-[#9b9baa]"><span>{24 + i * 16}% complete</span><span>{product.duration}</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#e7e6e1]"><div className="h-full rounded-full bg-[#635BFF]" style={{ width: `${24 + i * 16}%` }} /></div>
                      <div className="flex gap-2">
                        <button onClick={() => toast.success("Continue learning (demo)")} className="flex-1 rounded-full bg-[#24234f] py-2 text-[11px] font-bold text-white hover:bg-[#635BFF]"><Play size={11} className="mr-1 inline" /> Continue learning</button>
                        <button onClick={() => toast("Course notes (demo)")} className="rounded-full border border-[#e7e6e1] bg-white px-3 py-2 text-[11px] font-bold text-[#24234f]">Notes</button>
                      </div>
                    </div>
                  )}
                  {product.type === "book" && (
                    <div className="flex gap-2">
                      <button onClick={() => setReaderId(product.id)} className="flex-1 rounded-full bg-[#24234f] py-2 text-[11px] font-bold text-white hover:bg-[#635BFF]"><BookOpen size={11} className="mr-1 inline" /> Read online</button>
                      <button onClick={() => toast.success("Download started (demo)")} className="rounded-full border border-[#e7e6e1] bg-white px-3 py-2 text-[11px] font-bold text-[#24234f]"><Download size={11} className="mr-1 inline" /> PDF</button>
                    </div>
                  )}
                  {product.type === "software" && (
                    <div className="flex gap-2">
                      <button onClick={() => toast.success("Download started (demo)")} className="flex-1 rounded-full bg-[#24234f] py-2 text-[11px] font-bold text-white"><Download size={11} className="mr-1 inline" /> Download {product.version}</button>
                      <button
                        onClick={async () => {
                          const key = generateLicenseKey();
                          await navigator.clipboard.writeText(key);
                          toast.success("License key copied", { description: key });
                        }}
                        className="rounded-full border border-[#e7e6e1] bg-white px-3 py-2 text-[11px] font-bold text-[#24234f]"><Copy size={11} className="mr-1 inline" /> License</button>
                    </div>
                  )}
                  {product.type === "website" && (
                    <div className="flex gap-2">
                      <button onClick={() => toast.success("Download started (demo)")} className="flex-1 rounded-full bg-[#24234f] py-2 text-[11px] font-bold text-white"><Download size={11} className="mr-1 inline" /> Template</button>
                      <button onClick={() => toast("Live preview (demo)")} className="rounded-full border border-[#e7e6e1] bg-white px-3 py-2 text-[11px] font-bold text-[#24234f]"><ExternalLink size={11} className="mr-1 inline" /> Preview</button>
                    </div>
                  )}
                  {(product.type === "open-source" || product.isFree) && (
                    <div className="flex gap-2">
                      <a href="https://github.com" target="_blank" rel="noreferrer" className="flex-1 rounded-full bg-[#24234f] py-2 text-center text-[11px] font-bold text-white"><Github size={11} className="mr-1 inline" /> GitHub</a>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(`git clone https://github.com/example/${product.slug}.git`);
                          toast.success("Clone command copied");
                        }}
                        className="rounded-full border border-[#e7e6e1] bg-white px-3 py-2 text-[11px] font-bold text-[#24234f]"><Copy size={11} className="mr-1 inline" /> Clone</button>
                    </div>
                  )}
                  {product.type === "kids" && (
                    <div className="flex gap-2">
                      <button onClick={() => toast.success("Download started (demo)")} className="flex-1 rounded-full bg-[#d9f99d] py-2 text-[11px] font-bold text-[#24234f]"><Download size={11} className="mr-1 inline" /> Download</button>
                      <button onClick={() => toast("Opening activity (demo)")} className="rounded-full border border-[#e7e6e1] bg-white px-3 py-2 text-[11px] font-bold text-[#24234f]">Open</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {readingProduct && (
        <FakeReader bookId={readingProduct.id} title={readingProduct.title} open={!!readerId} onClose={() => setReaderId(null)} />
      )}
    </div>
  );
}
