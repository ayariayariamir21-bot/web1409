import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  positive,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  spark?: number[];
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#9b9baa] dark:text-gray-400">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tracking-[-.04em] text-[#24234f] dark:text-white tabular-nums">{value}</p>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
            positive === false ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {positive === false ? <TrendingDown size={12} /> : <TrendingUp size={12} />} {delta}
        </span>
        <span className="text-[11px] text-[#9b9baa]">vs last month</span>
      </div>
      {spark && (
        <div className="mt-4 flex items-end gap-[2px] h-8">
          {spark.map((v, i) => (
            <div key={i} className="flex-1 rounded-full bg-[#635BFF]/20 dark:bg-[#635BFF]/30" style={{ height: `${Math.max(12, v)}%` }} />
          ))}
        </div>
      )}
    </div>
  );
}
