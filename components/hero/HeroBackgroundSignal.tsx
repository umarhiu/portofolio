"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/*
  Background for hero state 03 ("A dashboard is only as honest as its data. I
  model the source of truth before the first pixel."). The animation performs
  the sentence: an axis and grid draw in (structure before the first pixel),
  raw scattered points arrive with blue deviation bars (unvalidated data), then
  a clean trend line draws through them and the points snap onto it as the noise
  collapses (modeling the source of truth). One amber node resolves as the
  validated reading, then a quiet idle keeps it alive.

  Pure SVG + a single GSAP timeline (no canvas, no scroll plugin). Plays when
  state 03 becomes the active state (`active`), and reverts when it leaves so it
  replays on each visit, matching the per-state text entrance. Reduced-motion
  paints the resolved end state with no timeline. Masked to fade out before the
  right-aligned headline.
*/

const VELLUM = "236, 231, 221";
const GRAPHITE = "126, 132, 143";
const AMBER = "255, 106, 26";
const BLUE = "58, 90, 120";

const W = 660;
const H = 420;
const PAD_L = 70;
const PAD_R = 70;
const TOP = 86;
const BOTTOM = 320;
const N = 12;

// Deterministic geometry (no Math.random, so it is stable). The "true" series
// rises and eases off; raw points deviate from it by a fixed pseudo jitter.
const POINTS = Array.from({ length: N }, (_, i) => {
  const x = PAD_L + (i * (W - PAD_L - PAD_R)) / (N - 1);
  const tNorm = i / (N - 1);
  const rise = 1 - Math.pow(1 - tNorm, 1.8);
  const wiggle = Math.sin(tNorm * Math.PI * 3) * 7;
  const trueY = BOTTOM - rise * (BOTTOM - TOP) + wiggle;
  const seed = Math.sin(i * 127.1) * 43758.5453;
  const r = seed - Math.floor(seed); // 0..1
  const jitter = (r - 0.5) * 76;
  const rawY = Math.min(BOTTOM + 6, Math.max(TOP - 18, trueY + jitter));
  return { x, trueY, rawY };
});

const LAST = POINTS[N - 1];
const TREND_POINTS = POINTS.map((p) => `${p.x.toFixed(1)},${p.trueY.toFixed(1)}`).join(" ");
const GRID_YS = [0.25, 0.5, 0.75].map((f) => TOP + f * (BOTTOM - TOP));

const MASK =
  "linear-gradient(to right, #000 0%, #000 52%, rgba(0,0,0,0.45) 66%, transparent 82%)";

export function HeroBackgroundSignal({ active = false }: { active?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;
      const q = gsap.utils.selector(svg);

      const axis = q(".sig-axis")[0] as unknown as SVGGeometryElement;
      const trend = q(".sig-trend")[0] as unknown as SVGGeometryElement;
      const guide = q(".sig-guide")[0] as unknown as SVGGeometryElement;
      const grids = q(".sig-grid");
      const dots = q(".sig-dot");
      const errs = q(".sig-err");
      const node = q(".sig-node")[0];
      const ring = q(".sig-ring")[0];
      const scan = q(".sig-scan")[0];

      // Prime the stroke-draw paths (dasharray = length, offset = length).
      const draws = [axis, trend, guide];
      draws.forEach((el) => {
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      });

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !active) {
        // Resolved end state (also the idle base while not active).
        gsap.set(draws, { strokeDashoffset: 0 });
        gsap.set(grids, { opacity: 0.45 });
        dots.forEach((d, i) => gsap.set(d, { attr: { cy: POINTS[i].trueY }, opacity: 0.9 }));
        gsap.set(errs, { opacity: 0 });
        gsap.set(node, { opacity: 1 });
        gsap.set(ring, { opacity: 0 });
        gsap.set(guide, { opacity: 0.32 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // 1. Structure: axis + grid draw in.
      tl.to(axis, { strokeDashoffset: 0, duration: 0.6 })
        .to(grids, { opacity: 0.45, duration: 0.4, stagger: 0.08 }, "<0.1")

        // 2. Raw, unvalidated data: scattered points + blue deviation bars.
        .to(
          dots,
          { opacity: 0.85, duration: 0.4, stagger: { each: 0.045, from: "random" } },
          "-=0.15",
        )
        .to(errs, { opacity: 0.5, duration: 0.35, stagger: { each: 0.045 } }, "<")

        // 3. The source of truth: trend draws, points snap on, noise collapses.
        .to(trend, { strokeDashoffset: 0, duration: 0.75, ease: "power1.inOut" }, "+=0.1")
        .to(
          dots,
          {
            attr: { cy: (i: number) => POINTS[i].trueY },
            duration: 0.7,
            ease: "power3.inOut",
            stagger: { each: 0.03 },
          },
          "-=0.25",
        )
        .to(
          errs,
          {
            attr: { y1: (i: number) => POINTS[i].trueY },
            opacity: 0,
            duration: 0.7,
            ease: "power3.inOut",
            stagger: { each: 0.03 },
          },
          "<",
        )

        // 4. The validated reading.
        .to(node, { opacity: 1, duration: 0.3 }, "-=0.2")
        .fromTo(
          node,
          { scale: 0 },
          { scale: 1, duration: 0.5, ease: "back.out(2)", svgOrigin: `${LAST.x} ${LAST.trueY}` },
          "<",
        )
        .to(guide, { strokeDashoffset: 0, opacity: 0.32, duration: 0.5 }, "<0.05")

        // 5. Idle: the reading pulses and a slow scanline sweeps.
        .add(() => {
          gsap.fromTo(
            ring,
            { scale: 0.5, opacity: 0.55, svgOrigin: `${LAST.x} ${LAST.trueY}` },
            { scale: 2.4, opacity: 0, duration: 2.4, ease: "power1.out", repeat: -1 },
          );
          gsap.fromTo(
            scan,
            { x: 0, opacity: 0 },
            {
              x: W - PAD_L - PAD_R,
              opacity: 0.22,
              duration: 6,
              ease: "none",
              repeat: -1,
              yoyo: true,
            },
          );
        });
    },
    { scope: ref, dependencies: [active], revertOnUpdate: true },
  );

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ WebkitMaskImage: MASK, maskImage: MASK }}
    >
      {/* axis: left vertical + bottom horizontal */}
      <path
        className="sig-axis"
        d={`M ${PAD_L} ${TOP - 10} L ${PAD_L} ${BOTTOM} L ${W - PAD_R + 10} ${BOTTOM}`}
        fill="none"
        stroke={`rgba(${GRAPHITE}, 0.55)`}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      {/* faint gridlines */}
      {GRID_YS.map((y, i) => (
        <line
          key={i}
          className="sig-grid"
          x1={PAD_L}
          y1={y}
          x2={W - PAD_R}
          y2={y}
          stroke={`rgba(${VELLUM}, 0.12)`}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          opacity={0}
        />
      ))}

      {/* validated reading guide (node back to the axis) */}
      <line
        className="sig-guide"
        x1={LAST.x}
        y1={LAST.trueY}
        x2={PAD_L}
        y2={LAST.trueY}
        stroke={`rgba(${AMBER}, 0.5)`}
        strokeWidth={1}
        strokeDasharray="3 4"
        vectorEffect="non-scaling-stroke"
        opacity={0}
      />

      {/* blue deviation bars (raw error from the truth) */}
      {POINTS.map((p, i) => (
        <line
          key={i}
          className="sig-err"
          x1={p.x}
          y1={p.rawY}
          x2={p.x}
          y2={p.trueY}
          stroke={`rgba(${BLUE}, 0.85)`}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          opacity={0}
        />
      ))}

      {/* the trend line (source of truth) */}
      <polyline
        className="sig-trend"
        points={TREND_POINTS}
        fill="none"
        stroke={`rgba(${VELLUM}, 0.85)`}
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* data points */}
      {POINTS.map((p, i) => (
        <circle
          key={i}
          className="sig-dot"
          cx={p.x}
          cy={p.rawY}
          r={3}
          fill={`rgba(${VELLUM}, 0.92)`}
          opacity={0}
        />
      ))}

      {/* idle scanline */}
      <rect
        className="sig-scan"
        x={PAD_L}
        y={TOP - 10}
        width={1.5}
        height={BOTTOM - TOP + 10}
        fill={`rgba(${AMBER}, 1)`}
        opacity={0}
      />

      {/* validated node + pulse ring */}
      <circle
        className="sig-ring"
        cx={LAST.x}
        cy={LAST.trueY}
        r={6}
        fill="none"
        stroke={`rgba(${AMBER}, 0.9)`}
        strokeWidth={1.25}
        vectorEffect="non-scaling-stroke"
        opacity={0}
      />
      <circle
        className="sig-node"
        cx={LAST.x}
        cy={LAST.trueY}
        r={4.5}
        fill={`rgba(${AMBER}, 1)`}
        opacity={0}
      />
    </svg>
  );
}
