import { useEffect } from "react";

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This cannot be undone.",
  confirmText = "Delete",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#17172a]/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1e1e2e] dark:border dark:border-gray-800 p-6 shadow-2xl">
        <h2 id="confirm-title" className="font-display text-lg font-bold text-[#24234f] dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-[#6f7184] dark:text-gray-400">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="ds-button ds-button-ghost h-10 px-4 text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="h-10 rounded-full bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
