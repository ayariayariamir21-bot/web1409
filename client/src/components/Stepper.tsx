import { Check } from "lucide-react";

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className={`flex items-center gap-2 ${i <= current ? "text-[#635BFF]" : "text-[#9b9baa]"}`}>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                i < current
                  ? "bg-[#d9f99d] text-[#24234f]"
                  : i === current
                    ? "bg-[#635BFF] text-white"
                    : "bg-white dark:bg-white/5 border border-[#e7e6e1] dark:border-gray-700 text-[#9b9baa] dark:text-gray-400"
              }`}
              aria-current={i === current ? "step" : undefined}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </span>
            <span className="hidden sm:inline text-xs font-bold">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-3 h-0.5 w-8 sm:w-12 rounded-full transition ${i < current ? "bg-[#d9f99d]" : i === current ? "bg-[#635BFF]/30" : "bg-[#e7e6e1] dark:bg-gray-700"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
