import { Link } from "react-router-dom";
import { PROJECTS } from "../lib/projects";
import { useUniverse } from "../context/UniverseContext";

export function Work() {
  const { setHovered, pulse } = useUniverse();

  return (
    <div className="relative z-10 px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[11px] uppercase tracking-[0.36em] text-white/40">
          Archive
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-white md:text-7xl">
          Eight portals.
        </h1>
        <p className="mt-5 max-w-xl font-serif text-xl italic text-white/55">
          Hover to wake the field. Enter to step through.
        </p>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {PROJECTS.map((p) => (
            <Link
              key={p.id}
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
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/2"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <picture>
                  <source srcSet={p.webp} type="image/webp" />
                  <img
                    src={p.poster}
                    alt=""
                    className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                    {p.index} · {p.discipline}
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-white md:text-3xl">
                    {p.title}
                  </h2>
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                  {p.year}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
