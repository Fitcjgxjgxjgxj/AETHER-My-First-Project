import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND } from "../lib/projects";

export function Loader({ ready }: { ready: boolean }) {
  const [gone, setGone] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPct((p) => {
        if (ready) return Math.min(p + 7, 100);
        return p < 86 ? p + Math.random() * 4 : p;
      });
    }, 70);
    return () => window.clearInterval(id);
  }, [ready]);

  useEffect(() => {
    if (ready && pct >= 100) {
      const t = window.setTimeout(() => setGone(true), 480);
      return () => window.clearTimeout(t);
    }
  }, [ready, pct]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#050508]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          aria-label="Loading experience"
        >
          <div className="mb-10 h-16 w-16 overflow-hidden">
            <img
              src="/brand/mark.png"
              alt=""
              className="h-full w-full object-contain opacity-90"
            />
          </div>
          <p className="font-display text-[11px] tracking-[0.55em] text-white/70">
            {BRAND}
          </p>
          <div className="mt-10 h-px w-40 overflow-hidden bg-white/10">
            <motion.div
              className="iris h-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 font-sans text-[10px] tracking-[0.32em] text-white/35">
            {String(Math.floor(pct)).padStart(2, "0")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
