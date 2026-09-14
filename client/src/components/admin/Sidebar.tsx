import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Download,
  Star,
  Ticket,
  BarChart3,
  CreditCard,
  Shield,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useOrdersStore } from "@/store/ordersStore";
import { useReviewsStore } from "@/store/reviewsStore";

export type SidebarItem = {
  label: string;
  href: string;
  icon: any;
};

export const adminNav: SidebarItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Downloads", href: "/admin/downloads", icon: Download },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Admin Users", href: "/admin/users", icon: Shield },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
  onCloseMobile,
  mobileOpen,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onCloseMobile?: () => void;
  mobileOpen?: boolean;
}) {
  const [location] = useLocation();
  const pendingOrders = useOrdersStore((s) => s.orders.filter((o) => o.status === "pending").length);
  const pendingReviews = useReviewsStore((s) => s.reviews.filter((r) => r.status === "pending").length);
  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin" || location === "/admin/";
    return location.startsWith(href);
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-[64px] items-center gap-2 border-b border-[#e7e6e1] dark:border-gray-800 px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#635BFF] text-white">
          <Sparkles size={16} />
        </span>
        {!collapsed && <span className="font-display text-sm font-bold tracking-[-.04em] text-[#24234f] dark:text-white">digital<span className="text-[#635BFF]">.</span>store</span>}
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          className="ml-auto hidden h-8 w-8 items-center justify-center rounded-lg text-[#6f7184] hover:bg-[#f7f6f2] dark:hover:bg-white/5 lg:flex"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {adminNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-[#635BFF] text-white shadow-[0_8px_16px_rgba(99,91,255,.22)]"
                  : "text-[#6f7184] dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 hover:text-[#24234f] dark:hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <item.icon size={18} className={active ? "text-white" : ""} />
              {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              {!collapsed && item.href === "/admin/orders" && pendingOrders > 0 && <span className="ml-auto rounded-full bg-amber-500 text-white px-1.5 py-0.5 text-[10px] font-bold">{pendingOrders}</span>}
              {!collapsed && item.href === "/admin/reviews" && pendingReviews > 0 && <span className="ml-auto rounded-full bg-amber-500 text-white px-1.5 py-0.5 text-[10px] font-bold">{pendingReviews}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[#e7e6e1] dark:border-gray-800">
        {!collapsed && <p className="px-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#9b9baa]">Admin</p>}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className={`hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-[#e7e6e1] dark:lg:border-gray-800 bg-white dark:bg-[#1e1e2e] transition-all ${collapsed ? "lg:w-[72px]" : "lg:w-[240px]"}`}>{content}</aside>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-[#17172a]/40 backdrop-blur-[2px]" onClick={onCloseMobile} aria-hidden="true" />
          <div className="relative w-[280px] bg-white dark:bg-[#1e1e2e] shadow-xl">{content}</div>
        </div>
      )}
    </>
  );
}
