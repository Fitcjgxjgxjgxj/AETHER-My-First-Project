import { useEffect, useRef } from "react";
import { FluidUniverse } from "../lib/fluid";
import { detectCapabilities, qualityFor } from "../lib/capabilities";
import { useUniverse } from "../context/UniverseContext";

export function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fluidRef, setReady, hovered } = useUniverse();
  const last = useRef({ x: 0, y: 0, t: 0 });
  const hoverColor = useRef<[number, number, number] | undefined>(undefined);
  hoverColor.current = hovered?.color;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cap = detectCapabilities();
    const q = qualityFor(cap);
    if (!q.fluid) {
      setReady(true);
      return;
    }
    let fluid: FluidUniverse | null = null;
    try {
      fluid = new FluidUniverse(canvas, {
        simResolution: q.sim,
        dyeResolution: q.dye,
        pressureIterations: cap.mobile ? 10 : 18,
      });
      fluidRef.current = fluid;
      fluid.start();
      setReady(true);
    } catch {
      setReady(true);
      return;
    }

    const pointer = (e: PointerEvent, force = false) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const y = 1 - (e.clientY - rect.top) / Math.max(rect.height, 1);
      const now = performance.now();
      const dt = Math.max(now - last.current.t, 8);
      let dx = ((x - last.current.x) / dt) * 9000;
      let dy = ((y - last.current.y) / dt) * 9000;
      if (force) {
        dx = (Math.random() * 2 - 1) * 600;
        dy = (Math.random() * 2 - 1) * 600;
      }
      last.current = { x, y, t: now };
      fluid?.splat(x, y, dx, dy, hoverColor.current);
    };

    const move = (e: PointerEvent) => pointer(e);
    const down = (e: PointerEvent) => pointer(e, true);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });

    const onVis = () => {
      if (fluid) fluid.paused = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.removeEventListener("visibilitychange", onVis);
      fluid?.destroy();
      fluidRef.current = null;
    };
  }, [fluidRef, setReady]);

  useEffect(() => {
    if (hovered) {
      fluidRef.current?.setPalette(hovered.color, [
        hovered.color[2],
        hovered.color[0],
        hovered.color[1],
      ]);
    }
  }, [hovered, fluidRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
