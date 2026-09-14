import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatCurrency } from "@/lib/format";

function AnimatedValue({ value }: { value: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      key={value}
      initial={{ y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="inline-block"
    >
      {formatCurrency(value)}
    </motion.span>
  );
}

export function OrderSummary({
  subtotal,
  discountAmount,
  tax,
  total,
  appliedCode,
}: {
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  appliedCode?: string | null;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="space-y-2.5 rounded-2xl bg-[#f7f6f2] dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-4">
      <div className="flex justify-between text-xs">
        <span className="text-[#6f7184] dark:text-gray-400">Subtotal</span>
        <span className="font-bold text-[#24234f] dark:text-white">
          <AnimatedValue value={subtotal} />
        </span>
      </div>
      <AnimatePresence>
        {discountAmount > 0 && (
          <motion.div
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-between text-xs"
          >
            <span className="text-[#0f9f88] font-semibold">
              Discount {appliedCode ? `(${appliedCode})` : ""}
            </span>
            <span className="font-bold text-[#0f9f88]">- {formatCurrency(discountAmount)}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between text-xs">
        <span className="text-[#6f7184] dark:text-gray-400">Tax (8%)</span>
        <span className="font-bold text-[#24234f] dark:text-white">
          <AnimatedValue value={tax} />
        </span>
      </div>
      <div className="flex justify-between border-t border-[#e7e6e1] dark:border-gray-800 pt-3">
        <span className="text-sm font-bold text-[#24234f] dark:text-white">Total</span>
        <span className="font-display text-lg font-bold text-[#24234f] dark:text-white">
          <AnimatedValue value={total} />
        </span>
      </div>
    </div>
  );
}
