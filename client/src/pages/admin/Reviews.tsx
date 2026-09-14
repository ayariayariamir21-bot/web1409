import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Star, Check, X, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useReviewsStore, type Review } from "@/store/reviewsStore";
import { useProductsStore } from "@/store/productsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

type Tab = "pending" | "approved" | "rejected" | "all";

export function Reviews() {
  const reviews = useReviewsStore((s) => s.reviews);
  const approve = useReviewsStore((s) => s.approve);
  const reject = useReviewsStore((s) => s.reject);
  const del = useReviewsStore((s) => s.delete);
  const reply = useReviewsStore((s) => s.reply);
  const products = useProductsStore((s) => s.products);
  const [tab, setTab] = useState<Tab>("pending");
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return reviews;
    return reviews.filter((r) => r.status === tab);
  }, [reviews, tab]);

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const handleBulkApprove = () => {
    selected.forEach((id) => approve(id));
    toast.success(`${selected.size} reviews approved`);
    setSelected(new Set());
  };
  const handleBulkReject = () => {
    selected.forEach((id) => reject(id));
    toast.success(`${selected.size} reviews rejected`);
    setSelected(new Set());
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 rounded-2xl" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-.04em] text-[#24234f] dark:text-white">Reviews</h1>
          <p className="text-sm text-[#6f7184] dark:text-gray-400">{pendingCount} pending · {reviews.length} total</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(["pending", "approved", "rejected", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${tab === t ? "bg-[#635BFF] text-white" : "bg-white dark:bg-white/5 border border-[#e7e6e1] dark:border-gray-700 text-[#6f7184] dark:text-gray-400"}`}
          >
            {t} {t === "pending" ? `(${pendingCount})` : t === "all" ? `(${reviews.length})` : `(${reviews.filter((r) => r.status === t).length})`}
          </button>
        ))}
      </div>

      {tab === "pending" && selected.size > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-[#635BFF] text-white px-4 py-3">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkApprove} className="rounded-full bg-white text-[#635BFF] px-4 py-2 text-xs font-bold">Approve all</button>
            <button onClick={handleBulkReject} className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold">Reject selected</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map((r) => {
          const product = products.find((p) => p.id === r.productId);
          return (
            <div key={r.id} className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-4">
              <div className="flex gap-3">
                {tab === "pending" && <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} aria-label={`Select ${r.id}`} className="mt-1" />}
                <Link href={`/product/${r.productId}`} className="shrink-0">
                  <img src={product?.thumbnail} alt="" width={48} height={48} loading="lazy" className="h-12 w-12 rounded-xl object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/product/${r.productId}`} className="text-sm font-bold text-[#24234f] dark:text-white hover:text-[#635BFF] truncate">{product?.title ?? r.productId}</Link>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${r.status === "pending" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300" : r.status === "approved" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300"}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-[#6f7184] dark:text-gray-400">{r.customerName} · {Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={12} fill={i < r.rating ? "#f9b938" : "none"} className={i < r.rating ? "text-[#f9b938]" : "text-[#e7e6e1]"} />))} · {formatDate(r.createdAt)}</p>
                  <p className="mt-1 text-sm font-bold text-[#24234f] dark:text-white">{r.title}</p>
                  <p className="text-sm text-[#6f7184] dark:text-gray-400">{r.body}</p>
                  {r.reply && (
                    <div className="mt-2 rounded-xl bg-[#f7f6f2] dark:bg-white/5 p-3">
                      <p className="text-xs font-bold text-[#635BFF]">Reply</p>
                      <p className="text-sm">{r.reply.text}</p>
                      <p className="text-[11px] text-[#9b9baa]">{formatDate(r.reply.createdAt)}</p>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    <button onClick={() => { approve(r.id); toast.success("Approved"); }} className="flex items-center gap-1 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/20"><Check size={12} /> Approve</button>
                    <button onClick={() => { reject(r.id); toast.success("Rejected"); }} className="flex items-center gap-1 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20"><X size={12} /> Reject</button>
                    <button onClick={() => { del(r.id); toast.success("Deleted"); }} className="flex items-center gap-1 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold hover:bg-red-50"><Trash2 size={12} /> Delete</button>
                    <button onClick={() => setReplyId(replyId === r.id ? null : r.id)} className="flex items-center gap-1 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold"><MessageSquare size={12} /> Reply</button>
                  </div>
                  {replyId === r.id && (
                    <div className="mt-3 flex gap-2">
                      <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 h-10 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
                      <button onClick={() => { if (replyText.trim()) { reply(r.id, replyText.trim()); toast.success("Replied"); setReplyText(""); setReplyId(null); } }} className="h-10 rounded-full bg-[#635BFF] text-white px-4 text-xs font-bold">Send</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-sm text-[#6f7184] py-12">No reviews in this tab.</p>}
      </div>
    </div>
  );
}
