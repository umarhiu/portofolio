"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/*
  Background for hero state 05 ("Complexity, taken apart so no one else has to.").
  Moving the cursor anywhere over the hero leaves a trail of amber pills, each
  popping + sliding up and fading, cycling through the tools / skills. A reused
  pool of pill elements keeps it allocation-free. Driven by a window pointermove
  (so it works regardless of the text layer), pointer-events:none, active-gated,
  reduced-motion off.
*/

const SKILLS = [
  "AI Workflow",
  "Figma",
  "Framer",
  "Claude",
  "Design System",
  "Prototyping",
  "Motion",
  "Design Tokens",
  "User Flows",
  "Systems Thinking",
];
const POOL = 10;
const SPAWN_DIST = 118; // px of cursor travel between pills (larger = calmer trail)

export function HeroBackgroundSkills({ active = false }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !active) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);
      const pills = q(".skill-pill");
      if (!pills.length) return;
      const rand = gsap.utils.random;

      let rectLeft = 0;
      let rectTop = 0;
      let w = 0;
      let h = 0;
      const syncRect = () => {
        const r = root.getBoundingClientRect();
        rectLeft = r.left;
        rectTop = r.top;
        w = r.width;
        h = r.height;
      };
      syncRect();

      let poolIdx = 0;
      let skillIdx = 0;
      let lastX: number | null = null;
      let lastY: number | null = null;

      const spawn = (x: number, y: number) => {
        const pill = pills[poolIdx];
        poolIdx = (poolIdx + 1) % pills.length;
        const label = pill.querySelector(".skill-label");
        if (label) label.textContent = SKILLS[skillIdx];
        skillIdx = (skillIdx + 1) % SKILLS.length;

        gsap.killTweensOf(pill);
        gsap.set(pill, { x, y, xPercent: -50, yPercent: -50, rotation: rand(-4, 4), scale: 0.84, autoAlpha: 0 });
        gsap
          .timeline()
          .to(pill, { autoAlpha: 1, scale: 1, y: y - 6, duration: 0.24, ease: "back.out(1.5)" })
          .to(pill, { y: y - 30, autoAlpha: 0, scale: 0.98, duration: 0.45, ease: "power2.in" }, "+=0.18");
      };

      const onMove = (e: PointerEvent) => {
        const x = e.clientX - rectLeft;
        const y = e.clientY - rectTop;
        if (x < 0 || y < 0 || x > w || y > h) return;
        if (lastX === null || lastY === null) {
          lastX = x;
          lastY = y;
          spawn(x, y);
          return;
        }
        if (Math.hypot(x - lastX, y - lastY) >= SPAWN_DIST) {
          lastX = x;
          lastY = y;
          spawn(x, y);
        }
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      const ro = new ResizeObserver(syncRect);
      ro.observe(root);

      return () => {
        window.removeEventListener("pointermove", onMove);
        ro.disconnect();
      };
    },
    { scope: ref, dependencies: [active], revertOnUpdate: true },
  );

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from({ length: POOL }).map((_, i) => (
        <div
          key={i}
          className="skill-pill absolute left-0 top-0 rounded-[11px] bg-accent px-4 py-2"
          style={{ opacity: 0, boxShadow: "0 10px 22px -10px rgba(255,106,26,0.45)" }}
        >
          <span className="skill-label font-display text-[15px] font-extrabold uppercase tracking-wide text-white" />
        </div>
      ))}
    </div>
  );
}
