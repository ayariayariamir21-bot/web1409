import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { useCouponsStore, type Coupon } from "@/store/couponsStore";
import { useProductsStore } from "@/store/productsStore";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function Coupons() {
  const coupons = useCouponsStore((s) => s.coupons);
  const addCoupon = useCouponsStore((s) => s.addCoupon);
  const updateCoupon = useCouponsStore((s) => s.updateCoupon);
  const deleteCoupon = useCouponsStore((s) => s.deleteCoupon);
  const toggleActive = useCouponsStore((s) => s.toggleActive);
  const products = useProductsStore((s) => s.products);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");
  const [appliesTo, setAppliesTo] = useState("all");
  const [specificProduct, setSpecificProduct] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 10));
  const [expiresAt, setExpiresAt] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [error, setError] = useState("");

  const resetForm = () => {
    setCode("");
    setType("percent");
    setValue("10");
    setAppliesTo("all");
    setSpecificProduct("");
    setMinPurchase("");
    setMaxUses("");
    setStartsAt(new Date().toISOString().slice(0, 10));
    setExpiresAt(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setError("");
    setEditing(null);
  };

  const openNew = () => {
    resetForm();
    setShowModal(true);
  };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setCode(c.code);
    setType(c.type);
    setValue(String(c.value));
    setAppliesTo(c.appliesTo === "all" || c.appliesTo === "kids" ? c.appliesTo : "all");
    setSpecificProduct(c.appliesTo !== "all" && c.appliesTo !== "kids" ? c.appliesTo : "");
    setMinPurchase(c.minPurchase ? String(c.minPurchase) : "");
    setMaxUses(c.maxUses ? String(c.maxUses) : "");
    setStartsAt(c.startsAt);
    setExpiresAt(c.expiresAt);
    setError("");
    setShowModal(true);
  };

  const handleSave = () => {
    const upper = code.trim().toUpperCase();
    if (!upper) { setError("Code required"); return; }
    if (coupons.some((x) => x.code === upper && x.id !== editing?.id)) { setError("Code must be unique"); return; }
    if (!value || isNaN(Number(value)) || Number(value) <= 0) { setError("Value must be >0"); return; }
    const finalApplies = specificProduct ? specificProduct : appliesTo;
    const payload: any = {
      code: upper,
      type,
      value: Number(value),
      appliesTo: finalApplies,
      minPurchase: minPurchase ? Number(minPurchase) : undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
      startsAt,
      expiresAt,
      isActive: editing?.isActive ?? true,
    };
    if (editing) {
      updateCoupon(editing.id, payload);
      toast.success("Coupon updated");
    } else {
      addCoupon(payload);
      toast.success("Coupon created — try it at /cart");
    }
    setShowModal(false);
    resetForm();
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
          <h1 className="font-display text-2xl font-bold tracking-[-.04em] text-[#24234f] dark:text-white">Coupons</h1>
          <p className="text-sm text-[#6f7184] dark:text-gray-400">{coupons.length} coupons · edits apply instantly at /cart</p>
        </div>
        <button onClick={openNew} className="ds-button ds-button-primary h-10 px-5 text-sm">
          <Plus size={16} /> New coupon
        </button>
      </div>

      <div className="hidden md:block overflow-auto rounded-2xl border border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e]">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f6f2] dark:bg-white/5 text-left text-xs">
            <tr>
              <th className="px-3 py-3">Code</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Value</th>
              <th className="px-3 py-3">Applies to</th>
              <th className="px-3 py-3">Uses</th>
              <th className="px-3 py-3">Expires</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0efeb] dark:divide-gray-800">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-[#f7f6f2]/50 dark:hover:bg-white/5">
                <td className="px-3 py-3 font-mono text-xs font-bold">{c.code}</td>
                <td className="px-3 py-3 text-xs">{c.type}</td>
                <td className="px-3 py-3 text-xs">{c.type === "percent" ? `${c.value}%` : `$${c.value}`}</td>
                <td className="px-3 py-3 text-xs truncate max-w-[120px]">{c.appliesTo}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-[#e7e6e1] dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#635BFF]" style={{ width: `${c.maxUses ? Math.min(100, (c.usedCount / c.maxUses) * 100) : 30}%` }} />
                    </div>
                    <span className="text-xs tabular-nums">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-xs tabular-nums">{c.expiresAt}</td>
                <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${c.isActive ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-3 py-3 flex gap-1">
                  <button aria-label={`Edit ${c.code}`} onClick={() => openEdit(c)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10"><Pencil size={14} /></button>
                  <button aria-label={`Toggle ${c.code}`} onClick={() => { toggleActive(c.id); toast.success(c.isActive ? "Deactivated" : "Activated"); }} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f7f6f2] dark:hover:bg-white/10"><Power size={14} /></button>
                  <button aria-label={`Delete ${c.code}`} onClick={() => setConfirmId(c.id)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {coupons.map((c) => (
          <div key={c.id} className="rounded-2xl border border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e] p-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-bold">{c.code}</p>
              <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{c.isActive ? "Active" : "Inactive"}</span>
            </div>
            <p className="text-xs text-[#6f7184] dark:text-gray-400">{c.type} · {c.type === "percent" ? `${c.value}%` : `$${c.value}`} · {c.appliesTo}</p>
            <div className="mt-2 flex gap-1">
              <button onClick={() => openEdit(c)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/5"><Pencil size={14} /></button>
              <button onClick={() => { toggleActive(c.id); toast.success(c.isActive ? "Deactivated" : "Activated"); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/5"><Power size={14} /></button>
              <button onClick={() => setConfirmId(c.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#17172a]/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-6">
            <h2 className="font-display text-lg font-bold text-[#24234f] dark:text-white">{editing ? "Edit coupon" : "New coupon"}</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-bold">Code *
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER20" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm uppercase outline-none" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold">Type
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm">
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </label>
                <label className="block text-xs font-bold">Value *
                  <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm" />
                </label>
              </div>
              <label className="block text-xs font-bold">Applies to
                <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm">
                  <option value="all">All</option>
                  <option value="kids">Kids</option>
                  <option value="Software">Software</option>
                  <option value="Websites">Websites</option>
                  <option value="Online Books">Online Books</option>
                </select>
              </label>
              <label className="block text-xs font-bold">Specific product ID (optional)
                <select value={specificProduct} onChange={(e) => setSpecificProduct(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm">
                  <option value="">— none —</option>
                  {products.slice(0, 12).map((p) => <option key={p.id} value={p.id}>{p.id} — {p.title.slice(0, 20)}</option>)}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold">Min purchase
                  <input type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} placeholder="0" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm" />
                </label>
                <label className="block text-xs font-bold">Max uses
                  <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="100" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold">Starts at
                  <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm" />
                </label>
                <label className="block text-xs font-bold">Expires at
                  <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm" />
                </label>
              </div>
              {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="h-10 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-5 text-sm font-bold">Cancel</button>
                <button onClick={handleSave} className="h-10 rounded-full bg-[#635BFF] text-white px-5 text-sm font-bold">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmId} title="Delete coupon?" description="This cannot be undone." onConfirm={() => { if (confirmId) { deleteCoupon(confirmId); toast.success("Coupon deleted"); setConfirmId(null); } }} onClose={() => setConfirmId(null)} />
    </div>
  );
}
