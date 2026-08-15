import { useEffect, useRef, useState } from "react";
import type { Project } from "../lib/projects";
import { detectCapabilities } from "../lib/capabilities";

export function MediaPortal({
  project,
  className = "",
  priority = false,
}: {
  project: Project;
  className?: string;
  priority?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<"video" | "poster">("poster");

  useEffect(() => {
    const cap = detectCapabilities();
    if (!project.video || cap.reducedMotion || cap.saveData) {
      setMode("poster");
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    const onReady = () => setMode("video");
    const onFail = () => setMode("poster");
    v.addEventListener("canplay", onReady);
    v.addEventListener("error", onFail);
    const play = v.play();
    if (play) play.catch(onFail);
    return () => {
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("error", onFail);
    };
  }, [project.video]);

  return (
    <div className={`relative overflow-hidden bg-[#08080c] ${className}`}>
      <picture
        className={`block h-full w-full transition-opacity duration-700 ${
          mode === "video" ? "opacity-0" : "opacity-100"
        }`}
      >
        <source srcSet={project.webp} type="image/webp" />
        <img
          src={project.poster}
          alt=""
          className="ken h-full w-full object-cover"
        />
      </picture>
      {project.video && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            mode === "video" ? "opacity-100" : "opacity-0"
          }`}
          src={project.video}
          poster={project.poster}
          muted
          loop
          playsInline
          autoPlay
          preload={priority ? "auto" : "metadata"}
        />
      )}
    </div>
  );
}
