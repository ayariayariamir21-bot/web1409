import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, ChevronRight, Download, Eye, Github, Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { products as seedProducts, type Product, type ProductType } from "@/data";
import { useProductsStore, getActiveProducts } from "@/store/productsStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useLibraryStore } from "@/store/libraryStore";

const typeLabel: Record<ProductType, string> = { software: 'Software', website: 'Website', 'open-source': 'Open Source', book: 'Book', course: 'Course', kids: 'Kids Room' };

function Rating({ rating, reviews }: { rating: number; reviews?: number }) {
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#24234f]">★ {rating.toFixed(1)}{reviews !== undefined && <span className="text-[#9b9baa]">({reviews})</span>}</span>;
}
function Price({ product, large = false }: { product: Product; large?: boolean }) {
  return <div className="flex items-baseline gap-2"><span className={`font-display font-bold tracking-[-.05em] ${large ? 'text-3xl' : 'text-[17px]'} ${product.isFree ? 'text-[#0f9f88]' : 'text-[#24234f]'}`}>{product.price === 0 ? 'Free' : `$${product.price}`}</span>{product.oldPrice && <span className="text-xs text-[#9b9baa] line-through">${product.oldPrice}</span>}</div>;
}
function ProductCardSmall({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggle = useWishlistStore((s) => s.toggle);
  const wishlist = useWishlistStore((s) => s.items);
  const saved = wishlist.includes(product.id);
  return (
    <article className="ds-card overflow-hidden">
      <div className="relative aspect-[1.2/1] overflow-hidden" style={{ background: `${product.accent}16` }}>
        <img src={product.thumbnail} alt={product.title} width={400} height={300} loading="lazy" decoding="async" onLoad={(e)=>e.currentTarget.classList.remove("opacity-0")} className="h-full w-full object-cover mix-blend-multiply opacity-0 transition-opacity duration-300" />
        <button aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggle(product.id)} className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full ${saved ? 'bg-[#f56f64] text-white' : 'bg-white/85 text-[#24234f]'}`}><Heart size={15} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="p-4">
        <Link href={`/product/${product.id}`}><h3 className="font-display text-sm font-bold text-[#24234f] hover:text-[#635BFF]">{product.title}</h3></Link>
        <div className="mt-3 flex items-center justify-between"><Price product={product} /><button onClick={() => { if (product.isFree) { toast.success('Free download ready'); return; } addItem(product); openCart(); toast.success('Added to bag'); }} className="flex h-7 items-center gap-1 rounded-full border border-[#e7e6e1] bg-white px-2.5 text-[11px] font-bold text-[#24234f]">Add</button></div>
      </div>
    </article>
  );
}

export function ProductDetailPage({ id }: { id: string }) {
  const product = useProductsStore((s)=>s.getProduct(id));
  const [, navigate] = useLocation();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const inCart = useCartStore((s) => s.items.some((i) => i.productId === id));
  const wishlist = useWishlistStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const hasPurchased = useLibraryStore((s) => s.hasPurchased);
  const [tab, setTab] = useState('About');
  const [sampleOpen, setSampleOpen] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  if (!product || (product as any).isActive === false) return <div className="ds-container py-20 text-center">Not found</div>;
  const allActive = getActiveProducts(useProductsStore((s)=>s.products));
  const related = allActive.filter((p) => p.type === product.type && p.id !== product.id).slice(0, 4);
  const owned = hasPurchased(product.id);
  const isFree = product.isFree || product.type === 'open-source' || product.price === 0;
  const saved = wishlist.includes(product.id);

  const handleAddToCart = () => {
    if (owned) { navigate('/library'); return; }
    if (isFree) {
      toast.success('Free download ready', { description: `${product.title} was added to your library.` });
      const lib = useLibraryStore.getState();
      if (!lib.hasPurchased(product.id)) {
        const orderId = `DS-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`;
        lib.addPurchase({ id: orderId, orderId, items: [{ productId: product.id, title: product.title, thumbnail: product.thumbnail, type: product.type, price: 0, qty: 1 }], date: new Date().toISOString(), total: 0, subtotal: 0, discount: 0, tax: 0 } as any);
      }
      return;
    }
    addItem(product);
    openCart();
    toast.success('Added to your bag', { description: product.title });
  };

  const handleBuyNow = () => {
    if (owned) { navigate('/library'); return; }
    if (isFree) { handleAddToCart(); return; }
    addItem(product);
    navigate('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 350);
    if (saved) toast('Removed from wishlist');
    else toast.success('Saved to wishlist', { description: product.title });
  };

  return (
    <div className="min-h-screen">
      <main className="ds-container py-12">
        <div className="mb-8 flex items-center gap-2 text-xs text-[#9b9baa]"><Link href="/" className="hover:text-[#635BFF]">Home</Link><ChevronRight size={13} /><Link href="/shop" className="hover:text-[#635BFF]">Shop</Link><ChevronRight size={13} /><span className="text-[#24234f]">{product.title}</span></div>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="relative overflow-hidden rounded-[30px] p-3" style={{ background: `${product.accent}22` }}>
              <img src={product.gallery[0]} alt={product.title} width={400} height={300} loading="eager" fetchPriority="high" decoding="async" onLoad={(e)=>e.currentTarget.classList.remove("opacity-0")} className="aspect-[1.15/1] w-full rounded-[22px] object-cover mix-blend-multiply opacity-0 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 flex gap-2"><span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#24234f]">{typeLabel[product.type]}</span>{product.isFree && <span className="rounded-full bg-[#d9f99d] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#24234f]">Free forever</span>}</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">{product.gallery.map((image, i) => <img key={image} src={image} alt="" width={400} height={300} loading="lazy" decoding="async" onLoad={(e)=>e.currentTarget.classList.remove("opacity-0")} className={`aspect-[1.6/1] w-full rounded-2xl object-cover mix-blend-multiply opacity-0 transition-opacity duration-300 ${i === 0 ? 'ring-2 ring-[#635BFF] ring-offset-2 ring-offset-[#f7f6f2]' : 'opacity-70'}`} />)}</div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-2 text-xs text-[#9b9baa]"><span className="rounded-full bg-[#ecebff] px-2.5 py-1 font-bold text-[#635BFF]">{product.category}</span><span>·</span><span>{product.author}</span></div>
            <h1 className="font-display text-5xl font-bold leading-[.98] tracking-[-.075em] text-[#24234f] sm:text-6xl">{product.title}</h1>
            <p className="mt-6 max-w-xl text-[16px] leading-7 text-[#6f7184]">{product.description}</p>
            <div className="mt-5 flex items-center gap-4"><Rating rating={product.rating} reviews={product.reviewsCount} /><span className="text-xs text-[#9b9baa]">Updated recently</span></div>
            <div className="my-8 flex items-end justify-between border-y border-[#e7e6e1] py-6"><Price product={product} large /><span className="text-xs text-[#9b9baa]">{isFree ? 'No credit card required' : 'One-time purchase · lifetime access'}</span></div>
            {owned ? (
              <div className="flex flex-wrap gap-3">
                <Link href="/library" className="ds-button ds-button-primary h-12 px-6 text-sm">Go to Library <ArrowRight size={16} /></Link>
                <button onClick={handleWishlist} className={`ds-button h-12 w-12 border transition ${heartAnim ? 'scale-110' : ''} ${saved ? 'border-[#f56f64] bg-[#fff0ef] text-[#f56f64]' : 'border-[#e7e6e1] bg-white text-[#24234f]'}`} aria-label="Wishlist"><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
              </div>
            ) : isFree ? (
              <div className="flex flex-wrap gap-3">
                <button onClick={handleAddToCart} className="ds-button ds-button-primary h-12 flex-1 px-6 text-sm sm:flex-none"><Download size={17} /> Download free</button>
                <button onClick={() => toast('Opening GitHub', { description: 'In a real app this would open the repository.' })} className="ds-button ds-button-ghost h-12 px-5 text-sm"><Github size={16} /> View on GitHub</button>
                <button onClick={handleWishlist} className={`ds-button h-12 w-12 border transition ${heartAnim ? 'scale-125' : 'scale-100'} ${saved ? 'border-[#f56f64] bg-[#fff0ef] text-[#f56f64]' : 'border-[#e7e6e1] bg-white text-[#24234f]'}`} aria-label="Wishlist"><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
              </div>
            ) : inCart ? (
              <div className="flex flex-wrap gap-3">
                <button onClick={openCart} className="ds-button ds-button-primary h-12 flex-1 px-6 text-sm sm:flex-none"><ShoppingBag size={17} /> In cart · View cart</button>
                <button onClick={handleBuyNow} className="ds-button ds-button-ink h-12 px-6 text-sm">Buy now <ArrowRight size={16} /></button>
                <button onClick={handleWishlist} className={`ds-button h-12 w-12 border transition ${heartAnim ? 'scale-[1.4] rotate-3' : ''} ${saved ? 'border-[#f56f64] bg-[#fff0ef] text-[#f56f64]' : 'border-[#e7e6e1] bg-white text-[#24234f]'}`} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button onClick={handleAddToCart} className="ds-button ds-button-primary h-12 flex-1 px-6 text-sm sm:flex-none"><ShoppingBag size={17} /> Add to cart</button>
                <button onClick={handleBuyNow} className="ds-button ds-button-ink h-12 px-6 text-sm">Buy now <ArrowRight size={16} /></button>
                <button onClick={handleWishlist} className={`ds-button h-12 w-12 border transition ${heartAnim ? 'scale-[1.4] rotate-3' : ''} ${saved ? 'border-[#f56f64] bg-[#fff0ef] text-[#f56f64]' : 'border-[#e7e6e1] bg-white text-[#24234f]'}`} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
                {product.type === 'book' && <button onClick={() => setSampleOpen(true)} className="ds-button ds-button-ghost h-12 px-5 text-sm"><Eye size={16} /> Read sample</button>}
              </div>
            )}
            {product.type === 'open-source' && <div className="mt-8 grid grid-cols-3 gap-2">{[['Stars', `${((product.stars || 0) / 1000).toFixed(1)}k`], ['Forks', product.forks?.toLocaleString() || '—'], ['License', product.license || 'MIT']].map(([label,value]) => <div key={label} className="rounded-2xl bg-[#ecebff] p-3"><p className="text-[10px] uppercase tracking-[.12em] text-[#635BFF]">{label}</p><p className="mt-1 font-display text-lg font-bold text-[#24234f]">{value}</p></div>)}</div>}
          </div>
        </div>
        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="flex gap-6 border-b border-[#e7e6e1]">{['About', 'What’s included', 'Reviews'].map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 pb-3 text-sm font-bold ${tab === item ? 'border-[#635BFF] text-[#635BFF]' : 'border-transparent text-[#9b9baa]'}`}>{item}</button>)}</div>
            <div className="py-7">{tab === 'About' && <p className="max-w-2xl text-[15px] leading-7 text-[#6f7184]">{product.description} Designed for people who care about the details.</p>}{tab === 'What’s included' && <ul className="grid max-w-2xl gap-3 sm:grid-cols-2">{product.features.map((f) => <li key={f} className="flex gap-2 text-sm text-[#6f7184]"><Check size={16} className="mt-0.5 shrink-0 text-[#14b8a6]" />{f}</li>)}</ul>}{tab === 'Reviews' && <p className="text-sm text-[#6f7184]">“The kind of product that feels obvious once you have it.”</p>}</div>
          </div>
          <aside className="h-fit rounded-[24px] bg-white p-5"><p className="mb-4 text-[11px] font-bold uppercase tracking-[.15em] text-[#9b9baa]">Product details</p><div className="space-y-4 text-sm">{[['Format', product.type], ['Language', product.language], ['Created by', product.author]].map(([l,v]) => <div key={l} className="flex justify-between gap-3 border-b border-[#f0efeb] pb-3"><span className="text-[#9b9baa]">{l}</span><span className="font-semibold text-[#24234f]">{v}</span></div>)}</div></aside>
        </div>
        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between"><h2 className="font-display text-2xl font-bold text-[#24234f]">More in this corner</h2><Link href={`/shop/${product.type}`} className="ds-button ds-button-ghost h-10 px-4 text-xs">See more <ArrowRight size={14} /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((p) => <ProductCardSmall key={p.id} product={p} />)}</div>
        </section>
      </main>
      {sampleOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24234f]/60 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-[28px] bg-[#f7f6f2] p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#635BFF]">Preview · Chapter one</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.05em] text-[#24234f]">A first, quiet page</h2></div><button onClick={() => setSampleOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#24234f]"><X size={16} /></button></div><div className="mt-6 rounded-2xl bg-white p-6 text-[15px] leading-8 text-[#6f7184]">Sample content — close to see full product after purchase.</div></div></div>}
    </div>
  );
}
