import { FormEvent, useState } from "react";
import { useUniverse } from "../context/UniverseContext";

export function Contact() {
  const [sent, setSent] = useState(false);
  const { pulse } = useUniverse();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    pulse([0.37, 0.92, 0.83]);
  };

  return (
    <div className="relative z-10 px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.36em] text-white/40">
            Signal
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-tight text-white md:text-7xl">
            Disturb the field.
          </h1>
          <p className="mt-6 font-serif text-xl italic text-white/55">
            Briefs, collaborations, and quiet inquiries.
          </p>
          <p className="mt-8 text-sm leading-relaxed text-white/45">
            studio@aether.world
            <br />
            +1 212 555 0148
            <br />
            Hudson Yards, New York
          </p>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          {sent ? (
            <div className="glass rounded-3xl p-8">
              <p className="font-display text-3xl text-white">Received.</p>
              <p className="mt-3 text-white/50">
                The field has your coordinates. We reply within two rotations.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                  Name
                </span>
                <input
                  required
                  name="name"
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-white outline-none focus:border-teal-300"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                  Email
                </span>
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-white outline-none focus:border-teal-300"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                  Transmission
                </span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  className="mt-2 w-full resize-none border-b border-white/15 bg-transparent py-3 text-white outline-none focus:border-teal-300"
                />
              </label>
              <button
                type="submit"
                className="iris mt-4 inline-flex items-center rounded-full px-7 py-3 text-[11px] uppercase tracking-[0.28em] text-[#050508]"
              >
                Send signal
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
