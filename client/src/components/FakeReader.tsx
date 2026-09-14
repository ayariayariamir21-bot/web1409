import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Props = {
  bookId: string;
  title: string;
  open: boolean;
  onClose: () => void;
};

const DUMMY_PAGES = [
  "Every creative act begins with attention. Before you make anything, notice what is already there — the light on the desk, the half-finished sentence, the question you keep avoiding.",
  "The second page is where most people quit. Not because it is harder, but because it is quiet. Keep going: write one true line, draw one honest shape, ship one small thing.",
  "Page three — a reminder that taste is a skill you build by seeing. Collect what you love without explaining it yet. Let the collection teach you.",
  "Almost done. The habit is not the streak — it is the return. After a break, after a mess, after a day where nothing worked. Come back. That is the whole practice.",
  "Final page. Your progress is saved, your place held. Close the book and make one thing today, even if it is imperfect. Imperfect is how everything good starts.",
];

export function FakeReader({ bookId, title, open, onClose }: Props) {
  const reduced = useReducedMotion();
  const [page, setPage] = useState(() => {
    try {
      const v = localStorage.getItem(`ds-reader:${bookId}`);
      return v ? parseInt(v, 10) : 0;
    } catch { return 0; }
  });

  useEffect(() => {
    try { localStorage.setItem(`ds-reader:${bookId}`, String(page)); } catch {}
  }, [page, bookId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setPage((p) => Math.min(DUMMY_PAGES.length - 1, p + 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(0, p - 1));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-[#17172a]/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={reduced ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-[#f7f6f2] dark:bg-[#232333] dark:border dark:border-gray-800 dark:text-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label={`Reading ${title}`}
        >
          <div className="flex items-center justify-between border-b border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ecebff] text-[#635BFF]"><BookOpen size={14} /></span>
              <div>
                <p className="text-xs font-bold text-[#24234f] dark:text-white">{title}</p>
                <p className="text-[11px] text-[#9b9baa] dark:text-gray-400">Page {page + 1} of {DUMMY_PAGES.length}</p>
              </div>
            </div>
            <button aria-label="Close reader" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f6f2] text-[#24234f] hover:bg-[#24234f] hover:text-white"><X size={14} /></button>
          </div>

          <div className="flex-1 overflow-auto p-8 sm:p-10">
            <div className="mx-auto max-w-prose">
              <p className="font-display text-lg leading-8 text-[#24234f] dark:text-gray-300 sm:text-xl">{DUMMY_PAGES[page]}</p>
              <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-[#e7e6e1]">
                <div className="h-full bg-[#635BFF] transition-all" style={{ width: `${((page + 1) / DUMMY_PAGES.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#e7e6e1] dark:border-gray-800 bg-white dark:bg-[#1e1e2e] px-6 py-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="ds-button ds-button-ghost h-9 px-4 text-xs disabled:opacity-40 dark:border-gray-700 dark:hover:bg-white/5"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-xs font-semibold text-[#9b9baa] dark:text-gray-400">{page + 1} / {DUMMY_PAGES.length}</span>
            <button
              onClick={() => setPage((p) => Math.min(DUMMY_PAGES.length - 1, p + 1))}
              disabled={page === DUMMY_PAGES.length - 1}
              className="ds-button ds-button-ghost h-9 px-4 text-xs disabled:opacity-40 dark:border-gray-700 dark:hover:bg-white/5"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
