import { useEffect, useRef } from "react";
import * as THREE from "three";
import { detectCapabilities, qualityFor } from "../lib/capabilities";
import { useUniverse } from "../context/UniverseContext";

const VERT = `
attribute float aSize;
attribute float aSeed;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
varying float vAlpha;
varying float vSeed;
void main() {
  vSeed = aSeed;
  vec3 p = position;
  float t = uTime * (0.12 + aSeed * 0.18);
  p.x += sin(t + aSeed * 12.0) * 0.18;
  p.y += cos(t * 0.8 + aSeed * 9.0) * 0.14;
  p.z += sin(t * 0.5 + aSeed * 6.0) * 0.2;
  vec2 m = uMouse * 2.0 - 1.0;
  vec2 d = p.xy - m;
  float dist = length(d);
  float pull = smoothstep(1.1, 0.05, dist) * (0.22 + uHover * 0.35);
  p.xy -= normalize(d + 0.0001) * pull;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * (220.0 / -mv.z);
  vAlpha = smoothstep(4.2, 0.4, length(p));
}
`;

const FRAG = `
precision highp float;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vSeed;
void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d = length(uv);
  if (d > 1.0) discard;
  float glow = pow(1.0 - d, 2.4);
  vec3 c = mix(uColorA, uColorB, vSeed);
  gl_FragColor = vec4(c, glow * vAlpha * 0.72);
}
`;

export function ParticleField() {
  const mount = useRef<HTMLDivElement>(null);
  const { hovered } = useUniverse();
  const hoverRef = useRef(hovered);
  hoverRef.current = hovered;

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const cap = detectCapabilities();
    const q = qualityFor(cap);
    if (q.particles <= 0 || !cap.webgl2) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(q.dpr);
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      el.clientWidth / Math.max(el.clientHeight, 1),
      0.1,
      20,
    );
    camera.position.z = 3.4;

    const count = q.particles;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6.4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.2;
      sizes[i] = 0.6 + Math.random() * 2.4;
      seeds[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uColorA: { value: new THREE.Color("#5eead4") },
        uColorB: { value: new THREE.Color("#c084fc") },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const mouse = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;
      const u = mat.uniforms.uMouse.value as THREE.Vector2;
      u.x += (mouse.x - u.x) * 0.06;
      u.y += (mouse.y - u.y) * 0.06;
      const target = hoverRef.current ? 1 : 0;
      mat.uniforms.uHover.value += (target - mat.uniforms.uHover.value) * 0.06;
      if (hoverRef.current) {
        (mat.uniforms.uColorA.value as THREE.Color).lerp(
          new THREE.Color().fromArray(hoverRef.current.color),
          0.04,
        );
      }
      points.rotation.y = Math.sin(t * 0.05) * 0.08;
      points.rotation.x = Math.cos(t * 0.04) * 0.04;
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mount}
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full mix-blend-screen"
      aria-hidden="true"
    />
  );
}
