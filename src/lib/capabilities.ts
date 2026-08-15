export type Capabilities = {
  webgl2: boolean;
  reducedMotion: boolean;
  coarsePointer: boolean;
  saveData: boolean;
  lowCpu: boolean;
  mobile: boolean;
};

export function detectCapabilities(): Capabilities {
  const canvas = document.createElement("canvas");
  const webgl2 = !!canvas.getContext("webgl2");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const saveData = !!nav.connection?.saveData;
  const lowCpu =
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4);
  const mobile = coarsePointer || window.innerWidth < 768;
  return { webgl2, reducedMotion, coarsePointer, saveData, lowCpu, mobile };
}

export function qualityFor(cap: Capabilities) {
  if (cap.reducedMotion) {
    return {
      sim: 64,
      dye: 256,
      particles: 0,
      dpr: 1,
      bloom: false,
      fluid: false,
    };
  }
  if (cap.mobile || cap.saveData || cap.lowCpu) {
    return {
      sim: 96,
      dye: 320,
      particles: 1400,
      dpr: Math.min(window.devicePixelRatio || 1, 1.25),
      bloom: false,
      fluid: cap.webgl2,
    };
  }
  return {
    sim: 128,
    dye: 512,
    particles: 4200,
    dpr: Math.min(window.devicePixelRatio || 1, 1.75),
    bloom: true,
    fluid: cap.webgl2,
  };
}
