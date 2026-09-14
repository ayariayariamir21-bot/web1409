export function EmptyIllustration({ type = "cart" }: { type?: "cart" | "wishlist" | "library" | "search" }) {
  if (type === "search") {
    return (
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" aria-hidden="true" className="mx-auto">
        <circle cx="48" cy="38" r="22" stroke="#e7e6e1" strokeWidth="2.5" />
        <line x1="64" y1="54" x2="84" y2="74" stroke="#e7e6e1" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="48" cy="38" r="6" fill="#ecebff" />
      </svg>
    );
  }
  if (type === "wishlist") {
    return (
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" aria-hidden="true" className="mx-auto">
        <path d="M60 78 L20 40 C12 30 15 16 28 12 C36 9 44 14 60 28 C76 14 84 9 92 12 C105 16 108 30 100 40 L60 78Z" fill="#fff0ef" stroke="#f56f64" strokeWidth="1.8" />
        <circle cx="60" cy="45" r="3" fill="#f56f64" />
      </svg>
    );
  }
  if (type === "library") {
    return (
      <svg width="140" height="90" viewBox="0 0 140 90" fill="none" aria-hidden="true" className="mx-auto">
        <rect x="10" y="18" width="38" height="56" rx="6" fill="#ecebff" stroke="#635BFF" strokeWidth="1.5" />
        <rect x="52" y="18" width="38" height="56" rx="6" fill="#f6ffdf" stroke="#d9f99d" strokeWidth="1.5" />
        <rect x="94" y="18" width="38" height="56" rx="6" fill="#fff1be" stroke="#f9c74f" strokeWidth="1.5" />
        <line x1="20" y1="38" x2="38" y2="38" stroke="#635BFF" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="20" y1="46" x2="32" y2="46" stroke="#635BFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg width="120" height="90" viewBox="0 0 120 90" fill="none" aria-hidden="true" className="mx-auto">
      <path d="M24 24 H96 L88 72 H32 L24 24Z" fill="#f7f6f2" stroke="#e7e6e1" strokeWidth="1.8" />
      <path d="M28 32 H92" stroke="#ecebff" strokeWidth="1.5" />
      <circle cx="46" cy="52" r="6" fill="#ecebff" />
      <circle cx="74" cy="52" r="6" fill="#d9f99d" />
      <path d="M36 72 L44 80 H84 L92 72" stroke="#e7e6e1" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
