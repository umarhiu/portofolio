"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/*
  Background for hero state 04 ("Every state designed. Not just the happy path.").
  A compact, interactive component holder. At rest the cards peek out of a frosted
  pocket; hovering nudges them further out; clicking opens it: the front flap
  tilts forward (3D) and the five state cards fan up. While open, they auto-cycle
  leftward (first -> last) on a seamless loop: the leftmost card tucks down into
  the pocket and rises again on the right. Click to close. Reduced-motion paints
  the opened fan static.
*/

type Phase = { x: number; y: number; rotation: number; scale?: number };

// left -> right = default..empty
const DEF: Phase[] = [
  { x: -7, y: -20, rotation: -3 },
  { x: -3.5, y: -23, rotation: -1.5 },
  { x: 0, y: -27, rotation: 0 },
  { x: 3.5, y: -23, rotation: 1.5 },
  { x: 7, y: -20, rotation: 3 },
];
const HOVER: Phase[] = [
  { x: -30, y: -46, rotation: -8 },
  { x: -15, y: -54, rotation: -4 },
  { x: 0, y: -60, rotation: 0 },
  { x: 15, y: -54, rotation: 4 },
  { x: 30, y: -46, rotation: 8 },
];
// open fan slots, left -> right
const SLOT: Phase[] = [
  { x: -156, y: -94, rotation: -18, scale: 1 },
  { x: -80, y: -112, rotation: -9, scale: 1.01 },
  { x: 0, y: -126, rotation: 0, scale: 1.03 },
  { x: 80, y: -112, rotation: 9, scale: 1.01 },
  { x: 156, y: -94, rotation: 18, scale: 1 },
];
const SLOT_Z = [1, 2, 3, 2, 1]; // center slot on top
const EXIT = { x: -278, y: -86, rotation: -26 }; // sweep off to the left
const ENTER = { x: 278, y: -86, rotation: 26 }; // re-enter from the right
const STEP = 1.3; // seconds the fan holds before each leftward shift
const N = 5;

const STATES = ["DEFAULT", "HOVER", "LOADING", "ERROR", "EMPTY"] as const;
const Z = [6, 5, 4, 3, 2]; // default card on top of the closed stack

const CARD = { left: 120, top: 205, w: 180, h: 120 };

// Rounded trapezoid for the pocket front: 260px wide at the top opening,
// tapering to ~240px (the back's width) at the bottom, in a 260x148 box.
const FRONT_CLIP =
  "path('M22,0 L238,0 Q260,0 258.52,21.95 L251.48,126.05 Q250,148 228,148 L32,148 Q10,148 8.52,126.05 L1.48,21.95 Q0,0 22,0 Z')";

const Bar = ({ w, c = "#e7e7e7" }: { w: string; c?: string }) => (
  <div className="rounded-full" style={{ height: 6, width: w, background: c }} />
);

function CardFace({ state }: { state: (typeof STATES)[number] }) {
  const label = (text: string, color: string) => (
    <span className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color }}>
      {text}
    </span>
  );

  if (state === "HOVER") {
    return (
      <>
        {label("Hover", "#9a9a9a")}
        <div className="mt-2 rounded-[7px] p-2" style={{ background: "#f1f1f1", boxShadow: "0 0 0 1.5px #dedede" }}>
          <div className="flex items-center gap-2">
            <div className="rounded-[5px]" style={{ height: 22, width: 22, background: "#dcdcdc" }} />
            <div className="flex-1 space-y-1.5">
              <Bar w="72%" c="#d6d6d6" />
              <Bar w="46%" c="#d6d6d6" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (state === "LOADING") {
    return (
      <>
        {label("Loading", "#9a9a9a")}
        <div className="relative mt-2 overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="rounded-[5px]" style={{ height: 22, width: 22, background: "#ededed" }} />
            <div className="flex-1 space-y-1.5">
              <Bar w="70%" c="#ededed" />
              <Bar w="45%" c="#ededed" />
            </div>
          </div>
          <div className="mt-2 space-y-1.5">
            <Bar w="100%" c="#ededed" />
            <Bar w="80%" c="#ededed" />
          </div>
          <div
            className="loading-shimmer pointer-events-none absolute inset-y-0 w-1/2"
            style={{ background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.85) 50%, transparent 70%)" }}
          />
        </div>
      </>
    );
  }

  if (state === "ERROR") {
    return (
      <>
        {label("Error", "#ff6a1a")}
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex items-center justify-center rounded-[5px]" style={{ height: 22, width: 22, background: "#ffe6d8" }}>
            <span className="block rounded-full" style={{ height: 9, width: 2, background: "#ff6a1a" }} />
            <span className="absolute rounded-full" style={{ bottom: 4, height: 2, width: 2, background: "#ff6a1a" }} />
          </div>
          <div className="flex-1 space-y-1.5">
            <Bar w="68%" c="#ffcaab" />
            <Bar w="44%" c="#e7e7e7" />
          </div>
        </div>
        <div className="mt-2 space-y-1.5">
          <Bar w="100%" c="#e7e7e7" />
          <Bar w="56%" c="#ffcaab" />
        </div>
      </>
    );
  }

  if (state === "EMPTY") {
    return (
      <>
        {label("Empty", "#9a9a9a")}
        <div className="mt-1.5 flex flex-col items-center justify-center gap-1.5 py-2">
          <div className="rounded-[6px] border border-dashed" style={{ height: 26, width: 26, borderColor: "#d4d4d4" }} />
          <Bar w="44%" c="#ededed" />
          <span className="font-mono text-[8px] uppercase tracking-[0.14em]" style={{ color: "#c2c2c2" }}>
            No data
          </span>
        </div>
      </>
    );
  }

  // DEFAULT
  return (
    <>
      {label("Default", "#9a9a9a")}
      <div className="mt-2 flex items-center gap-2">
        <div className="rounded-[5px]" style={{ height: 22, width: 22, background: "#e3e3e3" }} />
        <div className="flex-1 space-y-1.5">
          <Bar w="70%" />
          <Bar w="45%" />
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        <Bar w="100%" />
        <Bar w="80%" />
      </div>
    </>
  );
}

export function HeroBackgroundFolder({ active = false }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !active) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      const cards = q(".fold-card");
      const front = q(".folder-front")[0];
      const hit = q(".folder-hit")[0];
      const caption = q(".folder-caption")[0];
      const shimmer = q(".loading-shimmer");

      gsap.set(cards, { transformOrigin: "center bottom" });
      gsap.set(front, { transformOrigin: "center bottom" });
      const setCaption = (t: string) => {
        if (caption) caption.textContent = t;
      };
      const slotVars = (s: Phase) => ({ x: s.x, y: s.y, rotation: s.rotation, scale: s.scale ?? 1 });

      if (shimmer[0] && !reduce) {
        gsap.fromTo(shimmer[0], { xPercent: -130 }, { xPercent: 290, duration: 1.5, ease: "power1.inOut", repeat: -1, repeatDelay: 0.5 });
      }

      if (reduce) {
        cards.forEach((c, i) => gsap.set(c, slotVars(SLOT[i])));
        gsap.set(front, { y: 16, rotationX: -38 });
        setCaption("OPEN");
        return;
      }

      let open = false;
      let hovering = false;
      let carousel: gsap.core.Timeline | null = null;
      let pulse: gsap.core.Tween | null = null;
      const stopPulse = () => {
        if (!pulse) return;
        pulse.kill();
        pulse = null;
        gsap.to(caption, { opacity: 0.85, scale: 1, duration: 0.3, overwrite: "auto" });
      };

      cards.forEach((c, i) => gsap.set(c, slotVars(DEF[i])));
      setCaption("CLICK TO OPEN");
      gsap.set(caption, { transformOrigin: "center" });
      gsap.from(cards, { y: 28, autoAlpha: 0, duration: 0.55, ease: "power2.out", stagger: 0.05 });
      pulse = gsap.fromTo(
        caption,
        { opacity: 0.95, scale: 1 },
        { opacity: 0.4, scale: 1.06, duration: 0.95, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.7 },
      );

      // Seamless left-cycling carousel: a 5-step timeline (after 5 shifts each
      // card is back to its start, so repeat:-1 loops perfectly).
      const buildCarousel = () => {
        const tl = gsap.timeline({ repeat: -1, delay: 0.65 });
        for (let k = 1; k <= N; k++) {
          const at = (k - 1) * STEP;
          for (let i = 0; i < N; i++) {
            const fromSlot = (i - (k - 1) + N) % N;
            const toSlot = (i - k + N) % N;
            const c = cards[i];
            if (fromSlot === 0) {
              // wrapping card: sweep off to the left and fade out, then fade
              // back in entering from the right
              tl.set(c, { zIndex: SLOT_Z[0] }, at);
              tl.to(c, { x: EXIT.x, y: EXIT.y, rotation: EXIT.rotation, scale: 1, autoAlpha: 0, duration: STEP * 0.46, ease: "power2.in" }, at);
              tl.set(c, { x: ENTER.x, y: ENTER.y, rotation: ENTER.rotation, scale: SLOT[toSlot].scale ?? 1, zIndex: SLOT_Z[toSlot] }, at + STEP * 0.5);
              tl.to(c, { ...slotVars(SLOT[toSlot]), autoAlpha: 1, duration: STEP * 0.46, ease: "power2.out" }, at + STEP * 0.5);
            } else {
              tl.set(c, { zIndex: SLOT_Z[toSlot] }, at);
              tl.to(c, { ...slotVars(SLOT[toSlot]), duration: STEP * 0.86, ease: "power2.inOut" }, at);
            }
          }
        }
        return tl;
      };

      const applyClosed = () => {
        const set = hovering ? HOVER : DEF;
        cards.forEach((c, i) => gsap.to(c, { ...slotVars(set[i]), duration: 0.55, ease: "power3.out", overwrite: "auto" }));
        setCaption("CLICK TO OPEN");
      };
      const openFan = () => {
        if (carousel) {
          carousel.kill();
          carousel = null;
        }
        gsap.to(front, { y: 16, rotationX: -38, duration: 0.55, ease: "power3.out", overwrite: "auto" });
        cards.forEach((c, i) => gsap.to(c, { ...slotVars(SLOT[i]), zIndex: SLOT_Z[i], duration: 0.55, ease: "power3.out", overwrite: "auto" }));
        setCaption("CLICK TO CLOSE");
        carousel = buildCarousel();
      };
      const closeFan = () => {
        if (carousel) {
          carousel.kill();
          carousel = null;
        }
        gsap.to(front, { y: 0, rotationX: 0, duration: 0.55, ease: "power3.out", overwrite: "auto" });
        cards.forEach((c, i) => gsap.to(c, { ...slotVars(DEF[i]), zIndex: Z[i], duration: 0.55, ease: "power3.inOut", overwrite: "auto" }));
        setCaption("CLICK TO OPEN");
      };

      const onEnter = () => {
        if (open) return;
        hovering = true;
        stopPulse();
        applyClosed();
      };
      const onLeave = () => {
        if (open) return;
        hovering = false;
        applyClosed();
      };
      const onClick = () => {
        open = !open;
        stopPulse();
        if (open) openFan();
        else closeFan();
      };

      hit.addEventListener("pointerenter", onEnter);
      hit.addEventListener("pointerleave", onLeave);
      hit.addEventListener("click", onClick);

      return () => {
        if (carousel) carousel.kill();
        hit.removeEventListener("pointerenter", onEnter);
        hit.removeEventListener("pointerleave", onLeave);
        hit.removeEventListener("click", onClick);
      };
    },
    { scope: ref, dependencies: [active], revertOnUpdate: true },
  );

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[8%] z-20 flex justify-center">
      {/* scale lives in a CSS var so viewport-height media queries (globals.css)
          can shrink the holder on short laptops; it scales from center-top, so a
          smaller scale lifts the bottom edge clear of the bottom-anchored state-04
          headline instead of overlapping it. */}
      <div className="hero-folder-stage relative" style={{ width: 420, height: 408, perspective: 900, transform: "scale(var(--folder-scale, 1.4))", transformOrigin: "center top" }}>
        {/* drop shadow */}
        <div className="absolute rounded-full" style={{ left: 100, top: 366, width: 220, height: 34, background: "rgba(0,0,0,0.6)", filter: "blur(20px)", zIndex: 0 }} />

        {/* holder back wall (a dark rounded rim behind the pocket) */}
        <div
          className="absolute rounded-[22px]"
          style={{ left: 90, top: 214, width: 240, height: 128, background: "linear-gradient(180deg, #20242b, #0c0e12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)", zIndex: 1 }}
        />

        {/* the five state cards */}
        {STATES.map((s, i) => (
          <div
            key={s}
            className="fold-card absolute overflow-hidden rounded-[12px] bg-white p-2.5"
            style={{ left: CARD.left, top: CARD.top, width: CARD.w, height: CARD.h, boxShadow: "0 24px 54px -20px rgba(0,0,0,0.85)", zIndex: Z[i] }}
          >
            <CardFace state={s} />
          </div>
        ))}

        {/* frosted pocket front: rounded trapezoid, wider at the top, tilts open */}
        <div
          className="folder-front absolute"
          style={{
            left: 80,
            top: 236,
            width: 260,
            height: 148,
            background: "linear-gradient(180deg, rgba(34,38,45,0.7), rgba(12,14,18,0.84))",
            backdropFilter: "blur(7px) saturate(1.1)",
            WebkitBackdropFilter: "blur(7px) saturate(1.1)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            clipPath: FRONT_CLIP,
            WebkitClipPath: FRONT_CLIP,
            zIndex: 10,
          }}
        />

        {/* invisible interaction target over the pocket */}
        <div
          className="folder-hit absolute"
          style={{ left: 80, top: 200, width: 260, height: 186, zIndex: 12, cursor: "pointer", pointerEvents: active ? "auto" : "none" }}
        />

        {/* click prompt */}
        <div
          className="folder-caption absolute font-mono text-[12px] uppercase tracking-[0.24em]"
          style={{ left: 0, right: 0, top: 394, textAlign: "center", color: "rgba(236,231,221,0.85)", zIndex: 13 }}
        >
          CLICK TO OPEN
        </div>
      </div>
    </div>
  );
}
