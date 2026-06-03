"use client";
/* eslint-disable react/no-unknown-property -- R3F maps three.js props (args, transparent, depthTest, etc.) onto JSX intrinsics */

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { heroStates } from "@/lib/content";
import { PLANE_LAYERS, drawPlaneLayer } from "@/lib/hero/layers";
import { keyframeAt } from "@/lib/hero/keyframes";
import { MagneticButton } from "@/components/ui/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const PLANE_W = 3.2;
const PLANE_H = 1.8;

function Planes({ progress }: { progress: React.MutableRefObject<number> }) {
  const { gl, invalidate } = useThree();
  const meshes = useRef<THREE.Mesh[]>([]);

  const textures = useMemo(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    return PLANE_LAYERS.map((kind) => {
      const tex = new THREE.CanvasTexture(drawPlaneLayer(kind));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.needsUpdate = true;
      return tex;
    });
  }, [gl]);

  useEffect(() => {
    invalidate(); // render the initial assembled frame in demand mode
    return () => textures.forEach((t) => t.dispose());
  }, [textures, invalidate]);

  useFrame(() => {
    const p = progress.current;
    PLANE_LAYERS.forEach((_, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const kf = keyframeAt(i, p);
      mesh.position.z = kf.z;
      mesh.rotation.x = kf.rx;
      mesh.rotation.y = kf.ry;
      mesh.scale.setScalar(kf.scale);
      const mat = mesh.material as THREE.MeshBasicMaterial | undefined;
      if (mat) mat.opacity = kf.opacity;
    });
  });

  return (
    <>
      {PLANE_LAYERS.map((kind, i) => (
        <mesh
          key={kind}
          ref={(el) => {
            if (el) meshes.current[i] = el;
          }}
          renderOrder={i}
        >
          <planeGeometry args={[PLANE_W, PLANE_H]} />
          <meshBasicMaterial
            map={textures[i]}
            transparent
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

// Per-state composition: where the text sits, the scrim that keeps it readable
// over the scene, the headline scale, and an optional lead/measure.
const PLACEMENT: Record<
  string,
  { wrap: string; scrim: string; size: string; lead?: string; max?: string }
> = {
  "bottom-left": {
    wrap: "absolute bottom-[15vh] left-0 w-full max-w-[640px] text-left",
    scrim:
      "linear-gradient(to top right, rgba(11,13,16,0.97) 0%, rgba(11,13,16,0.55) 40%, rgba(11,13,16,0) 68%)",
    size: "clamp(2.5rem, 6vw, 5.25rem)",
    max: "16ch",
  },
  "top-left": {
    wrap: "absolute top-[19vh] left-0 w-full max-w-[680px] text-left",
    scrim:
      "linear-gradient(to bottom right, rgba(11,13,16,0.97) 0%, rgba(11,13,16,0.55) 40%, rgba(11,13,16,0) 68%)",
    size: "clamp(3rem, 8vw, 7rem)",
    lead: "clamp(1.1rem, 2.2vw, 1.7rem)",
  },
  right: {
    wrap: "absolute right-0 top-1/2 w-full max-w-[560px] -translate-y-1/2 text-right",
    scrim:
      "linear-gradient(to left, rgba(11,13,16,0.97) 0%, rgba(11,13,16,0.6) 34%, rgba(11,13,16,0) 70%)",
    size: "clamp(2rem, 4vw, 3.5rem)",
    max: "16ch",
  },
  "bottom-wide": {
    wrap: "absolute bottom-[13vh] left-0 w-full text-left",
    scrim:
      "linear-gradient(to top, rgba(11,13,16,0.96) 0%, rgba(11,13,16,0.55) 26%, rgba(11,13,16,0) 54%)",
    size: "clamp(1.8rem, 3.4vw, 3.1rem)",
  },
  center: {
    wrap: "absolute inset-0 flex flex-col items-center justify-center text-center",
    scrim:
      "radial-gradient(ellipse 78% 62% at center, rgba(11,13,16,0.9) 0%, rgba(11,13,16,0.5) 48%, rgba(11,13,16,0) 78%)",
    size: "clamp(2.2rem, 5vw, 4.5rem)",
    max: "20ch",
  },
};

export default function WebGLHero({ onContextLost }: { onContextLost: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const invalidateRef = useRef<() => void>(() => {});
  const headlineRefs = useRef<HTMLDivElement[]>([]);
  const railRefs = useRef<HTMLButtonElement[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);

  // Each state is its own full-stage composition (different position, scale,
  // and scrim). Crossfade between them by distance from the active snap point.
  // The composition CHANGE carries the motion, so no per-state translate.
  const paintOverlay = useCallback((p: number) => {
    headlineRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = p * 4 - i;
      el.style.opacity = String(Math.max(0, 1 - Math.abs(d) * 1.9));
    });

    // Highlight the rail number for the state currently in view.
    const active = Math.max(0, Math.min(4, Math.round(p * 4)));
    railRefs.current.forEach((el, i) => {
      if (!el) return;
      const on = i === active;
      el.dataset.active = on ? "true" : "false";
      if (on) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: root.current!,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          snap: {
            snapTo: [0, 0.25, 0.5, 0.75, 1],
            duration: { min: 0.2, max: 0.5 },
            ease: "power1.inOut",
          },
          onUpdate: (self) => {
            progress.current = self.progress;
            invalidateRef.current();
            paintOverlay(self.progress);
          },
          onRefresh: (self) => paintOverlay(self.progress),
        });
        stRef.current = st;
        paintOverlay(0);
        if (typeof document !== "undefined" && document.fonts) {
          document.fonts.ready.then(() => ScrollTrigger.refresh());
        }
        return () => {
          gsap.killTweensOf(window); // cancel any in-flight snap before teardown
          st.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const jumpTo = (i: number) => {
    const st = stRef.current;
    if (!st || st.end <= st.start) return;
    gsap.killTweensOf(window); // cancel an active snap so it does not fight the jump
    const top = st.start + (i / 4) * (st.end - st.start);
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div ref={root} className="hero-webgl relative h-[500dvh]">
      <div ref={stage} className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6], fov: 26 }}
          gl={{ antialias: true, alpha: true }}
          style={{ position: "absolute", inset: 0 }}
          onCreated={({ gl, invalidate }) => {
            invalidateRef.current = invalidate;
            gl.setClearColor(0x000000, 0);
            const canvas = gl.domElement;
            canvas.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              onContextLost();
            });
          }}
        >
          <Planes progress={progress} />
        </Canvas>

        {/* Per-state compositions. Each state is a full-stage layer with its
            own placement and scrim; paintOverlay crossfades them on scroll. */}
        {heroStates.map((s, i) => {
          const place = PLACEMENT[s.placement];
          // State 01 is the page h1 on the WebGL path (the static h1 is
          // display:none here); the rest are h2.
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <div
              key={s.index}
              ref={(el) => {
                if (el) headlineRefs.current[i] = el;
              }}
              className="pointer-events-none absolute inset-0 z-10"
              style={{ opacity: 0 }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: place.scrim }}
              />
              <div className="absolute inset-0 px-4 sm:px-8 lg:px-20">
                <div className="relative mx-auto h-full w-full max-w-[1400px]">
                  <div className={place.wrap}>
                    {s.placement === "bottom-wide" ? (
                      <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <Heading
                          className="font-display font-extrabold uppercase text-vellum"
                          style={{
                            fontSize: place.size,
                            lineHeight: 0.98,
                            letterSpacing: "-0.02em",
                            maxWidth: "22ch",
                          }}
                        >
                          {s.headline}
                        </Heading>
                        {s.spec ? (
                          <p className="shrink-0 font-mono text-xs uppercase tracking-[0.16em] text-graphite sm:text-right">
                            {s.spec}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <>
                        {s.eyebrow ? (
                          <div className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-graphite">
                            {s.eyebrow}
                          </div>
                        ) : null}
                        {s.lead ? (
                          <div
                            className="font-display font-bold uppercase text-vellum/70"
                            style={{ fontSize: place.lead, lineHeight: 1.05 }}
                          >
                            {s.lead}
                          </div>
                        ) : null}
                        <Heading
                          className="font-display font-extrabold uppercase"
                          style={{
                            fontSize: place.size,
                            lineHeight: 0.98,
                            letterSpacing: "-0.02em",
                            maxWidth: place.max,
                            color: s.ghost
                              ? "rgba(236,231,221,0.10)"
                              : "var(--color-vellum)",
                            WebkitTextStroke: s.ghost
                              ? "1.5px var(--color-vellum)"
                              : undefined,
                            marginLeft: s.placement === "center" ? "auto" : undefined,
                            marginRight: s.placement === "center" ? "auto" : undefined,
                          }}
                        >
                          {s.headline}
                        </Heading>
                        {s.sub ? (
                          <p
                            className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-graphite md:text-sm"
                            style={{
                              maxWidth: "42ch",
                              marginLeft:
                                s.placement === "right" || s.placement === "center"
                                  ? "auto"
                                  : undefined,
                            }}
                          >
                            {s.sub}
                          </p>
                        ) : null}
                        {s.cta ? (
                          <MagneticButton
                            href={s.cta.href}
                            className="cta pointer-events-auto mt-8 inline-flex items-center gap-2 bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-void"
                          >
                            {s.cta.label}
                          </MagneticButton>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Keyboard-operable state rail. Each control jumps to a snap point. */}
        <nav
          aria-label="Hero states"
          className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 lg:block"
        >
          <ol className="space-y-3">
            {heroStates.map((s, i) => (
              <li key={s.index}>
                <button
                  ref={(el) => {
                    if (el) railRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-label={`Go to state ${s.index}`}
                  className="hero-rail__btn flex cursor-pointer items-center gap-2 font-mono text-xs tracking-widest"
                >
                  <span className="hero-rail__tick" aria-hidden="true" />
                  {s.index}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
