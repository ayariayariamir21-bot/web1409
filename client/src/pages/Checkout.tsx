import { useEffect, useState } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { ArrowLeft, ArrowRight, Check, Pencil, ShieldCheck, CreditCard, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useCartStore, getCartTotals } from "@/store/cartStore";
import { useLibraryStore } from "@/store/libraryStore";
import { Stepper } from "@/components/Stepper";
import { OrderSummary } from "@/components/OrderSummary";
import { formatCurrency, formatCardNumber, detectCardBrand } from "@/lib/format";
import { formatOrderId } from "@/lib/format";
import { useProductsStore } from "@/store/productsStore";

type ContactData = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  city: string;
  zip: string;
};

type PaymentData = {
  cardNumber: string;
  expiry: string;
  cvc: string;
  nameOnCard: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(d: ContactData): Record<string, string> {
  const e: Record<string, string> = {};
  if (!d.email.trim() || !emailRegex.test(d.email)) e.email = "Valid email required";
  if (!d.firstName.trim()) e.firstName = "Required";
  if (!d.lastName.trim()) e.lastName = "Required";
  if (!d.country.trim()) e.country = "Required";
  if (!d.address.trim()) e.address = "Required";
  if (!d.city.trim()) e.city = "Required";
  if (!d.zip.trim() || !/^\d+$/.test(d.zip.trim())) e.zip = "Numeric ZIP required";
  return e;
}

function validatePayment(d: PaymentData): Record<string, string> {
  const e: Record<string, string> = {};
  const digits = d.cardNumber.replace(/\D/g, "");
  if (digits.length < 13) e.cardNumber = "Enter card number";
  if (!/^\d{2}\/\d{2}$/.test(d.expiry)) e.expiry = "MM/YY required";
  else {
    const [mmStr, yyStr] = d.expiry.split("/");
    const mm = parseInt(mmStr, 10);
    if (mm < 1 || mm > 12) e.expiry = "Invalid month";
  }
  if (!/^\d{3,4}$/.test(d.cvc)) e.cvc = "Invalid CVC";
  if (!d.nameOnCard.trim()) e.nameOnCard = "Required";
  return e;
}

export function CheckoutPage() {
  const [location, navigate] = useLocation();
  const items = useCartStore((s) => s.items);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const clearCart = useCartStore((s) => s.clearCart);
  const addPurchase = useLibraryStore((s) => s.addPurchase);
  const { subtotal, discountAmount, tax, total } = getCartTotals(items, appliedPromo);

  // URL step persistence: ?step=1|2|3
  const params = new URLSearchParams(location.split("?")[1] || "");
  const urlStep = parseInt(params.get("step") || "1", 10);
  const [step, setStep] = useState(() => Math.min(3, Math.max(1, isNaN(urlStep) ? 1 : urlStep)));

  const [contact, setContact] = useState<ContactData>(() => {
    try { return JSON.parse(localStorage.getItem("ds-checkout-contact") || "null") || { email: "", firstName: "", lastName: "", country: "United States", address: "", city: "", zip: "" }; } catch { return { email: "", firstName: "", lastName: "", country: "United States", address: "", city: "", zip: "" }; }
  });
  const [payment, setPayment] = useState<PaymentData>(() => {
    try { return JSON.parse(localStorage.getItem("ds-checkout-payment") || "null") || { cardNumber: "", expiry: "", cvc: "", nameOnCard: "" }; } catch { return { cardNumber: "", expiry: "", cvc: "", nameOnCard: "" }; }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem("ds-checkout-contact", JSON.stringify(contact));
  }, [contact]);
  useEffect(() => {
    localStorage.setItem("ds-checkout-payment", JSON.stringify(payment));
  }, [payment]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    p.set("step", String(step));
    const newUrl = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [step]);

  if (items.length === 0) {
    toast.error("Your cart is empty", { description: "Add something before checkout." });
    return <Redirect to="/cart" />;
  }

  const handleNext = () => {
    if (step === 1) {
      const e = validateContact(contact);
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const e = validatePayment(payment);
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
      setStep(3);
    } else if (step === 3) {
      setProcessing(true);
      const orderId = formatOrderId();
      setTimeout(() => {
        const purchase = {
          id: orderId,
          orderId,
          items: items.map((i) => ({ ...i })),
          date: new Date().toISOString(),
          subtotal,
          discount: discountAmount,
          tax,
          total,
        };
        addPurchase(purchase as any);
        clearCart();
        localStorage.removeItem("ds-checkout-contact");
        localStorage.removeItem("ds-checkout-payment");
        // store last order for success page
        localStorage.setItem("ds-last-order", JSON.stringify(purchase));
        navigate("/checkout/success");
        setProcessing(false);
      }, 900);
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const brand = detectCardBrand(payment.cardNumber);

  return (
    <div className="ds-container max-w-5xl py-10">
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6f7184] hover:text-[#635BFF]">
          <ArrowLeft size={13} /> Back to cart
        </Link>
      </div>
      <div className="mb-8">
        <Stepper steps={["Contact", "Payment", "Review"]} current={step - 1} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="ds-card p-6 sm:p-8">
          {/* Demo banner */}
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-[#f9c74f] bg-[#fffbeb] px-4 py-3 text-xs font-semibold text-[#96720e]">
            <ShieldCheck size={16} className="text-[#f59e0b]" /> This is a demo — no real payment will be charged.
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[#24234f]"><User size={18} className="text-[#635BFF]" /> Contact & Billing</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 block text-xs font-bold text-[#24234f]">
                  Email
                  <input id="checkout-email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@example.com" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] px-3 text-sm font-normal outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10" />
                  {errors.email && <span id="err-email" role="alert" className="text-[11px] font-semibold text-[#f56f64]">{errors.email}</span>}
                </label>
                <label className="block text-xs font-bold text-[#24234f]">First name
                  <input id="checkout-firstName" aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "err-firstName" : undefined} value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] px-3 text-sm font-normal outline-none focus:border-[#635BFF]" />
                  {errors.firstName && <span id="err-firstName" role="alert" className="text-[11px] text-[#f56f64]">{errors.firstName}</span>}
                </label>
                <label className="block text-xs font-bold text-[#24234f]">Last name
                  <input id="checkout-lastName" aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "err-lastName" : undefined} value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] px-3 text-sm font-normal outline-none focus:border-[#635BFF]" />
                  {errors.lastName && <span id="err-lastName" role="alert" className="text-[11px] text-[#f56f64]">{errors.lastName}</span>}
                </label>
                <label className="block text-xs font-bold text-[#24234f]">Country
                  <select value={contact.country} onChange={(e) => setContact({ ...contact, country: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] bg-white px-3 text-sm font-normal outline-none focus:border-[#635BFF]">
                    <option>United States</option><option>United Kingdom</option><option>Canada</option><option>France</option><option>Germany</option><option>Australia</option>
                  </select>
                </label>
                <label className="block text-xs font-bold text-[#24234f]">ZIP
                  <input id="checkout-zip" aria-invalid={!!errors.zip} aria-describedby={errors.zip ? "err-zip" : undefined} value={contact.zip} onChange={(e) => setContact({ ...contact, zip: e.target.value.replace(/\D/g, "") })} placeholder="10001" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] px-3 text-sm font-normal outline-none focus:border-[#635BFF]" />
                  {errors.zip && <span id="err-zip" role="alert" className="text-[11px] text-[#f56f64]">{errors.zip}</span>}
                </label>
                <label className="sm:col-span-2 block text-xs font-bold text-[#24234f]">Address
                  <input id="checkout-address" aria-invalid={!!errors.address} aria-describedby={errors.address ? "err-address" : undefined} value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="123 Market St" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] px-3 text-sm font-normal outline-none focus:border-[#635BFF]" />
                  {errors.address && <span id="err-address" role="alert" className="text-[11px] text-[#f56f64]">{errors.address}</span>}
                </label>
                <label className="sm:col-span-2 block text-xs font-bold text-[#24234f]">City
                  <input id="checkout-city" aria-invalid={!!errors.city} aria-describedby={errors.city ? "err-city" : undefined} value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] px-3 text-sm font-normal outline-none focus:border-[#635BFF]" />
                  {errors.city && <span id="err-city" role="alert" className="text-[11px] text-[#f56f64]">{errors.city}</span>}
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[#24234f]"><CreditCard size={18} className="text-[#635BFF]" /> Payment</h2>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#24234f]">
                  Card number
                  <div className="relative mt-1.5">
                    <input id="checkout-card" aria-invalid={!!errors.cardNumber} aria-describedby={errors.cardNumber ? "err-card" : undefined} value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })} placeholder="4242 4242 4242 4242" maxLength={19} className="h-11 w-full rounded-xl border border-[#e7e6e1] px-3 pr-20 text-sm font-normal outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10" />
                    <span aria-hidden="true" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#f7f6f2] px-2.5 py-1 text-[10px] font-bold uppercase text-[#6f7184]">{brand}</span>
                  </div>
                  {errors.cardNumber && <span id="err-card" role="alert" className="text-[11px] text-[#f56f64]">{errors.cardNumber}</span>}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-xs font-bold text-[#24234f]">Expiry MM/YY
                    <input
                      id="checkout-expiry"
                      aria-invalid={!!errors.expiry}
                      aria-describedby={errors.expiry ? "err-expiry" : undefined}
                      value={payment.expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                        setPayment({ ...payment, expiry: v });
                      }}
                      placeholder="12/28"
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] px-3 text-sm font-normal outline-none focus:border-[#635BFF]"
                    />
                    {errors.expiry && <span id="err-expiry" role="alert" className="text-[11px] text-[#f56f64]">{errors.expiry}</span>}
                  </label>
                  <label className="block text-xs font-bold text-[#24234f]">CVC
                    <input id="checkout-cvc" aria-invalid={!!errors.cvc} aria-describedby={errors.cvc ? "err-cvc" : undefined} value={payment.cvc} onChange={(e) => setPayment({ ...payment, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="123" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] px-3 text-sm font-normal outline-none focus:border-[#635BFF]" />
                    {errors.cvc && <span id="err-cvc" role="alert" className="text-[11px] text-[#f56f64]">{errors.cvc}</span>}
                  </label>
                </div>
                <label className="block text-xs font-bold text-[#24234f]">Name on card
                  <input id="checkout-name" aria-invalid={!!errors.nameOnCard} aria-describedby={errors.nameOnCard ? "err-name" : undefined} value={payment.nameOnCard} onChange={(e) => setPayment({ ...payment, nameOnCard: e.target.value })} placeholder="Alex Morgan" className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e6e1] px-3 text-sm font-normal outline-none focus:border-[#635BFF]" />
                  {errors.nameOnCard && <span id="err-name" role="alert" className="text-[11px] text-[#f56f64]">{errors.nameOnCard}</span>}
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold text-[#24234f]">Review your order</h2>
              <div className="rounded-2xl border border-[#e7e6e1] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-[#24234f]"><MapPin size={14} className="text-[#635BFF]" /> Contact & Billing</h3>
                  <button onClick={() => setStep(1)} aria-label="Edit contact" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f7f6f2] text-[#635BFF] hover:bg-[#635BFF] hover:text-white"><Pencil size={12} /></button>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#6f7184]">{contact.firstName} {contact.lastName}<br />{contact.email}<br />{contact.address}, {contact.city} {contact.zip}<br />{contact.country}</p>
              </div>
              <div className="rounded-2xl border border-[#e7e6e1] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-[#24234f]"><CreditCard size={14} className="text-[#635BFF]" /> Payment</h3>
                  <button onClick={() => setStep(2)} aria-label="Edit payment" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f7f6f2] text-[#635BFF] hover:bg-[#635BFF] hover:text-white"><Pencil size={12} /></button>
                </div>
                <p className="mt-2 text-sm text-[#6f7184]">{payment.cardNumber} · {brand} · {payment.expiry}<br />{payment.nameOnCard}</p>
              </div>
              <div className="space-y-3">
                {items.map((i) => {
                  const p = useProductsStore.getState().getProduct(i.productId);
                  return (
                    <div key={i.productId} className="flex gap-3 rounded-xl bg-[#f7f6f2] p-3">
                      <img src={i.thumbnail} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#24234f]">{i.title}</p>
                        <p className="text-xs text-[#9b9baa]">Qty {i.qty} · {formatCurrency(i.price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button onClick={handleBack} className="ds-button ds-button-ghost h-11 px-5 text-sm">
                <ArrowLeft size={15} /> Back
              </button>
            ) : <span />}
            <button
              onClick={handleNext}
              disabled={processing}
              className="ds-button ds-button-primary h-11 px-6 text-sm disabled:opacity-60"
            >
              {step === 3 ? (processing ? "Processing…" : "Place order") : "Next"} <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="h-fit lg:sticky lg:top-24">
          <div className="ds-card p-5">
            <h3 className="font-display text-base font-bold text-[#24234f]">Order summary</h3>
            <div className="mt-3 space-y-2">
              {items.map((i) => (
                <div key={i.productId} className="flex justify-between text-xs">
                  <span className="text-[#6f7184]">{i.title} × {i.qty}</span>
                  <span className="font-semibold text-[#24234f]">{formatCurrency(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <OrderSummary subtotal={subtotal} discountAmount={discountAmount} tax={tax} total={total} appliedCode={appliedPromo?.code ?? null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
