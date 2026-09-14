import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function QuantityStepper({
  qty,
  onDecrease,
  onIncrease,
  onChange,
  min = 1,
  max = 99,
  ariaLabel = "Quantity",
}: {
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange?: (v: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 p-1">
      <motion.button
        whileTap={{ scale: 0.95 }}
        aria-label={`Decrease ${ariaLabel}`}
        onClick={onDecrease}
        disabled={qty <= min}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f7f6f2] dark:bg-white/10 text-[#24234f] dark:text-white transition hover:bg-[#24234f] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus size={12} />
      </motion.button>
      <span aria-atomic="true" className="sr-only">{qty}</span>
      <div className="relative h-7 w-9 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={qty}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.18 }}
            className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#24234f] dark:text-white"
            aria-live="polite"
          >
            {qty}
          </motion.span>
        </AnimatePresence>
        <input aria-label={ariaLabel} aria-hidden="true" tabIndex={-1} type="number" value={qty} min={min} max={max} onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && onChange) onChange(Math.max(min, Math.min(max, v))); }} className="absolute inset-0 h-full w-full opacity-0" />
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        aria-label={`Increase ${ariaLabel}`}
        onClick={onIncrease}
        disabled={qty >= max}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#24234f] text-white transition hover:bg-[#635BFF] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus size={12} />
      </motion.button>
    </div>
  );
}
