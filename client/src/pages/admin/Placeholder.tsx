export function Placeholder({ title }: { title?: string }) {
  return <div className="p-6 text-center text-sm text-[#6f7184]">Coming soon{title ? ` — ${title}` : ""}</div>;
}
