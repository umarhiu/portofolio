"use client";

import { useEffect } from "react";
import { animate } from "motion/react";

declare global {
  interface Window {
    __heroIntro?: {
      state: "preparing" | "entering" | "ready";
      reason: string;
      cancel: (() => void) | null;
      pointer: Pick<PointerEvent, "clientX" | "clientY" | "pointerType"> | null;
      finish: (reason?: string) => void;
      start: (durationMs?: number) => boolean;
    };
  }
}

// Sequential stages: identity 0–1.15, then one new group at a time. These
// durations also determine the independent watchdog; there is no old 1.8s cap.
const IDENTITY = { appear: 0.3, hold: 0.3, dock: 0.55 };
const BEATS = [
  { name: "gamepad", duration: 0.45, from: "translateY(24px) scale(0.94) rotate(-5deg)" },
  { name: "line-one", duration: 0.35, from: "translateY(22px)" },
  { name: "line-two", duration: 0.3, from: "translateY(22px)" },
  { name: "description", duration: 0.3, from: "translateY(10px)" },
  { name: "primary", duration: 0.2, from: "translateY(8px)" },
  { name: "secondary", duration: 0.2, from: "translateY(8px)" },
  { name: "hint", duration: 0.15, from: "translateY(0px)" },
  { name: "nav", duration: 0.3, from: "translateY(-8px)" },
] as const;
const DURATION_MS = Math.round((Object.values(IDENTITY).reduce((a, b) => a + b, 0)
  + BEATS.reduce((sum, beat) => sum + beat.duration, 0)) * 1000);
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function useHeroEntrance() {
  useEffect(() => {
    const intro = window.__heroIntro;
    if (!intro || intro.state !== "preparing") return;
    let disposed = false;
    let owned = false;
    let controls: ReturnType<typeof animate> | undefined;
    const running = () => !disposed && intro.state === "entering";

    async function prepare() {
      try {
        // next/font already preloads the faces. Wait only for faces actually
        // used above the fold, never document.fonts.ready or window.load.
        const selectors = [".hp-l1", '[data-hero-enter="identity"]', '[data-hero-enter="description"]'];
        if (!document.fonts?.load) {
          intro!.finish("font-api-unavailable");
          return;
        }
        await Promise.all(selectors.map(async selector => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) throw new Error("Missing hero resource target");
          const style = getComputedStyle(element);
          await document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, element.textContent || "design");
        }));
        if (disposed || intro!.state !== "preparing") return;
        const identity = document.querySelector<HTMLElement>('[data-hero-enter="identity"]');
        const shell = document.querySelector<HTMLElement>(".hero-shell");
        if (!identity || !shell) throw new Error("Missing identity or opening viewport");
        // Measure the actual inline label, never its full-width paragraph.
        // Its permanent slot remains in normal layout throughout the intro.
        const label = identity.getBoundingClientRect();
        const viewport = shell.getBoundingClientRect();
        const x = viewport.left + viewport.width / 2 - (label.left + label.width / 2);
        const y = window.innerHeight / 2 - (label.top + label.height / 2);
        const centered = `translate(${x}px, ${y}px) scale(1.12)`;
        if (!intro!.start(DURATION_MS)) return;
        owned = true;
        intro!.cancel = () => controls?.stop();
        controls = animate(identity, {
          opacity: [0, 1],
          transform: [`translate(${x}px, ${y + 6}px) scale(1.12)`, centered],
        }, { duration: IDENTITY.appear, ease: EASE_OUT });
        await controls;
        if (!running()) return;
        // This is the only intentional hold, part of the same orchestrator.
        // A scalar clock cannot be optimized away as an unchanged DOM value.
        controls = animate(0, 1, { duration: IDENTITY.hold });
        await controls;
        if (!running()) return;
        controls = animate(identity, {
          transform: [centered, "translate(0px, 0px) scale(1)"],
        }, { duration: IDENTITY.dock, ease: [0.65, 0, 0.35, 1] });
        await controls;
        if (!running()) return;

        for (const beat of BEATS) {
          const elements = Array.from(document.querySelectorAll<HTMLElement>(`[data-hero-enter="${beat.name}"]`));
          const text = beat.name === "line-one" || beat.name === "line-two";
          controls = animate(elements, {
            opacity: [0, 1],
            transform: [beat.from, beat.name === "gamepad"
              ? "translateY(0px) scale(1) rotate(0deg)" : "translateY(0px)"],
            ...(text ? { clipPath: ["inset(0px -4px 100% -4px)", "inset(-4px -4px -4px -4px)"] } : {}),
          }, { duration: beat.duration, ease: EASE_OUT });
          await controls;
          if (!running()) return;
          // Make a group interactive only once it is visible. Keyboard focus
          // still uses the bootstrap's synchronous finish handler at any time.
          elements.forEach(element => { element.style.pointerEvents = "auto"; });
        }
        if (running()) intro!.finish();
      } catch {
        if (!disposed) intro!.finish("animation-error");
      }
    }
    void prepare();
    return () => {
      disposed = true;
      // Strict Mode's preparing-effect replay can restart preparation; only
      // an effect that actually started a timeline may cancel that timeline.
      if (owned) intro.finish("unmount");
    };
  }, []);
}
