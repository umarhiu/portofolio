"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/*
  Background for hero state 04 ("Every state designed. Not just the happy path."
  spec: DEFAULT / HOVER / LOADING / ERROR / EMPTY). It performs the line: one
  component rendered across all five of its states, side by side, as a designer
  would lay them out. A Figma-style selection scans through them in sequence
  (the "current state"), the loading tile shimmers, and the error tile pulses as
  the selection lands on it.

  Dark UI tiles (elevated void surface + hairline) so it reads as real product
  UI, distinct from Hero 2's paper cards. Amber is reserved for the error state.
  GSAP (matches the hero). Reduced-motion paints the sheet static.
  pointer-events:none; headline + spec render on top.
*/

const STATES = ["DEFAULT", "HOVER", "LOADING", "ERROR", "EMPTY"] as const;
const STAGGER = [0, 24, 8, 28, 12]; // px, per-column vertical offset for composition
const ERROR_INDEX = 3;

const V = (a: number) => `rgba(236,231,221,${a})`; // vellum
const G = (a: number) => `rgba(126,132,143,${a})`; // graphite
const A = (a: number) => `rgba(255,106,26,${a})`; // amber
const HAIRLINE = "rgba(42,46,52,1)";

function Tile({ state }: { state: (typeof STATES)[number] }) {
  const base =
    "state-tile relative flex min-h-[116px] flex-col overflow-hidden rounded-[13px] border p-4";

  if (state === "HOVER") {
    return (
      <div className={base} style={{ width: 204, borderColor: V(0.3), background: V(0.07) }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: V(0.28) }} />
        <div className="mb-4 flex items-center justify-between">
          <div className="h-9 w-9 rounded-[6px]" style={{ background: V(0.2) }} />
          <div className="h-3 w-9 rounded-full" style={{ background: G(0.55) }} />
        </div>
        <div className="space-y-2.5">
          <div className="h-[9px] w-full rounded-full" style={{ background: V(0.34) }} />
          <div className="h-[9px] w-2/3 rounded-full" style={{ background: V(0.22) }} />
        </div>
      </div>
    );
  }

  if (state === "LOADING") {
    return (
      <div className={base} style={{ width: 204, borderColor: HAIRLINE, background: V(0.035) }}>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-9 w-9 rounded-[6px]" style={{ background: V(0.1) }} />
          <div className="h-3 w-9 rounded-full" style={{ background: V(0.08) }} />
        </div>
        <div className="space-y-2.5">
          <div className="h-[9px] w-full rounded-full" style={{ background: V(0.1) }} />
          <div className="h-[9px] w-2/3 rounded-full" style={{ background: V(0.1) }} />
        </div>
        <div
          className="state-shimmer pointer-events-none absolute inset-y-0 w-1/2"
          style={{
            background: "linear-gradient(100deg, transparent 30%, rgba(236,231,221,0.12) 50%, transparent 70%)",
          }}
        />
      </div>
    );
  }

  if (state === "ERROR") {
    return (
      <div className={base} style={{ width: 204, borderColor: A(0.6), background: A(0.06) }}>
        <div className="mb-4 flex items-center justify-between">
          <div className="state-error-mark relative flex h-9 w-9 items-center justify-center rounded-[7px]" style={{ background: A(0.2) }}>
            <span className="block h-4 w-[2.5px] rounded-full" style={{ background: A(0.95) }} />
            <span className="absolute bottom-[8px] block h-[2.5px] w-[2.5px] rounded-full" style={{ background: A(0.95) }} />
          </div>
          <div className="h-3 w-9 rounded-full" style={{ background: A(0.75) }} />
        </div>
        <div className="space-y-2.5">
          <div className="h-[9px] w-full rounded-full" style={{ background: A(0.5) }} />
          <div className="h-[9px] w-1/2 rounded-full" style={{ background: V(0.16) }} />
        </div>
      </div>
    );
  }

  if (state === "EMPTY") {
    return (
      <div
        className={`${base} items-center justify-center gap-2`}
        style={{ width: 204, borderColor: V(0.16), borderStyle: "dashed", background: "transparent" }}
      >
        <div className="h-10 w-10 rounded-[7px] border border-dashed" style={{ borderColor: V(0.2) }} />
        <div className="h-[8px] w-14 rounded-full" style={{ background: V(0.12) }} />
      </div>
    );
  }

  // DEFAULT
  return (
    <div className={base} style={{ width: 204, borderColor: HAIRLINE, background: V(0.035) }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="h-9 w-9 rounded-[6px]" style={{ background: V(0.14) }} />
        <div className="h-3 w-9 rounded-full" style={{ background: G(0.5) }} />
      </div>
      <div className="space-y-2">
        <div className="h-[9px] w-full rounded-full" style={{ background: V(0.24) }} />
        <div className="h-[9px] w-2/3 rounded-full" style={{ background: V(0.16) }} />
      </div>
    </div>
  );
}

export function HeroBackgroundStates({ active = false }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !active) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      const tiles = q(".state-tile") as unknown as HTMLElement[];
      const labels = q(".state-label");
      const cols = q(".state-col");
      const focus = q(".states-focus")[0] as HTMLElement;
      const shimmer = q(".state-shimmer");
      const PAD = 9;

      const placeFocus = (i: number, animated: boolean) => {
        const t = tiles[i];
        const vars = {
          x: t.offsetLeft - PAD,
          y: t.offsetTop - PAD,
          width: t.offsetWidth + PAD * 2,
          height: t.offsetHeight + PAD * 2,
          opacity: 1,
        };
        if (animated) gsap.to(focus, { ...vars, duration: 0.5, ease: "power3.inOut", overwrite: "auto" });
        else gsap.set(focus, vars);
        labels.forEach((lb, k) => {
          if (animated) gsap.to(lb, { opacity: k === i ? 1 : 0.4, duration: 0.35, overwrite: "auto" });
          else gsap.set(lb, { opacity: k === i ? 1 : 0.4 });
        });
      };

      if (reduce) {
        placeFocus(0, false);
        return;
      }

      gsap.from(cols, { opacity: 0, y: 18, duration: 0.5, ease: "power2.out", stagger: 0.06 });

      // Loading tile shimmer (continuous).
      if (shimmer[0]) {
        gsap.fromTo(
          shimmer[0],
          { xPercent: -130 },
          { xPercent: 290, duration: 1.5, ease: "power1.inOut", repeat: -1, repeatDelay: 0.5 },
        );
      }

      // Scan: a Figma-style selection steps through the states on a loop.
      const STEP = 1.5;
      placeFocus(0, false);
      gsap.set(focus, { opacity: 0 });
      const setActive = (i: number) => {
        placeFocus(i, true);
        if (i === ERROR_INDEX) {
          const mark = tiles[ERROR_INDEX].querySelector(".state-error-mark");
          if (mark) gsap.fromTo(mark, { scale: 1 }, { scale: 1.18, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "center" });
        }
      };
      const tl = gsap.timeline({ repeat: -1, delay: 0.7 });
      for (let i = 0; i < tiles.length; i++) tl.call(setActive, [i], i * STEP);
      tl.to({}, { duration: STEP }, (tiles.length - 1) * STEP);
    },
    { scope: ref, dependencies: [active], revertOnUpdate: true },
  );

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[26%] flex justify-center px-6">
      <div className="states-row relative flex items-start gap-7">
        {/* Figma-style selection that scans the states */}
        <div className="states-focus absolute left-0 top-0 rounded-[15px]" style={{ border: `1px solid ${V(0.5)}`, opacity: 0 }}>
          {[
            "left-[-4px] top-[-4px]",
            "right-[-4px] top-[-4px]",
            "left-[-4px] bottom-[-4px]",
            "right-[-4px] bottom-[-4px]",
          ].map((pos, k) => (
            <span key={k} className={`absolute h-[7px] w-[7px] rounded-[1px] ${pos}`} style={{ background: V(0.85) }} />
          ))}
        </div>

        {STATES.map((s, i) => (
          <div key={s} className="state-col flex flex-col items-center gap-4" style={{ marginTop: STAGGER[i] }}>
            <Tile state={s} />
            <div className="state-label font-mono text-[12px] uppercase tracking-[0.18em] text-vellum" style={{ opacity: 0.4 }}>
              {s}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
