import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { FluidUniverse } from "../lib/fluid";
import type { Project } from "../lib/projects";

type UniverseApi = {
  ready: boolean;
  setReady: (v: boolean) => void;
  hovered: Project | null;
  setHovered: (p: Project | null) => void;
  active: Project | null;
  setActive: (p: Project | null) => void;
  fluidRef: MutableRefObject<FluidUniverse | null>;
  splatAt: (
    x: number,
    y: number,
    dx: number,
    dy: number,
    color?: [number, number, number],
  ) => void;
  pulse: (color: [number, number, number]) => void;
};

const Ctx = createContext<UniverseApi | null>(null);

export function UniverseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<Project | null>(null);
  const [active, setActive] = useState<Project | null>(null);
  const fluidRef = useRef<FluidUniverse | null>(null);

  const api = useMemo<UniverseApi>(
    () => ({
      ready,
      setReady,
      hovered,
      setHovered,
      active,
      setActive,
      fluidRef,
      splatAt: (x, y, dx, dy, color) => {
        fluidRef.current?.splat(x, y, dx, dy, color);
      },
      pulse: (color) => {
        const f = fluidRef.current;
        if (!f) return;
        for (let i = 0; i < 6; i++) {
          f.splat(
            0.35 + Math.random() * 0.45,
            0.25 + Math.random() * 0.5,
            (Math.random() * 2 - 1) * 1400,
            (Math.random() * 2 - 1) * 900,
            color,
          );
        }
        f.setPalette(color, [color[2], color[0], color[1]]);
      },
    }),
    [ready, hovered, active],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useUniverse() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("UniverseProvider missing");
  return ctx;
}
