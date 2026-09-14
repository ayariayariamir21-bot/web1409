import { Link } from "wouter";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore, getCartTotals } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { QuantityStepper } from "@/components/QuantityStepper";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import { OrderSummary } from "@/components/OrderSummary";
import { formatCurrency } from "@/lib/format";
import { useProductsStore } from "@/store/productsStore";
import { EmptyIllustration } from "@/components/EmptyIllustration";

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const { subtotal, discountAmount, tax, total } = getCartTotals(items, appliedPromo);

  if (items.length === 0) {
    return (
      <div className="ds-container py-14">
        <div className="ds-card flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
          <EmptyIllustration type="cart" />
          <h2 className="mt-6 font-display text-2xl font-bold text-[#24234f]">Your cart is empty</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#6f7184]">You haven't added anything yet — browse the collection and add something you love.</p>
          <Link href="/shop" className="ds-button ds-button-primary mt-6 h-11 px-5 text-sm">Browse products <ArrowRight size={15} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-container py-14">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#635BFF]">Almost yours</p>
          <h1 className="font-display text-5xl font-bold tracking-[-.07em] text-[#24234f]">
            Your bag<span className="text-[#635BFF]">.</span>
          </h1>
        </div>
        <span className="text-sm text-[#9b9baa]">{items.length} {items.length === 1 ? "item" : "items"}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => {
            const product = useProductsStore.getState().getProduct(item.productId);
            return (
              <div key={item.productId} className="ds-card flex gap-4 p-4">
                <Link href={`/product/${item.productId}`} className="shrink-0">
                  <div className="h-28 w-28 rounded-2xl bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0"><img src={item.thumbnail} alt={item.title} width={400} height={300} loading="lazy" decoding="async" onLoad={(e)=>e.currentTarget.classList.remove("opacity-0")} className="h-full w-full object-cover opacity-0 transition-opacity duration-300" /></div>
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9b9baa]">{product?.category}</p>
                      <Link href={`/product/${item.productId}`}>
                        <h3 className="mt-1 font-display text-base font-bold text-[#24234f] hover:text-[#635BFF]">{item.title}</h3>
                      </Link>
                      <p className="mt-1 text-xs font-bold text-[#24234f]">{formatCurrency(item.price)}</p>
                    </div>
                    <button
                      aria-label={`Remove ${item.title}`}
                      onClick={() => { removeItem(item.productId); toast.success("Removed from cart"); }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#9b9baa] hover:bg-[#fef2f2] hover:text-[#f56f64]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <QuantityStepper
                      qty={item.qty}
                      onDecrease={() => updateQty(item.productId, item.qty - 1)}
                      onIncrease={() => updateQty(item.productId, item.qty + 1)}
                      onChange={(v) => updateQty(item.productId, v)}
                      ariaLabel={item.title}
                    />
                    <button
                      onClick={() => {
                        const has = useWishlistStore.getState().items.includes(item.productId);
                        if (!has) {
                          // idempotent add
                          useWishlistStore.getState().toggle(item.productId);
                        }
                        removeItem(item.productId);
                        toast.success("Moved to wishlist", { description: item.title });
                      }}
                      aria-label={`Save ${item.title} for later`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#635BFF] hover:text-[#5149eb]"
                    >
                      <Heart size={13} /> Save for later
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit lg:sticky lg:top-24">
          <div className="ds-card p-5 dark:bg-[#1e1e2e] dark:border-gray-800">
            <h2 className="font-display text-lg font-bold text-[#24234f] dark:text-white">Order summary</h2>
            <div className="mt-4">
              <PromoCodeInput />
            </div>
            <div className="mt-4">
              <OrderSummary subtotal={subtotal} discountAmount={discountAmount} tax={tax} total={total} appliedCode={appliedPromo?.code ?? null} />
            </div>
            <Link href="/checkout" className="ds-button ds-button-primary mt-5 h-11 w-full text-sm">
              Checkout — {formatCurrency(total)} <ArrowRight size={15} />
            </Link>
            <Link href="/shop" className="ds-button ds-button-ghost mt-2 h-11 w-full text-sm">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
