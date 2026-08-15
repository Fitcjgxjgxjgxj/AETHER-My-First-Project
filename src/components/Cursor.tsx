import { useEffect, useRef } from "react";
import { detectCapabilities } from "../lib/capabilities";

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cap = detectCapabilities();
    if (cap.coarsePointer) return;
    document.body.classList.add("is-pointer");
    const r = ring.current;
    const d = dot.current;
    if (!r || !d) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      d.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
    };
    const down = () => r.classList.add("scale-75");
    const up = () => r.classList.remove("scale-75");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      r.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
    };
    loop();
    return () => {
      document.body.classList.remove("is-pointer");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-9 w-9 rounded-full border border-white/40 mix-blend-difference md:block"
      />
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-1.5 w-1.5 rounded-full bg-white mix-blend-difference md:block"
      />
    </>
  );
}
