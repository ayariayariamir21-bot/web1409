import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { useCartStore, getCartTotals } from "@/store/cartStore";
import { QuantityStepper } from "@/components/QuantityStepper";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import { OrderSummary } from "@/components/OrderSummary";
import { formatCurrency } from "@/lib/format";
import { EmptyIllustration } from "@/components/EmptyIllustration";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const [, navigate] = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const { subtotal, discountAmount, tax, total, itemCount } = getCartTotals(items, appliedPromo);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeCart(); }
      if (e.key === "Tab" && drawerRef.current && isOpen) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); (last as HTMLElement).focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); (first as HTMLElement).focus(); }
      }
    };
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        (firstFocusable ?? drawerRef.current)?.focus();
      }, 100);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (!isOpen && triggerRef.current) {
        // return focus to trigger when closing
        setTimeout(() => triggerRef.current?.focus(), 0);
      }
    };
  }, [isOpen, closeCart]);

  const handleRemove = (id: string, title: string) => {
    removeItem(id);
    toast.success("Removed from cart", { description: title });
  };

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            aria-hidden="true"
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-[#17172a]/40 backdrop-blur-[2px]"
          />
          {/* drawer */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            aria-describedby="cart-drawer-desc"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={reduced ? { duration: 0 } : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col rounded-l-[28px] bg-white dark:bg-[#1e1e2e] dark:border-l dark:border-gray-800 shadow-[-18px_0_50px_rgba(23,23,42,.18)] outline-none sm:w-[420px]"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-[#e7e6e1] px-6 py-5">
              <h2 id="cart-drawer-title" className="font-display text-lg font-bold tracking-[-.04em] text-[#24234f]">
                Your Cart <span className="text-[#635BFF]">({itemCount})</span>
              </h2>
              <span id="cart-drawer-desc" className="sr-only">{itemCount} items in cart, total {formatCurrency(total)}</span>
              <button
                aria-label="Close cart"
                onClick={closeCart}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] text-[#24234f] hover:bg-[#24234f] hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* list */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
                  <EmptyIllustration type="cart" />
                  <h3 className="mt-4 font-display text-xl font-bold text-[#24234f]">Your cart is empty</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[#6f7184]">You haven't added anything yet — find something you love.</p>
                  <Link href="/shop" onClick={closeCart} className="ds-button ds-button-primary mt-6 h-10 px-5 text-xs">Browse products <ArrowRight size={14} /></Link>
                </div>
              ) : (
                <div className="divide-y divide-[#e7e6e1]/60">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3 p-4">
                      <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden"><img src={item.thumbnail} alt={item.title} width={400} height={300} loading="lazy" decoding="async" onLoad={(e)=>e.currentTarget.classList.remove("opacity-0")} className="h-full w-full object-cover opacity-0 transition-opacity duration-300" /></div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/product/${item.productId}`}
                            onClick={closeCart}
                            className="line-clamp-1 font-display text-sm font-bold text-[#24234f] hover:text-[#635BFF]"
                          >
                            {item.title}
                          </Link>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full bg-[#ecebff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#635BFF]">
                              {item.type}
                            </span>
                            <span className="text-xs font-bold text-[#24234f]">{formatCurrency(item.price)}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <QuantityStepper
                            qty={item.qty}
                            onDecrease={() => updateQty(item.productId, item.qty - 1)}
                            onIncrease={() => updateQty(item.productId, item.qty + 1)}
                            onChange={(v) => updateQty(item.productId, v)}
                            ariaLabel={item.title}
                          />
                          <button
                            aria-label={`Remove ${item.title}`}
                            onClick={() => handleRemove(item.productId, item.title)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#9b9baa] hover:bg-[#fef2f2] hover:text-[#f56f64] transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* sticky footer */}
            {items.length > 0 && (
              <div className="border-t border-[#e7e6e1] bg-white p-4 sm:p-6">
                <PromoCodeInput />
                <div className="mt-4">
                  <OrderSummary
                    subtotal={subtotal}
                    discountAmount={discountAmount}
                    tax={tax}
                    total={total}
                    appliedCode={appliedPromo?.code ?? null}
                  />
                </div>
                <button
                  onClick={handleCheckout}
                  className="ds-button ds-button-primary mt-4 h-11 w-full text-sm"
                >
                  Checkout — {formatCurrency(total)} <ArrowRight size={15} />
                </button>
                <button
                  onClick={closeCart}
                  className="ds-button ds-button-ghost mt-2 h-10 w-full text-xs"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
