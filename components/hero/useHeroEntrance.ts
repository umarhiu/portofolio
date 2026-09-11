"use client";

import { useEffect } from "react";
import { animate, stagger } from "motion/react";

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

/*
  Sequential stages: identity 0 to 1.15, then one group at a time. A beat may
  hold several groups, which run concurrently: the nav rides with the gamepad
  so the bar and the controller arrive together.

  Text groups reveal letter by letter, staggered by index (see
  components/ui/text-reveal-animation.tsx). Their letters are animated in a
  single Motion call per beat, so a beat's real length is its duration plus the
  last letter's delay. The watchdog is computed from the live letter counts
  below, or it would cut the longest reveal short.
*/
const IDENTITY = { appear: 0.3, hold: 0.3, dock: 0.55 };
const GREETINGS = [
  { text: "Hello", lang: "en", hold: .35 },
  { text: "Halo", lang: "id", hold: .22 },
  { text: "สวัสดี", lang: "th", hold: .26 },
  { text: "こんにちは", lang: "ja", hold: .26 },
  { text: "안녕하세요", lang: "ko", hold: .26 },
  { text: "Bonjour", lang: "fr", hold: .22 },
  { text: "Hola", lang: "es", hold: .3 },
];
const PRELOADER_DURATION = GREETINGS.reduce((sum, word) => sum + word.hold, 0) + .75;

type Group = { name: string; from: string; to?: string; elementStagger?: number };
type Beat = {
  duration: number;
  groups: Group[];
  /** Per-letter stagger, seconds. Set for text groups only. */
  stagger?: number;
};

const RISE = "translateY(22px)";
const FLAT = "translateY(0px)";
// Letters rise in em so the distance scales with each element's type size.
const LETTER_RISE = "translateY(0.45em)";
const LETTER_FLAT = "translateY(0em)";

const BEATS: Beat[] = [
  {
    duration: 0.45,
    groups: [
      { name: "gamepad", from: "translateY(24px) scale(0.94) rotate(-5deg)", to: "translateY(0px) scale(1) rotate(0deg)" },
      // Concurrent with the controller, not trailing the whole intro.
      { name: "nav", from: "translateY(-8px)" },
      { name: "studio", from: "translateY(18px) scale(0.97)", to: "translateY(0px) scale(1)", elementStagger: 0.07 },
    ],
  },
  { duration: 0.3, stagger: 0.028, groups: [{ name: "line-one", from: LETTER_RISE, to: LETTER_FLAT }] },
  { duration: 0.3, stagger: 0.028, groups: [{ name: "line-two", from: LETTER_RISE, to: LETTER_FLAT }] },
  // ~110 characters, so the stagger is small enough to read as one sweep.
  { duration: 0.26, stagger: 0.006, groups: [{ name: "description", from: LETTER_RISE, to: LETTER_FLAT }] },
  { duration: 0.2, groups: [{ name: "primary", from: "translateY(8px)" }] },
  { duration: 0.2, groups: [{ name: "secondary", from: "translateY(8px)" }] },
];
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// A text beat animates the letters inside its group; everything else animates
// the group elements themselves.
function targetsFor(beat: Beat, group: Group): HTMLElement[] {
  const scope = `[data-hero-enter="${group.name}"]`;
  const selector = beat.stagger === undefined ? scope : `${scope} [data-reveal-letter]`;
  return Array.from(document.querySelectorAll<HTMLElement>(selector));
}

/** Real wall-clock length, including each text beat's last letter delay. */
function measureDuration(): number {
  const seconds = Object.values(IDENTITY).reduce((a, b) => a + b, 0)
    + BEATS.reduce((sum, beat) => {
      const longest = Math.max(
        ...beat.groups.map(group => {
          const count = targetsFor(beat, group).length;
          const spacing = group.elementStagger ?? beat.stagger ?? 0;
          return count > 1 ? (count - 1) * spacing : 0;
        }),
        0,
      );
      return sum + beat.duration + longest;
    }, 0);
  return Math.round(seconds * 1000);
}

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
        if (!intro!.start(measureDuration() + PRELOADER_DURATION * 1000)) return;
        owned = true;
        intro!.cancel = () => controls?.stop();
        const preloader = document.querySelector<HTMLElement>("[data-greeting-preloader]");
        const greeting = document.querySelector<HTMLElement>("[data-greeting-word]");
        const curve = document.querySelector<SVGPathElement>("[data-greeting-curve]");
        if (preloader && greeting && curve) {
          for (const word of GREETINGS) {
            greeting.textContent = word.text;
            greeting.lang = word.lang;
            controls = animate(0, 1, { duration: word.hold });
            await controls;
            if (!running()) return;
          }
          const exit = animate(preloader, { transform: ["translateY(0%)", "translateY(-120%)"] }, { duration: .75, ease: [0.77, 0, 0.175, 1] });
          const flatten = animate(curve, { d: ["M0 0 H1000 V0 Q500 280 0 0 Z", "M0 0 H1000 V0 Q500 0 0 0 Z"] }, { duration: .75, ease: EASE_OUT });
          intro!.cancel = () => { exit.stop(); flatten.stop(); };
          await Promise.all([exit, flatten]);
          if (!running()) return;
          preloader.style.visibility = "hidden";
          intro!.cancel = () => controls?.stop();
        }
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
          // Every group in a beat plays at once; the beat ends with the last.
          const plays = beat.groups.map(group => {
            const targets = targetsFor(beat, group);
            if (!targets.length) return null;
            return animate(targets, {
              opacity: [0, 1],
              transform: [group.from, group.to ?? FLAT],
            }, {
              duration: beat.duration,
              ease: EASE_OUT,
              ...((group.elementStagger ?? beat.stagger)
                ? { delay: stagger(group.elementStagger ?? beat.stagger!) } : {}),
            });
          }).filter(Boolean) as ReturnType<typeof animate>[];
          controls = plays[0];
          intro!.cancel = () => plays.forEach(play => play.stop());
          await Promise.all(plays);
          if (!running()) return;
          // Make a group interactive only once it is visible. Keyboard focus
          // still uses the bootstrap's synchronous finish handler at any time.
          beat.groups.forEach(group => {
            document.querySelectorAll<HTMLElement>(`[data-hero-enter="${group.name}"]`)
              .forEach(element => { element.style.pointerEvents = "auto"; });
          });
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
