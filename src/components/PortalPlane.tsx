import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import type { Project } from "../lib/projects";
import { detectCapabilities } from "../lib/capabilities";

const VERT = `
varying vec2 vUv;
uniform float uTime;
uniform float uMorph;
void main() {
  vUv = uv;
  vec3 p = position;
  float w = sin(p.y * 4.0 + uTime * 1.4) * 0.06 * uMorph;
  float w2 = cos(p.x * 5.0 - uTime * 1.1) * 0.05 * uMorph;
  p.z += w + w2;
  p.xy *= 1.0 + uMorph * 0.04;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform sampler2D uMap;
uniform sampler2D uPoster;
uniform float uHasVideo;
uniform float uTime;
uniform float uReveal;
uniform vec3 uAccent;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 c = uv - 0.5;
  float r = length(c);
  float angle = atan(c.y, c.x);
  float ripple = sin(r * 18.0 - uTime * 2.4) * 0.012 * uReveal;
  uv += normalize(c + 0.0001) * ripple;
  uv += vec2(sin(angle * 3.0 + uTime), cos(angle * 2.0 - uTime)) * 0.01 * uReveal;

  vec4 poster = texture2D(uPoster, uv);
  vec4 vid = texture2D(uMap, uv);
  vec3 col = mix(poster.rgb, vid.rgb, uHasVideo);

  float portal = smoothstep(0.62, 0.18, r);
  float rim = smoothstep(0.58, 0.42, r) * smoothstep(0.22, 0.5, r);
  float iris = 0.55 + 0.45 * sin(uTime * 0.7 + r * 6.0);
  vec3 edge = uAccent * rim * (1.2 + iris);

  float mask = portal * uReveal;
  float alpha = mask * (0.15 + 0.85 * smoothstep(0.0, 0.25, uReveal));
  col = mix(col * 0.35, col, portal);
  col += edge * 0.85;
  col += uAccent * pow(max(0.0, 0.35 - r), 2.2) * 0.8;

  gl_FragColor = vec4(col, alpha);
}
`;

export function PortalPlane({
  project,
  visible,
}: {
  project: Project | null;
  visible: boolean;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const state = useRef({
    reveal: 0,
    morph: 0,
  });

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const cap = detectCapabilities();
    if (!cap.webgl2) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      32,
      el.clientWidth / Math.max(el.clientHeight, 1),
      0.1,
      20,
    );
    camera.position.z = 2.35;

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const loader = new THREE.TextureLoader();
    const posterTex = loader.load("/posters/chromatic-drift.jpg");
    posterTex.colorSpace = THREE.SRGBColorSpace;
    posterTex.minFilter = THREE.LinearFilter;
    posterTex.magFilter = THREE.LinearFilter;

    const videoTex = new THREE.VideoTexture(video);
    videoTex.colorSpace = THREE.SRGBColorSpace;
    videoTex.minFilter = THREE.LinearFilter;
    videoTex.magFilter = THREE.LinearFilter;

    const uniforms = {
      uMap: { value: videoTex },
      uPoster: { value: posterTex },
      uHasVideo: { value: 0 },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uMorph: { value: 0 },
      uAccent: { value: new THREE.Color("#5eead4") },
    };

    const geo = new THREE.PlaneGeometry(2.35, 1.32, 64, 36);
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    let raf = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uReveal.value = state.current.reveal;
      uniforms.uMorph.value = state.current.morph;
      mesh.rotation.y = Math.sin(uniforms.uTime.value * 0.25) * 0.08;
      mesh.rotation.x = Math.cos(uniforms.uTime.value * 0.2) * 0.03;
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      camera.aspect = el.clientWidth / Math.max(el.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const api = {
      setProject(p: Project | null, show: boolean) {
        if (p) {
          loader.load(p.poster, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            uniforms.uPoster.value = tex;
          });
          (uniforms.uAccent.value as THREE.Color).set(p.accent);
          if (p.video) {
            video.src = p.video;
            video.load();
            const play = video.play();
            if (play) play.catch(() => undefined);
            uniforms.uHasVideo.value = 1;
          } else {
            uniforms.uHasVideo.value = 0;
          }
        }
        gsap.to(state.current, {
          reveal: show && p ? 1 : 0,
          morph: show && p ? 1 : 0,
          duration: 1.15,
          ease: "power3.out",
        });
      },
    };
    (el as HTMLDivElement & { __portal?: typeof api }).__portal = api;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      video.pause();
      video.src = "";
      geo.dispose();
      mat.dispose();
      videoTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const el = mount.current as (HTMLDivElement & { __portal?: { setProject: (p: Project | null, show: boolean) => void } }) | null;
    el?.__portal?.setProject(project, visible);
  }, [project, visible]);

  return (
    <div
      ref={mount}
      className="pointer-events-none fixed inset-0 z-[2] h-full w-full"
      aria-hidden="true"
    />
  );
}
