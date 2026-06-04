"use client";

import { useEffect, useRef } from "react";

/*
  Background for hero state 03 ("A dashboard is only as honest as its data. I
  model the source of truth before the first pixel."). Several thin tributary
  streams enter from the left, fan in, and converge into a single amber node
  (the source of truth). Data packets ride the streams toward the node; each
  arrival pulses the node, and one trunk line carries the outflow rightward
  where it dissolves into the mask (feeding the dashboard / headline). The
  cursor acts as a flow regulator: the nearest streams brighten and speed up.

  Canvas + rAF + pointer ref (no per-frame React state), DPR capped, paused
  off-screen, disabled under reduced motion. Masked to fade out before the
  right-aligned headline.
*/

const VELLUM = "236, 231, 221";
const AMBER = "255, 106, 26";
const BLUE = "58, 90, 120";

const STREAM_COUNT = 6;
const NODE_X_FRAC = 0.32;
const NODE_Y_FRAC = 0.5;
const NODE_R = 5;
const FALLOFF_R = 16;
const INFLUENCE_R = 150; // matches the dot-matrix radius for cohesion
const PACKET_LEN = 13;
const TAIL_SEGS = 3;

type Curve = {
  p0x: number;
  p0y: number;
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
};

type Stream = Curve & {
  speed: number;
  baseAlpha: number;
  curBoost: number;
  len: number;
  packets: { t: number }[];
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const qx = (c: Curve, t: number) => {
  const u = 1 - t;
  return u * u * c.p0x + 2 * u * t * c.p1x + t * t * c.p2x;
};
const qy = (c: Curve, t: number) => {
  const u = 1 - t;
  return u * u * c.p0y + 2 * u * t * c.p1y + t * t * c.p2y;
};

export function HeroBackgroundData() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999, active: false };
    let streams: Stream[] = [];
    let trunk: Curve = { p0x: 0, p0y: 0, p1x: 0, p1y: 0, p2x: 0, p2y: 0 };
    let trunkT = 0;
    let nx = 0;
    let ny = 0;
    let nodeFalloff: CanvasGradient | null = null;
    let nodePulse = 0;
    let lastPulse = -999;
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let t = 0;

    const curveLen = (c: Curve) => {
      let len = 0;
      let px = qx(c, 0);
      let py = qy(c, 0);
      for (let s = 1; s <= 8; s++) {
        const cx = qx(c, s / 8);
        const cy = qy(c, s / 8);
        len += Math.hypot(cx - px, cy - py);
        px = cx;
        py = cy;
      }
      return len;
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nx = w * NODE_X_FRAC;
      ny = h * NODE_Y_FRAC;

      streams = [];
      for (let i = 0; i < STREAM_COUNT; i++) {
        const frac = (i + 0.5) / STREAM_COUNT;
        const p0x = -20;
        const p0y = h * (0.1 + 0.8 * frac);
        const c: Stream = {
          p0x,
          p0y,
          p1x: p0x + (nx - p0x) * 0.45,
          p1y: p0y + (ny - p0y) * 0.3,
          p2x: nx,
          p2y: ny,
          speed: 1 / (6 + 3 * frac),
          baseAlpha: 0.1 + 0.06 * frac,
          curBoost: 0,
          len: 1,
          packets: [],
        };
        c.len = curveLen(c);
        const count = 2 + (i % 2);
        const phase = (i * 0.37) % 1;
        for (let k = 0; k < count; k++) {
          c.packets.push({ t: (k / count + phase) % 1 });
        }
        streams.push(c);
      }

      trunk = {
        p0x: nx,
        p0y: ny,
        p1x: nx + (w * 0.7 - nx) * 0.5,
        p1y: ny - 6,
        p2x: w * 0.7,
        p2y: ny,
      };
      trunkT = 0;

      nodeFalloff = ctx.createRadialGradient(nx, ny, 0, nx, ny, FALLOFF_R);
      nodeFalloff.addColorStop(0, `rgba(${AMBER}, 0.28)`);
      nodeFalloff.addColorStop(0.5, `rgba(${AMBER}, 0.1)`);
      nodeFalloff.addColorStop(1, `rgba(${AMBER}, 0)`);
    };
    build();

    const firePulse = () => {
      let gap = 0.35;
      if (pointer.active && Math.hypot(nx - pointer.x, ny - pointer.y) < INFLUENCE_R) {
        gap = 0.18;
      }
      if (t - lastPulse < gap) return;
      lastPulse = t;
      nodePulse = Math.min(1, nodePulse + 0.8);
    };

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // tributary streams
      for (const s of streams) {
        let target = 0;
        if (pointer.active) {
          let prox = Math.max(
            0,
            1 - Math.hypot(s.p1x - pointer.x, s.p1y - pointer.y) / INFLUENCE_R,
          );
          prox *= prox;
          target = prox;
        }
        s.curBoost += (target - s.curBoost) * (target > s.curBoost ? 0.12 : 0.04);

        // hairline (warm vellum body)
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${VELLUM}, ${s.baseAlpha + s.curBoost * (0.34 - s.baseAlpha)})`;
        ctx.beginPath();
        ctx.moveTo(s.p0x, s.p0y);
        ctx.quadraticCurveTo(s.p1x, s.p1y, s.p2x, s.p2y);
        ctx.stroke();

        // raw/unvalidated upstream tint (cool blue, only the first stub)
        ctx.strokeStyle = `rgba(${BLUE}, ${0.06 + s.curBoost * 0.04})`;
        ctx.beginPath();
        ctx.moveTo(s.p0x, s.p0y);
        ctx.lineTo(qx(s, 0.12), qy(s, 0.12));
        ctx.stroke();

        // packets riding the stream
        const dt = PACKET_LEN / s.len;
        const headA = 0.55 + s.curBoost * 0.35;
        ctx.lineWidth = 1.5;
        for (const p of s.packets) {
          p.t += s.speed * (1 + s.curBoost * 0.6) * 0.016;
          if (p.t >= 1) {
            p.t -= 1;
            firePulse();
          }
          for (let seg = 0; seg < TAIL_SEGS; seg++) {
            const t1 = clamp01(p.t - seg * dt);
            const t2 = clamp01(p.t - (seg + 1) * dt);
            ctx.strokeStyle = `rgba(${AMBER}, ${headA * (1 - seg / TAIL_SEGS)})`;
            ctx.beginPath();
            ctx.moveTo(qx(s, t1), qy(s, t1));
            ctx.lineTo(qx(s, t2), qy(s, t2));
            ctx.stroke();
          }
        }
      }

      // trunk outflow (dissolves into the mask)
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(${VELLUM}, 0.16)`;
      ctx.beginPath();
      ctx.moveTo(trunk.p0x, trunk.p0y);
      ctx.quadraticCurveTo(trunk.p1x, trunk.p1y, trunk.p2x, trunk.p2y);
      ctx.stroke();
      trunkT += 0.1 * 0.016;
      if (trunkT >= 1) trunkT -= 1;
      ctx.strokeStyle = `rgba(${AMBER}, 0.7)`;
      ctx.beginPath();
      ctx.moveTo(qx(trunk, clamp01(trunkT - 0.04)), qy(trunk, clamp01(trunkT - 0.04)));
      ctx.lineTo(qx(trunk, trunkT), qy(trunk, trunkT));
      ctx.stroke();

      // node (source of truth), drawn on top
      nodePulse *= 0.9;
      const breathe = 0.5 + 0.5 * Math.sin(t * Math.PI * 1.2);
      if (nodeFalloff) {
        ctx.globalAlpha = Math.min(1, 0.55 + 0.18 * breathe + 0.4 * nodePulse);
        ctx.fillStyle = nodeFalloff;
        ctx.beginPath();
        ctx.arc(nx, ny, FALLOFF_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(${AMBER}, 0.9)`;
      ctx.beginPath();
      ctx.arc(nx, ny, NODE_R * (1 + 0.35 * nodePulse), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(${AMBER}, 0.9)`;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.6, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onBlur = () => {
      pointer.active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onBlur);
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, #000 0%, #000 48%, rgba(0,0,0,0.5) 62%, transparent 76%)",
        maskImage:
          "linear-gradient(to right, #000 0%, #000 48%, rgba(0,0,0,0.5) 62%, transparent 76%)",
      }}
    />
  );
}
