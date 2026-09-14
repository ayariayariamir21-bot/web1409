import { useState } from "react";
import { X, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useReducedMotion } from "@/lib/motion";

export function PromoCodeInput() {
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const promoError = useCartStore((s) => s.promoError);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const removePromo = useCartStore((s) => s.removePromo);
  const [code, setCode] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const reduced = useReducedMotion();

  const handleApply = () => {
    if (!code.trim()) return;
    const ok = applyPromo(code);
    if (ok) setCode("");
    else setShakeKey((k) => k + 1);
  };

  if (appliedPromo) {
    return (
      <motion.div initial={reduced ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.2 }} className="flex items-center justify-between rounded-2xl border border-[#d9f99d] dark:border-emerald-900 bg-[#f6ffdf] dark:bg-emerald-950/40 px-3 py-2.5">
        <span className="flex items-center gap-2 text-xs font-bold text-[#47723b] dark:text-emerald-300">
          <Tag size={14} /> {appliedPromo.code}
          <span className="font-normal text-[#6a8a4a]">— {appliedPromo.description}</span>
        </span>
        <button aria-label="Remove promo code" onClick={removePromo} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#47723b] shadow-sm hover:bg-[#24234f] hover:text-white transition"><X size={12} /></button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-1.5">
      <motion.div key={shakeKey} animate={promoError && !reduced ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.35 }} className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9baa]" />
          <input aria-label="Promo code" aria-invalid={!!promoError} aria-describedby={promoError ? "promo-error" : undefined} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleApply()} placeholder="Promo code" className="h-10 w-full rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 dark:text-white pl-9 pr-3 text-xs font-bold uppercase tracking-wide outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10" />
        </div>
        <button onClick={handleApply} className="ds-button ds-button-ghost h-10 px-5 text-xs shrink-0">Apply</button>
      </motion.div>
      <AnimatePresence>
        {promoError && <motion.p id="promo-error" role="alert" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-1 text-[11px] font-semibold text-[#f56f64] dark:text-red-400">{promoError}</motion.p>}
      </AnimatePresence>
      <p className="px-1 text-[10px] text-[#9b9baa]">Try DIGITAL10, KIDS20, FREE50</p>
    </div>
  );
}
