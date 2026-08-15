import { Link } from "react-router-dom";
import { BRAND } from "../lib/projects";

const PRINCIPLES = [
  {
    t: "Field over frame",
    d: "Interfaces should behave like weather systems. The site is a simulation you inhabit, not a page you read.",
  },
  {
    t: "Restraint as luxury",
    d: "Black void, one accent, two typefaces. Excess lives in the motion, never in the chrome.",
  },
  {
    t: "Portals, not thumbnails",
    d: "Work is encountered as a rupture in the field — a morphing plane that remembers the fluid it came from.",
  },
  {
    t: "Accessible spectacle",
    d: "Reduced motion, keyboard focus, and honest fallbacks. Beauty that still works when the GPU sleeps.",
  },
];

export function Studio() {
  return (
    <div className="relative z-10 px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[11px] uppercase tracking-[0.36em] text-white/40">
          Studio
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] tracking-tight text-white md:text-7xl">
          A small room for
          <span className="iris-text"> impossible </span>
          brands.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/55">
          {BRAND} is an independent practice. We partner with houses, labs, and
          cultural institutions that want presence — not decoration. Our work
          sits between film, identity, and real-time systems.
        </p>

        <div className="mt-16 overflow-hidden rounded-3xl border border-white/8">
          <img
            src="/posters/studio.jpg"
            alt="A dark studio desk with a glass prism catching teal-violet light."
            className="aspect-[21/9] w-full object-cover"
          />
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.t} className="border-t border-white/8 pt-6">
              <h2 className="font-display text-2xl text-white">{p.t}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
                {p.d}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">
              Principals
            </p>
            <p className="mt-3 text-white/70">I. Vale · N. Sol</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">
              Stack
            </p>
            <p className="mt-3 text-white/70">
              Three.js · WebGL2 fluid · GSAP · React
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">
              Availability
            </p>
            <p className="mt-3 text-white/70">Select commissions, 2026</p>
            <Link
              to="/contact"
              className="mt-4 inline-block text-[11px] uppercase tracking-[0.28em] text-white/50 hover:text-white"
            >
              Open a channel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
