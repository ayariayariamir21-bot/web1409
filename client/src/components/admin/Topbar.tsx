import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Moon, Sun, Menu, LogOut, Store } from "lucide-react";
import { toast } from "sonner";

export function Topbar({
  onMenu,
  theme,
  toggleTheme,
}: {
  onMenu: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const [, navigate] = useLocation();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("ds-admin");
    toast.success("Logged out");
    navigate("/admin/login");
  };

  return (
    <div className="sticky top-0 z-10 flex h-[64px] items-center gap-3 border-b border-[#e7e6e1] dark:border-gray-800 bg-white/80 dark:bg-[#1e1e2e]/80 backdrop-blur-xl px-4">
      <button
        aria-label="Open sidebar"
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 text-[#24234f] dark:text-white lg:hidden"
      >
        <Menu size={18} />
      </button>
      <div className="relative hidden sm:block flex-1 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9baa]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (visual only)"
          aria-label="Search admin"
          className="h-9 w-full rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-[#f7f6f2] dark:bg-white/5 pl-9 pr-3 text-sm outline-none focus:border-[#635BFF]"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 text-[#6f7184] dark:text-gray-400"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Admin menu"
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#635BFF] text-white font-bold text-sm"
          >
            A
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-[#1e1e2e] p-2 shadow-xl">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#24234f] dark:text-white hover:bg-[#f7f6f2] dark:hover:bg-white/5">
                <Store size={14} /> View store
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
