import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, RotateCcw, Send, Mail, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "@/store/ordersStore";
import { formatCurrency, formatDate } from "@/lib/format";

export function OrderDetail({ id }: { id: string }) {
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id));
  const refund = useOrdersStore((s) => s.refund);
  const addNote = useOrdersStore((s) => s.addNote);
  const updateStatus = useOrdersStore((s) => s.updateStatus);
  const [note, setNote] = useState(order?.note ?? "");

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm">Order not found</p>
        <Link href="/admin/orders" className="text-sm font-bold text-[#635BFF]">Back</Link>
      </div>
    );
  }

  const handleRefund = () => {
    refund(order.id);
    toast.success("Order refunded");
  };
  const handleSaveNote = () => {
    addNote(order.id, note);
    toast.success("Note saved");
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-[#6f7184] dark:text-gray-400">
        <ArrowLeft size={13} /> Back to orders
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-5">
            <div className="flex items-center justify-between">
              <h1 className="font-mono text-lg font-bold text-[#24234f] dark:text-white">{order.id}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === "paid" ? "bg-emerald-50 text-emerald-700" : order.status === "pending" ? "bg-amber-50 text-amber-700" : order.status === "failed" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}>{order.status}</span>
            </div>
            <p className="text-xs text-[#6f7184] dark:text-gray-400">{formatDate(order.createdAt)} · {order.paymentMethod}</p>
            <div className="mt-4 rounded-2xl bg-[#f7f6f2] dark:bg-white/5 p-4">
              <p className="text-xs font-bold text-[#24234f] dark:text-white">Customer</p>
              <p className="text-sm font-semibold">{order.customerName}</p>
              <p className="text-xs text-[#6f7184] dark:text-gray-400">{order.customerEmail}</p>
              <Link href={`/admin/customers/${order.customerId}`} className="mt-2 inline-flex text-xs font-bold text-[#635BFF]">View customer →</Link>
            </div>
            <div className="mt-4 space-y-3">
              {order.items.map((it) => (
                <div key={it.productId} className="flex gap-3 rounded-xl bg-[#f7f6f2] dark:bg-white/5 p-3">
                  <img src={it.thumbnail} alt="" width={48} height={48} loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{it.title}</p>
                    <p className="text-xs text-[#6f7184] dark:text-gray-400">Qty {it.qty} · {formatCurrency(it.price)}</p>
                  </div>
                  <p className="text-sm font-bold tabular-nums">{formatCurrency(it.price * it.qty)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-white dark:bg-[#1e1e2e] border border-[#e7e6e1] dark:border-gray-800 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#6f7184] dark:text-gray-400">Subtotal</span><span className="font-bold tabular-nums">{formatCurrency(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount {order.promoCode ? `(${order.promoCode})` : ""}</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-[#6f7184] dark:text-gray-400">Tax</span><span className="font-bold tabular-nums">{formatCurrency(order.tax)}</span></div>
              <div className="flex justify-between border-t border-[#e7e6e1] dark:border-gray-800 pt-2 font-bold"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </div>
        </div>
        <div className="space-y-4 lg:sticky lg:top-20 h-fit">
          <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-4 space-y-2">
            <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Actions</h3>
            <button onClick={handleRefund} disabled={order.status === "refunded"} className="w-full h-10 rounded-full bg-amber-500 text-white text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-1"><RotateCcw size={14} /> Refund</button>
            <button onClick={() => toast.success("Download link resent")} className="w-full h-10 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 text-sm font-bold flex items-center justify-center gap-1"><Send size={14} /> Resend download</button>
            <button onClick={() => toast.success("Receipt resent")} className="w-full h-10 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 text-sm font-bold flex items-center justify-center gap-1"><Mail size={14} /> Resend receipt</button>
            <button onClick={() => { updateStatus(order.id, "paid"); toast.success("Marked as paid"); }} className="w-full h-10 rounded-full bg-[#635BFF] text-white text-sm font-bold flex items-center justify-center gap-1"><CreditCard size={14} /> Mark as paid</button>
          </div>
          <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-4">
            <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Timeline</h3>
            <div className="mt-3 space-y-2">
              {order.timeline.map((t, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="font-bold">{t.status}</span>
                  <span className="text-[#6f7184] dark:text-gray-400">{formatDate(t.at)}</span>
                  {t.note && <span className="text-[#6f7184]">— {t.note}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-4">
            <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Internal note</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Add a note..." className="mt-2 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 p-3 text-sm outline-none" />
            <button onClick={handleSaveNote} className="mt-2 h-9 rounded-full bg-[#635BFF] text-white px-4 text-xs font-bold">Save note</button>
          </div>
        </div>
      </div>
    </div>
  );
}
