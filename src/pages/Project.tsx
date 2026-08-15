import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject, nextProject, prevProject } from "../lib/projects";
import { useUniverse } from "../context/UniverseContext";
import { MediaPortal } from "../components/MediaPortal";

export function ProjectPage() {
  const { id = "" } = useParams();
  const project = getProject(id);
  const { setActive, setHovered, pulse } = useUniverse();

  useEffect(() => {
    if (!project) return;
    setActive(project);
    setHovered(project);
    pulse(project.color);
    return () => {
      setActive(null);
      setHovered(null);
    };
  }, [project, setActive, setHovered, pulse]);

  if (!project) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-4xl text-white">Signal lost.</p>
          <Link to="/work" className="mt-6 inline-block text-[11px] uppercase tracking-[0.28em] text-white/50">
            Return to archive
          </Link>
        </div>
      </div>
    );
  }

  const next = nextProject(project.id);
  const prev = prevProject(project.id);

  return (
    <article className="relative z-10 px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[11px] uppercase tracking-[0.36em] text-white/40">
          {project.index} · {project.client} · {project.year}
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-white md:text-8xl">
          {project.title}
        </h1>
        <p className="mt-6 max-w-2xl font-serif text-2xl italic text-white/60">
          {project.synopsis}
        </p>

        <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/8">
          <MediaPortal project={project} className="aspect-video w-full" priority />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        </div>

        <div className="mt-14 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-lg leading-relaxed text-white/60">{project.body}</p>
            <p className="mt-8 text-sm leading-relaxed text-white/35">
              Generation prompt — {project.prompt}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-6 text-sm text-white/55 md:col-span-4 md:col-start-9">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.24em] text-white/30">
                Discipline
              </dt>
              <dd className="mt-2">{project.discipline}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.24em] text-white/30">
                Duration
              </dt>
              <dd className="mt-2">{project.duration}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.24em] text-white/30">
                Aspect
              </dt>
              <dd className="mt-2">{project.aspect}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.24em] text-white/30">
                Fallback
              </dt>
              <dd className="mt-2">
                <a href={project.fallback} className="hover:text-white">
                  Lottie
                </a>
                <span className="text-white/25"> · </span>
                <a href={project.webp} className="hover:text-white">
                  WebP
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <nav className="mt-24 flex items-center justify-between border-t border-white/8 pt-8">
          <Link
            to={`/work/${prev.id}`}
            className="group"
            onMouseEnter={() => {
              setHovered(prev);
              pulse(prev.color);
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">
              Previous
            </p>
            <p className="mt-2 font-display text-2xl text-white group-hover:iris-text">
              {prev.title}
            </p>
          </Link>
          <Link
            to={`/work/${next.id}`}
            className="group text-right"
            onMouseEnter={() => {
              setHovered(next);
              pulse(next.color);
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">
              Next
            </p>
            <p className="mt-2 font-display text-2xl text-white group-hover:iris-text">
              {next.title}
            </p>
          </Link>
        </nav>
      </div>
    </article>
  );
}
