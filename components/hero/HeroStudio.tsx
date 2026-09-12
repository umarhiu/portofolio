"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "motion/react";

// 1x1 transparent GIF. Stands in below 1024px, where <source> does not match
// and the studio is hidden, so no mockup is requested on a phone.
const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

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
      // Share the controller's hero-wide coordinate space. Each card retains
      // its depth, but no longer loses influence far from its own position.
      const heroBox = hero.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, 2 * (pointer.clientX - heroBox.left) / Math.max(1, heroBox.width) - 1));
      const ny = Math.max(-1, Math.min(1, 2 * (pointer.clientY - heroBox.top) / Math.max(1, heroBox.height) - 1));
      // Use the stable slot for hover too, so enlargement cannot retrigger itself.
      // Decorative cards remain click-through beneath the hero's controls.
      slot.current!.toggleAttribute("data-hovered",
        pointer.clientX >= box.left && pointer.clientX <= box.right &&
        pointer.clientY >= box.top && pointer.clientY <= box.bottom);
      x.set(nx * 32 * depth);
      y.set(ny * 24 * depth);
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
          {/* Decorative raster; fixed dimensions prevent layout shifts.

              The <source> gate matches the .hero-studio display rule in
              globals.css. Below 1024px the studio is not painted, and an eager
              <img> would still download 409 kB of mockups for a phone that
              never shows them, because display:none does not cancel a fetch.
              The blank fallback keeps the element valid and costs no request.
              Loading stays eager on desktop, where these are part of the first
              impression. Change this query only together with that rule. */}
          <picture>
            <source media="(min-width: 1024px)" srcSet={`/images/hero-studio/${source}.webp`} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BLANK} width={640} height={source === "volunteer-mobile-mockup" ? 960 : 640} alt="" draggable={false} decoding="async" />
          </picture>
        </motion.div>
      </div>
    </div>
  );
}

export function HeroStudio() {
  return <div className="hero-studio" aria-hidden="true">{studies.map(study => <StudioCard key={study.name} {...study} />)}</div>;
}
