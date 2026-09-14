import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

function useAdminTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const v = localStorage.getItem("ds-theme");
      return v ? JSON.parse(v) : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    localStorage.setItem("ds-theme", JSON.stringify(theme));
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return { theme, toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useAdminTheme();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("ds-admin-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("ds-admin-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-[#f7f6f2] dark:bg-[#0f0f12] flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setMobileOpen(true)} theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
