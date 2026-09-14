import type { ReactNode } from "react";

export function DataTable({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="overflow-auto rounded-2xl border border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e]">
      {children}
    </div>
  );
}
