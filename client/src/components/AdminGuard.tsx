import { Redirect } from "wouter";
import type { ReactNode } from "react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const isAdmin = typeof window !== "undefined" && localStorage.getItem("ds-admin") === "true";
  if (!isAdmin) return <Redirect to="/admin/login" />;
  return <>{children}</>;
}
