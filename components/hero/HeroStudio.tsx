"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "motion/react";

const studies = [
  // Generated device mockups featuring the user's project designs.
  { name: "architecture", source: "reusely-tablet-mockup", angle: -6, depth: 0.4 },
  { name: "metal", source: "dashboard-laptop-mockup", angle: -13, depth: 1.3 },
  { name: "paper", source: "hospital-handheld-mockup", angle: -8, depth: 0.7 },
  { name: "acrylic", source: "reusely-studio-mockup", angle: 8, depth: 0.65 },
  { name: "detail", source: "volunteer-mobile-mockup", angle: 17, depth: 1.15 },
];

function StudioCard({ name, source, angle, depth }: typeof studies[number]) {
  const slot = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 100, damping: 22 });
  const y = useSpring(0, { stiffness: 100, damping: 22 });
  const transform = useTransform(() =>
    `perspective(800px) translate3d(${x.get()}px, ${y.get()}px, 0) rotateX(${-y.get() * 0.22}deg) rotateY(${x.get() * 0.22}deg) rotateZ(${angle}deg)`);

  useEffect(() => {
    const hero = slot.current?.closest("#hero");
    if (!hero) return;
    const query = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    let pointer: { clientX: number; clientY: number } | null = null;
    const reset = () => {
      pointer = null;
      x.set(0);
      y.set(0);
      slot.current?.removeAttribute("data-hovered");
    };
    const update = () => {
      if (!query.matches) { x.jump(0); y.jump(0); slot.current?.removeAttribute("data-hovered"); return; }
      if (!pointer || (window.__heroIntro && window.__heroIntro.state !== "ready")) return;
      // Measure the fixed layout slot, never the moving image: no feedback loop.
      const box = slot.current!.getBoundingClientRect();
      const dx = pointer.clientX - (box.left + box.width / 2);
      const dy = pointer.clientY - (box.top + box.height / 2);
      // Use the stable slot for hover too, so enlargement cannot retrigger itself.
      // Decorative cards remain click-through beneath the hero's controls.
      slot.current!.toggleAttribute("data-hovered",
        pointer.clientX >= box.left && pointer.clientX <= box.right &&
        pointer.clientY >= box.top && pointer.clientY <= box.bottom);
      const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / 700);
      x.set(Math.max(-32, Math.min(32, dx * 0.1)) * depth * proximity);
      y.set(Math.max(-32, Math.min(32, dy * 0.1)) * depth * proximity);
    };
    const move = (event: Event) => { pointer = event as PointerEvent; update(); };
    const visibility = () => { if (document.hidden) reset(); };
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", reset);
    window.addEventListener("hero-intro-ready", update);
    window.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    query.addEventListener("change", update);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
      window.removeEventListener("hero-intro-ready", update);
      window.removeEventListener("scroll", reset);
      document.removeEventListener("visibilitychange", visibility);
      query.removeEventListener("change", update);
    };
  }, [depth, x, y]);

  return (
    <div ref={slot} className={`hero-studio__slot hero-studio__slot--${name}`}>
      <div data-hero-enter="studio">
        <motion.div className="hero-studio__card" style={{ transform }}>
          {/* Decorative raster; fixed dimensions prevent layout shifts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/images/hero-studio/${source}.webp`} width={640} height={source === "volunteer-mobile-mockup" ? 960 : 640} alt="" draggable={false} decoding="async" />
        </motion.div>
      </div>
    </div>
  );
}

export function HeroStudio() {
  return <div className="hero-studio" aria-hidden="true">{studies.map(study => <StudioCard key={study.name} {...study} />)}</div>;
}
