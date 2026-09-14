import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Plus, X } from "lucide-react";
import { useProductsStore, type AdminProduct } from "@/store/productsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type Props = { id?: string };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const categories = ["Software", "Websites", "Open Source", "Online Books", "Kids Room", "Student Courses"];
const types: AdminProduct["type"][] = ["software", "website", "open-source", "book", "course", "kids"];

export function ProductForm({ id }: Props) {
  const [, navigate] = useLocation();
  const products = useProductsStore((s) => s.products);
  const addProduct = useProductsStore((s) => s.addProduct);
  const updateProduct = useProductsStore((s) => s.updateProduct);
  const deleteProduct = useProductsStore((s) => s.deleteProduct);
  const existing = id ? products.find((p) => p.id === id) : undefined;

  const [loading, setLoading] = useState(!!id);
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [id]);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState(existing?.description ?? "");
  const [price, setPrice] = useState(String(existing?.price ?? ""));
  const [oldPrice, setOldPrice] = useState(String(existing?.oldPrice ?? ""));
  const [isFree, setIsFree] = useState(existing?.isFree ?? false);
  const [thumbnail, setThumbnail] = useState(existing?.thumbnail ?? "");
  const [gallery, setGallery] = useState<string[]>(existing?.gallery ?? [""]);
  const [category, setCategory] = useState(existing?.category ?? "Software");
  const [type, setType] = useState<AdminProduct["type"]>(existing?.type ?? "software");
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [author, setAuthor] = useState(existing?.author ?? "");
  const [language, setLanguage] = useState(existing?.language ?? "English");
  const [isFeatured, setIsFeatured] = useState(existing?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);

  // type-specific
  const [version, setVersion] = useState(existing?.version ?? "");
  const [duration, setDuration] = useState(existing?.duration ?? "");
  const [lessons, setLessons] = useState(String(existing?.lessons ?? ""));
  const [level, setLevel] = useState(existing?.level ?? "Beginner");
  const [pages, setPages] = useState(String(existing?.pages ?? ""));
  const [ageRange, setAgeRange] = useState(existing?.ageRange ?? "6-8");
  const [stars, setStars] = useState(String(existing?.stars ?? ""));
  const [forks, setForks] = useState(String(existing?.forks ?? ""));
  const [license, setLicense] = useState(existing?.license ?? "MIT");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!slugEdited && title) setSlug(slugify(title));
  }, [title, slugEdited]);

  useEffect(() => {
    if (isFree) setPrice("0");
  }, [isFree]);

  const discount = useMemo(() => {
    const p = Number(price);
    const o = Number(oldPrice);
    if (!o || !p || o <= p) return null;
    return Math.round(((o - p) / o) * 100);
  }, [price, oldPrice]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (price === "" || isNaN(Number(price)) || Number(price) < 0) e.price = "Price must be >= 0";
    if (!category) e.category = "Required";
    if (!type) e.type = "Required";
    const checkSlug = slug.trim();
    if (!checkSlug) e.slug = "Slug required";
    else if (products.some((p) => p.slug === checkSlug && p.id !== id)) e.slug = "Slug must be unique";
    if (!author.trim()) e.author = "Author required";
    return e;
  };

  const isValid = Object.keys(validate()).length === 0;

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const base: any = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || "No description",
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      category,
      type,
      tags: tags.length ? tags : ["general"],
      author: author.trim(),
      language,
      thumbnail: thumbnail.trim() || `https://picsum.photos/seed/${slug || "new"}/400/300`,
      gallery: gallery.filter(Boolean),
      isFree,
      isFeatured,
      isActive,
      accent: existing?.accent ?? "#635BFF",
      rating: existing?.rating ?? 4.5,
      reviewsCount: existing?.reviewsCount ?? 0,
      createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
    };
    // type-specific
    if (type === "software") base.version = version || "1.0.0";
    if (type === "course") {
      base.duration = duration || "6h 00m";
      base.lessons = lessons ? Number(lessons) : 12;
      base.level = level;
    }
    if (type === "book") base.pages = pages ? Number(pages) : 120;
    if (type === "kids") base.ageRange = ageRange;
    if (type === "open-source") {
      base.stars = stars ? Number(stars) : 0;
      base.forks = forks ? Number(forks) : 0;
      base.license = license;
    }

    if (id && existing) {
      updateProduct(id, base);
      toast.success("Product updated");
    } else {
      addProduct(base);
      toast.success("Product created");
    }
    navigate("/admin/products");
  };

  const handleDelete = () => {
    if (!id) return;
    deleteProduct(id);
    toast.success("Product deleted");
    navigate("/admin/products");
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-10 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (id && !existing) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-[#6f7184]">Product not found.</p>
        <Link href="/admin/products" className="mt-4 inline-block text-sm font-bold text-[#635BFF]">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-[#24234f] dark:text-white">{id ? "Edit product" : "New product"}</h1>
          <p className="text-xs text-[#6f7184] dark:text-gray-400">{id ? `Editing ${existing?.id}` : "Create a new product"}</p>
        </div>
      </div>

      {/* Basics */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Basics</h3>
        <label className="block text-xs font-bold text-[#24234f] dark:text-white">
          Title *
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none focus:border-[#635BFF]" aria-invalid={!!errors.title} />
          {errors.title && <span className="text-[11px] text-red-600">{errors.title}</span>}
        </label>
        <label className="block text-xs font-bold text-[#24234f] dark:text-white">
          Slug *
          <input value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); }} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none focus:border-[#635BFF]" aria-invalid={!!errors.slug} />
          {errors.slug && <span className="text-[11px] text-red-600">{errors.slug}</span>}
          <p className="mt-1 text-[11px] text-[#9b9baa]">Auto from title, editable. Must be unique.</p>
        </label>
        <label className="block text-xs font-bold text-[#24234f] dark:text-white">
          Short description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 p-3 text-sm outline-none focus:border-[#635BFF]" />
        </label>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Pricing</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-[#24234f] dark:text-white">
            Price *
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} disabled={isFree} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none disabled:opacity-50" aria-invalid={!!errors.price} />
            {errors.price && <span className="text-[11px] text-red-600">{errors.price}</span>}
          </label>
          <label className="block text-xs font-bold text-[#24234f] dark:text-white">
            Old price (optional)
            <input type="number" min={0} value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
            {discount !== null && <span className="text-[11px] text-emerald-600">Discount {discount}%</span>}
          </label>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-[#24234f] dark:text-white">
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
          Free product
        </label>
      </div>

      {/* Media */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Media</h3>
        <label className="block text-xs font-bold text-[#24234f] dark:text-white">
          Thumbnail URL
          <input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://..." className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
        </label>
        <div>
          <p className="text-xs font-bold text-[#24234f] dark:text-white">Gallery URLs</p>
          <p className="text-[11px] text-[#9b9baa]">Add or remove rows.</p>
          <div className="mt-2 space-y-2">
            {gallery.map((g, i) => (
              <div key={i} className="flex gap-2">
                <input value={g} onChange={(e) => setGallery((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))} placeholder="https://..." className="h-10 flex-1 rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
                <button onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 text-red-600" aria-label="Remove gallery row">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => setGallery((p) => [...p, ""])} className="flex items-center gap-1 text-xs font-bold text-[#635BFF]">
              <Plus size={14} /> Add row
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-[#24234f] dark:text-white">
            Category *
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm" aria-invalid={!!errors.category}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold text-[#24234f] dark:text-white">
            Type *
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm" aria-invalid={!!errors.type}>
              {types.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-xs font-bold text-[#24234f] dark:text-white">
          Author *
          <input value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" aria-invalid={!!errors.author} />
          {errors.author && <span className="text-[11px] text-red-600">{errors.author}</span>}
        </label>
        <label className="block text-xs font-bold text-[#24234f] dark:text-white">
          Language
          <input value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
        </label>
        <div>
          <p className="text-xs font-bold text-[#24234f] dark:text-white">Tags</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#ecebff] dark:bg-white/10 px-3 py-1 text-xs font-semibold text-[#635BFF] dark:text-white">
                {t}
                <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); if (!tags.includes(tagInput.trim().toLowerCase())) setTags([...tags, tagInput.trim().toLowerCase()]); setTagInput(""); }}} placeholder="Add tag + Enter" className="h-10 flex-1 rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
            <button onClick={() => { if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) setTags([...tags, tagInput.trim().toLowerCase()]); setTagInput(""); }} className="h-10 rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-4 text-xs font-bold">Add</button>
          </div>
        </div>
      </div>

      {/* Type-specific */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Type-specific fields</h3>
        {type === "software" && (
          <label className="block text-xs font-bold text-[#24234f] dark:text-white">
            Version
            <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
          </label>
        )}
        {type === "course" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-bold text-[#24234f] dark:text-white">
              Duration
              <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="6h 00m" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
            </label>
            <label className="block text-xs font-bold text-[#24234f] dark:text-white">
              Lessons
              <input type="number" value={lessons} onChange={(e) => setLessons(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
            </label>
            <label className="block text-xs font-bold text-[#24234f] dark:text-white">
              Level
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>All levels</option>
              </select>
            </label>
          </div>
        )}
        {type === "book" && (
          <label className="block text-xs font-bold text-[#24234f] dark:text-white">
            Pages
            <input type="number" value={pages} onChange={(e) => setPages(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
          </label>
        )}
        {type === "kids" && (
          <label className="block text-xs font-bold text-[#24234f] dark:text-white">
            Age range
            <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm">
              <option value="3-5">3-5</option>
              <option value="6-8">6-8</option>
              <option value="9-12">9-12</option>
            </select>
          </label>
        )}
        {type === "open-source" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-bold text-[#24234f] dark:text-white">
              Stars
              <input type="number" value={stars} onChange={(e) => setStars(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
            </label>
            <label className="block text-xs font-bold text-[#24234f] dark:text-white">
              Forks
              <input type="number" value={forks} onChange={(e) => setForks(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm outline-none" />
            </label>
            <label className="block text-xs font-bold text-[#24234f] dark:text-white">
              License
              <select value={license} onChange={(e) => setLicense(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 px-3 text-sm">
                <option>MIT</option>
                <option>Apache-2.0</option>
                <option>GPL</option>
              </select>
            </label>
          </div>
        )}
        {type !== "software" && type !== "course" && type !== "book" && type !== "kids" && type !== "open-source" && <p className="text-xs text-[#9b9baa]">No extra fields for this type.</p>}
      </div>

      {/* Meta */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#24234f] dark:text-white">Meta</h3>
        <label className="flex items-center gap-2 text-xs font-bold text-[#24234f] dark:text-white">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-[#24234f] dark:text-white">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active (visible in store)
        </label>
        {id && <p className="text-xs text-[#9b9baa]">Created: {existing?.createdAt}</p>}
      </div>

      <div className="flex justify-between gap-3">
        <div className="flex gap-2">
          <Link href="/admin/products" className="ds-button ds-button-ghost h-11 px-5 text-sm">
            Cancel
          </Link>
          {id && (
            <button onClick={() => setConfirmDelete(true)} className="h-11 rounded-full bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700 flex items-center gap-1">
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
        <button onClick={handleSave} disabled={!isValid} className="ds-button ds-button-primary h-11 px-6 text-sm disabled:opacity-50">
          Save
        </button>
      </div>

      <ConfirmDialog open={confirmDelete} title="Delete product?" description="This cannot be undone." onConfirm={handleDelete} onClose={() => setConfirmDelete(false)} />
    </div>
  );
}
