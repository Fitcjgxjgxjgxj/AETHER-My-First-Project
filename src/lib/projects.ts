export type Project = {
  id: string;
  index: string;
  title: string;
  year: string;
  client: string;
  discipline: string;
  duration: string;
  aspect: "16:9" | "1:1";
  prompt: string;
  synopsis: string;
  body: string;
  video?: string;
  poster: string;
  fallback: string;
  webp: string;
  color: [number, number, number];
  accent: string;
};

export const BRAND = "AETHER";
export const TAGLINE = "Form from the formless.";

export const PROJECTS: Project[] = [
  {
    id: "chromatic-drift",
    index: "01",
    title: "Chromatic Drift",
    year: "2025",
    client: "Maison Vesper",
    discipline: "Identity / Film",
    duration: "00:10",
    aspect: "16:9",
    prompt:
      "Macro liquid-metal surface folding into oil-slick iridescence. Teal to violet caustics, no text, cinematic lighting, seamless loop.",
    synopsis: "A couture house recast as a living alloy. Identity as weather.",
    body: "We rebuilt Maison Vesper’s visual language as a field of molten chrome. Campaign films, spatial installations, and a generative mark that never settles into a single state. The work is less a logo than a climate.",
    video: "/videos/chromatic-drift.mp4",
    poster: "/posters/chromatic-drift.jpg",
    fallback: "/fallbacks/chromatic-drift.json",
    webp: "/webp/chromatic-drift.webp",
    color: [0.22, 0.95, 0.82],
    accent: "#5eead4",
  },
  {
    id: "void-lattice",
    index: "02",
    title: "Void Lattice",
    year: "2025",
    client: "Helion Systems",
    discipline: "Product / Spatial",
    duration: "00:07",
    aspect: "16:9",
    prompt:
      "Dark geometric lattice of glowing particles and neon filaments. Teal-violet nodes in a black void, photoreal, no logos.",
    synopsis: "An operating system for silence. Architecture made of signals.",
    body: "Helion asked for a presence that felt inevitable. We designed a particle grammar for their hardware unveil — a lattice that maps compute as constellation, then dissolves on contact.",
    video: "/videos/void-lattice.mp4",
    poster: "/posters/void-lattice.jpg",
    fallback: "/fallbacks/void-lattice.json",
    webp: "/webp/void-lattice.webp",
    color: [0.5, 0.45, 0.98],
    accent: "#818cf8",
  },
  {
    id: "aurora-protocol",
    index: "03",
    title: "Aurora Protocol",
    year: "2024",
    client: "Northline",
    discipline: "Brand / Motion",
    duration: "00:11",
    aspect: "16:9",
    prompt:
      "Abstract aurora of teal and violet plasma ribbons in deep space. Volumetric light, no landscape, no text, luxury cinematic still-in-motion.",
    synopsis: "A polar expedition brand written in charged air.",
    body: "Northline’s protocol is a pact with weather. We translated ionospheric data into a living aurora — used across film titles, wayfinding, and a night-only retail environment.",
    video: "/videos/aurora-protocol.mp4",
    poster: "/posters/aurora-protocol.jpg",
    fallback: "/fallbacks/aurora-protocol.json",
    webp: "/webp/aurora-protocol.webp",
    color: [0.28, 0.86, 0.78],
    accent: "#2dd4bf",
  },
  {
    id: "prism-collapse",
    index: "04",
    title: "Prism Collapse",
    year: "2025",
    client: "Atelier Lumen",
    discipline: "Installation",
    duration: "00:13",
    aspect: "16:9",
    prompt:
      "Crystal prism collapsing into rainbow light shards. Teal, violet, magenta refraction in a dark void. Macro, photoreal, no text.",
    synopsis: "Light as material. A room that forgets its walls.",
    body: "A six-channel installation for Atelier Lumen. Optical glass, projection, and a displacement field that turns visitors into prisms. The collapse is the show.",
    video: "/videos/prism-collapse.mp4",
    poster: "/posters/prism-collapse.jpg",
    fallback: "/fallbacks/prism-collapse.json",
    webp: "/webp/prism-collapse.webp",
    color: [0.9, 0.45, 0.98],
    accent: "#e879f9",
  },
  {
    id: "neural-tide",
    index: "05",
    title: "Neural Tide",
    year: "2024",
    client: "Kite Bio",
    discipline: "Science / Film",
    duration: "00:10",
    aspect: "16:9",
    prompt:
      "Organic energy orb of neural filaments. Teal and violet synapses blooming in a black void. Cinematic, hyper-stylized, no logos.",
    synopsis: "A biotech origin myth, told at the scale of a synapse.",
    body: "Kite needed awe without the usual laboratory clichés. We grew a tide of luminous axons — a film language for intelligence that is wet, tidal, and unfinished.",
    video: "/videos/neural-tide.mp4",
    poster: "/posters/neural-tide.jpg",
    fallback: "/fallbacks/neural-tide.json",
    webp: "/webp/neural-tide.webp",
    color: [0.4, 0.78, 0.96],
    accent: "#67e8f9",
  },
  {
    id: "helix-meridian",
    index: "06",
    title: "Helix Meridian",
    year: "2025",
    client: "Meridian Lab",
    discipline: "Identity",
    duration: "00:09",
    aspect: "16:9",
    prompt:
      "Luminous double-helix of liquid light twisting through a deep void. Iridescent teal, violet, magenta ribbons of molten glass.",
    synopsis: "A research institute whose mark is a living genome.",
    body: "Meridian’s helix is never the same twice. We built a generative identity that writes itself from a seed — print, type, and spatial graphics all orbit the same meridians.",
    poster: "/posters/helix-meridian.jpg",
    fallback: "/fallbacks/helix-meridian.json",
    webp: "/webp/helix-meridian.webp",
    color: [0.72, 0.42, 0.98],
    accent: "#c084fc",
  },
  {
    id: "eclipse-engine",
    index: "07",
    title: "Eclipse Engine",
    year: "2024",
    client: "Orion Drive",
    discipline: "Launch / Film",
    duration: "00:10",
    aspect: "16:9",
    prompt:
      "Solar eclipse corona of molten gold and iridescent teal fire around a perfect black disc. Chromatic flares, anamorphic bokeh.",
    synopsis: "A propulsion company announced as an occultation.",
    body: "Instead of rockets, we showed the sun going out. A 90-second film and a kinetic type system for Orion Drive’s first public hour — gravity as brand behavior.",
    poster: "/posters/eclipse-engine.jpg",
    fallback: "/fallbacks/eclipse-engine.json",
    webp: "/webp/eclipse-engine.webp",
    color: [0.96, 0.72, 0.32],
    accent: "#fbbf24",
  },
  {
    id: "quantum-bloom",
    index: "08",
    title: "Quantum Bloom",
    year: "2025",
    client: "Sable Gallery",
    discipline: "Art / Experience",
    duration: "00:09",
    aspect: "16:9",
    prompt:
      "Crystalline flowers of light exploding from a dark void. Liquid-metal teal and violet petals, particle pollen, volumetric rays.",
    synopsis: "A night bloom that only exists when someone looks.",
    body: "Commissioned for Sable’s winter salon. A reactive garden of quantum flowers — each visitor a pollinator. The piece is the audience, briefly made visible.",
    poster: "/posters/quantum-bloom.jpg",
    fallback: "/fallbacks/quantum-bloom.json",
    webp: "/webp/quantum-bloom.webp",
    color: [0.42, 0.94, 0.74],
    accent: "#34d399",
  },
];

export function getProject(id: string) {
  return PROJECTS.find((p) => p.id === id);
}

export function nextProject(id: string) {
  const i = PROJECTS.findIndex((p) => p.id === id);
  return PROJECTS[(i + 1) % PROJECTS.length];
}

export function prevProject(id: string) {
  const i = PROJECTS.findIndex((p) => p.id === id);
  return PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
}
