import { useState } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";

export function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // if already logged
  if (typeof window !== "undefined" && localStorage.getItem("ds-admin") === "true") {
    navigate("/admin");
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (email.trim().toLowerCase() === "admin@store.com" && password === "admin123") {
        localStorage.setItem("ds-admin", "true");
        toast.success("Welcome back, admin");
        navigate("/admin");
      } else {
        setError("Invalid email or password. Use admin@store.com / admin123");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2] dark:bg-[#0f0f12] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-[#24234f] dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635BFF] text-white"><Sparkles size={18} /></span>
            digital<span className="text-[#635BFF]">.</span>store
          </Link>
        </div>
        <div className="rounded-[24px] bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-7 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <ShieldCheck size={16} /> This is a demo — no real auth. Use demo credentials.
          </div>
          <h1 className="font-display text-2xl font-bold tracking-[-.04em] text-[#24234f] dark:text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-[#6f7184] dark:text-gray-400">Access the dashboard to manage products.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-xs font-bold text-[#24234f] dark:text-white">
              Email
              <div className="relative mt-1.5">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9baa]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@store.com"
                  className="h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 pl-9 pr-3 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10"
                  aria-label="Email"
                />
              </div>
            </label>
            <label className="block text-xs font-bold text-[#24234f] dark:text-white">
              Password
              <div className="relative mt-1.5">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9baa]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="h-11 w-full rounded-xl border border-[#e7e6e1] dark:border-gray-700 bg-white dark:bg-white/5 pl-9 pr-3 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10"
                  aria-label="Password"
                />
              </div>
            </label>
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="ds-button ds-button-primary h-11 w-full text-sm disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"} <ArrowRight size={15} />
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-[#9b9baa]">
            <Link href="/" className="font-semibold text-[#635BFF] hover:underline">
              ← Back to store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
