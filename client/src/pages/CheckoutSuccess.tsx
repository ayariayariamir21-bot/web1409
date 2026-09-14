import { Link } from "wouter";
import { Check, Download, LibraryBig, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

type LastOrder = {
  orderId: string;
  total: number;
  items: { title: string }[];
};

export function CheckoutSuccessPage() {
  let order: LastOrder | null = null;
  try {
    order = JSON.parse(localStorage.getItem("ds-last-order") || "null");
  } catch {}
  const orderId = order?.orderId ?? `DS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const total = order?.total ?? 0;

  return (
    <div className="ds-container relative flex min-h-[70vh] items-center justify-center overflow-hidden py-16">
      {/* confetti burst CSS */}
      <style>{`@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0) scale(1);opacity:1}100%{transform:translateY(160px) rotate(180deg) scale(0.8);opacity:0}}`}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <span key={i} style={{ left: `${18 + i * 12}%`, animation: `confettiFall 1.1s ${0.15 + i * 0.08}s ease-out forwards`, background: ["#635BFF","#d9f99d","#f9c74f","#f56f64","#8fe3d3","#ecebff"][i] }} className="absolute top-6 h-2.5 w-2.5 rounded-full" />
        ))}
      </div>
      <div className="w-full max-w-xl text-center relative">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 200 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#d9f99d] text-[#24234f] shadow-[0_16px_30px_rgba(217,249,157,.6)]"
        >
          <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <motion.path d="M10 18 L16 24 L26 12" stroke="#24234f" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.55, ease: "easeInOut", delay: 0.2 }} />
          </motion.svg>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#635BFF]">Order complete</p>
          <h1 className="font-display text-5xl font-bold tracking-[-.07em] text-[#24234f]">You’re all set.</h1>
          <p className="mt-4 text-[15px] leading-7 text-[#6f7184]">Your digital goods are waiting in your library. Thanks for supporting thoughtful work on the internet.</p>
          <div className="mt-6 inline-flex flex-col items-center gap-2 rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-[#e7e6e1]">
            <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9b9baa]">Order ID</span>
            <span className="font-mono text-sm font-bold tracking-wide text-[#24234f]">{orderId}</span>
            {total > 0 && <span className="text-sm font-bold text-[#635BFF]">{formatCurrency(total)} paid</span>}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/library" className="ds-button ds-button-primary h-11 px-6 text-sm">
              Go to Library <LibraryBig size={15} />
            </Link>
            <button
              onClick={() => toast.success("Download started (demo)", { description: "Your files are being prepared." })}
              className="ds-button ds-button-ghost h-11 px-6 text-sm"
            >
              <Download size={15} /> Download all
            </button>
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#9b9baa]">
            <Sparkles size={12} className="text-[#635BFF]" /> A confirmation was sent to your email (demo)
          </p>
        </motion.div>
      </div>
    </div>
  );
}
