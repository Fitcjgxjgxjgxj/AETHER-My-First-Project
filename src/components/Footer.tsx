import { Link } from "react-router-dom";
import { BRAND } from "../lib/projects";

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/8 px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-[11px] tracking-[0.42em] text-white/70">
            {BRAND}
          </p>
          <p className="mt-3 max-w-sm font-serif text-xl italic text-white/55">
            Form from the formless.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.24em] text-white/40">
          <Link to="/work" className="hover:text-white">
            Work
          </Link>
          <Link to="/studio" className="hover:text-white">
            Studio
          </Link>
          <Link to="/contact" className="hover:text-white">
            Signal
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
