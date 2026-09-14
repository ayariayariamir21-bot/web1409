export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPrice(price: number): string {
  return price === 0 ? "Free" : currencyFormatter.format(price);
}

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDate(date: string | number | Date): string {
  return dateFormatter.format(new Date(date));
}

export function formatOrderId(date = new Date(), random?: string): string {
  const year = date.getFullYear();
  const suffix =
    random ??
    Math.floor(1000 + Math.random() * 9000)
      .toString()
      .padStart(4, "0");
  return `DS-${year}-${suffix}`;
}

export function generateLicenseKey(): string {
  const seg = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "X");
  return `${seg()}-${seg()}-${seg()}-${seg()}`;
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function detectCardBrand(number: string): "visa" | "mastercard" | "amex" | "unknown" {
  const digits = number.replace(/\D/g, "");
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return "unknown";
}
