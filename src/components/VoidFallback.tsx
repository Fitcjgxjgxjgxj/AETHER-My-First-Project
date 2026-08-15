import { useEffect, useState } from "react";
import { detectCapabilities } from "../lib/capabilities";

export function VoidFallback() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const cap = detectCapabilities();
    setShow(!cap.webgl2 || cap.reducedMotion);
  }, []);

  if (!show) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <img
        src="/posters/void-field.jpg"
        alt=""
        className="h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-[#050508]/40" />
    </div>
  );
}
