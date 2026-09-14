import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useProductsStore } from "@/store/productsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyIllustration } from "@/components/EmptyIllustration";

function ProductCardWishlist({ id }: { id: string }) {
  const product = useProductsStore((s)=>s.getProduct(id));
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  if (!product) return null;
  return (
    <article className="ds-card overflow-hidden">
      <Link href={`/product/${product.id}`} className="relative block aspect-[1.2/1] overflow-hidden" style={{ background: `${product.accent}16` }}>
        <img src={product.thumbnail} alt={product.title} width={400} height={300} loading="lazy" decoding="async" onLoad={(e)=>e.currentTarget.classList.remove("opacity-0")} className="h-full w-full object-cover mix-blend-multiply opacity-0 transition-opacity duration-300" />
      </Link>
      <div className="p-4">
        <p className="text-[11px] font-semibold text-[#9b9baa]">{product.category}</p>
        <Link href={`/product/${product.id}`}><h3 className="mt-1 font-display text-[17px] font-bold text-[#24234f] hover:text-[#635BFF]">{product.title}</h3></Link>
        <p className="mt-1 line-clamp-2 text-xs text-[#6f7184]">{product.description}</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              if (product.isFree || product.type === "open-source") {
                toast.success("Free download ready (demo)");
                return;
              }
              addItem(product);
              remove(product.id);
              openCart();
              toast.success("Moved to cart", { description: product.title });
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#24234f] py-2 text-[11px] font-bold text-white hover:bg-[#635BFF]"
          >
            <ShoppingBag size={13} /> Move to cart
          </button>
          <button
            onClick={() => { remove(product.id); toast("Removed from wishlist"); }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7e6e1] bg-white text-[#9b9baa] hover:text-[#f56f64]"
            aria-label={`Remove ${product.title}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const clear = useWishlistStore((s) => s.clear);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="ds-container py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="ds-card p-4">
              <Skeleton className="h-40 rounded-xl dark:bg-white/10" />
              <Skeleton className="mt-3 h-4 w-3/4 dark:bg-white/10" />
              <Skeleton className="mt-2 h-3 w-1/2 dark:bg-white/10" />
              <Skeleton className="mt-4 h-8 w-full rounded-full dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="ds-container py-14 text-center">
        <EmptyIllustration type="wishlist" />
        <h2 className="mt-6 font-display text-2xl font-bold text-[#24234f]">No favorites yet</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f7184]">You haven't saved anything yet — tap the heart on any product to keep it for later.</p>
        <Link href="/shop" className="ds-button ds-button-primary mt-6 h-11 px-5 text-sm">Explore products <ArrowRight size={15} /></Link>
      </div>
    );
  }

  const handleAddAll = () => {
    let added = 0;
    let skipped = 0;
    items.forEach((id) => {
      const p = useProductsStore.getState().getProduct(id);
      if (!p) return;
      if (p.isFree || p.type === "open-source") skipped++;
      else { addItem(p); added++; }
    });
    if (added > 0) {
      openCart();
      if (skipped > 0) toast.success(`${added} items added · ${skipped} free item${skipped > 1 ? 's' : ''} skipped`);
      else toast.success(`Added ${added} items to cart`);
    } else if (skipped > 0) {
      toast("No purchasable items to add", { description: `${skipped} free item${skipped > 1 ? 's' : ''} skipped` });
    } else {
      toast("No purchasable items to add");
    }
  };

  return (
    <div className="ds-container py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#f56f64]">Saved for later</p>
          <h1 className="font-display text-5xl font-bold tracking-[-.07em] text-[#24234f]">Your wishlist<span className="text-[#f56f64]">.</span></h1>
          <p className="mt-3 text-sm text-[#6f7184]">A little list of things you might love.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAddAll} className="ds-button ds-button-primary h-10 px-5 text-xs"><ShoppingBag size={14} /> Add all to cart</button>
          <button onClick={() => { clear(); toast("Wishlist cleared"); }} className="ds-button ds-button-ghost h-10 px-4 text-xs">Clear</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((id) => <ProductCardWishlist key={id} id={id} />)}
      </div>
    </div>
  );
}
