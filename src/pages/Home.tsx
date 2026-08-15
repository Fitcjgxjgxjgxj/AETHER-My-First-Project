import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { BRAND, PROJECTS, TAGLINE } from "../lib/projects";
import { useUniverse } from "../context/UniverseContext";

export function Home() {
  const { setHovered, pulse } = useUniverse();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 40, opacity: 0, letterSpacing: "0.4em" },
        { y: 0, opacity: 1, letterSpacing: "0.08em", duration: 1.6, ease: "power4.out", delay: 0.2 },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative z-10">
      <section className="flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-20">
        <div className="mx-auto w-full max-w-[1400px]">
          <p className="mb-6 text-[11px] uppercase tracking-[0.42em] text-white/45">
            Independent studio · New York / Remote
          </p>
          <h1
            ref={titleRef}
            className="font-display text-[18vw] font-medium leading-[0.82] tracking-tight text-white md:text-[11vw]"
          >
            {BRAND}
          </h1>
          <div className="mt-8 flex max-w-2xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="font-serif text-2xl italic text-white/70 md:text-3xl">
              {TAGLINE}
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-white/50">
              A living field of fluid, light, and signal. We design identities
              that behave like weather — premium, abstract, and slightly
              unstable.
            </p>
          </div>
        </div>
      </section>

      <section id="work" className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.36em] text-white/40">
              Selected portals
            </h2>
            <Link
              to="/work"
              className="text-[11px] uppercase tracking-[0.28em] text-white/55 hover:text-white"
            >
              All work
            </Link>
          </div>

          <ul className="divide-y divide-white/8 border-y border-white/8">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/work/${p.id}`}
                  onMouseEnter={() => {
                    setHovered(p);
                    pulse(p.color);
                  }}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => {
                    setHovered(p);
                    pulse(p.color);
                  }}
                  onBlur={() => setHovered(null)}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 md:grid-cols-[72px_1fr_220px_140px_88px] md:py-8"
                >
                  <span className="font-sans text-[11px] tracking-[0.24em] text-white/30">
                    {p.index}
                  </span>
                  <span className="font-display text-3xl tracking-tight text-white transition-transform duration-500 group-hover:translate-x-2 md:text-5xl">
                    {p.title}
                  </span>
                  <span className="hidden text-[11px] uppercase tracking-[0.22em] text-white/40 md:block">
                    {p.client}
                  </span>
                  <span className="hidden text-right text-[11px] uppercase tracking-[0.22em] text-white/30 md:block">
                    {p.year}
                  </span>
                  <span className="relative ml-auto h-12 w-20 overflow-hidden rounded-md border border-white/10 opacity-70 md:opacity-0 md:transition md:duration-500 md:group-hover:opacity-100">
                    <img src={p.webp} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="sr-only">
                    Open {p.title}. {p.synopsis}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-28 md:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.36em] text-white/40">
              Practice
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-white md:text-6xl">
              Generative art
              <span className="iris-text"> first.</span>
              <br />
              Website second.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="text-base leading-relaxed text-white/55 md:text-lg">
              {BRAND} is a small studio for brands that refuse to sit still. We
              build systems — film, type, spatial, and software — that remain
              slightly alive. Every engagement begins as a simulation and ends
              as a world you can walk through.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6 text-sm text-white/50">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/30">
                  Disciplines
                </p>
                <p className="mt-3 leading-7">
                  Identity
                  <br />
                  Motion
                  <br />
                  Spatial
                  <br />
                  Digital
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/30">
                  Selected
                </p>
                <p className="mt-3 leading-7">
                  Maison Vesper
                  <br />
                  Helion Systems
                  <br />
                  Orion Drive
                  <br />
                  Kite Bio
                </p>
              </div>
            </div>
            <Link
              to="/studio"
              className="mt-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/70 hover:text-white"
            >
              The studio
              <span className="iris h-px w-10" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
