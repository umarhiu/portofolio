"use client";

import { useEffect, useRef } from "react";

/*
  Pixelated hover grid. Adapted from the "background boxes" component, with three
  changes for this project:
  - FLAT, not the skewed/isometric transform from the original.
  - Reimplemented on a single <canvas> instead of ~15,000 motion.div cells (which
    would tank the page). Hover is computed from the pointer position via a window
    listener, so the canvas stays pointer-events:none and never blocks the CTA or
    gets blocked by the text layer above it.
  - Cells light only in LOCKED palette colors read from the CSS tokens (accent /
    drafting-blue / vellum), so it can never drift from the brand. Amber is the
    one bright accent; drafting-blue belongs to the grid/foundation layer; vellum
    is neutral. No neon, no purple.

  Behavior: the cell under the cursor lights instantly and fades over ~1.4s,
  leaving a colored trail. The static grid is cached to an offscreen bitmap and
  composited each frame. Paused off-screen and when `active` is false;
  reduced-motion paints a static grid only.
*/

const CELL = 46;
const FADE = 1.4; // seconds for a lit cell to fade out
const MAX_ALPHA = 0.82;

const hexToRgb = (hex: string): string | null => {
  const h = hex.trim().replace("#", "");
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return [r, g, b].some(Number.isNaN) ? null : `${r}, ${g}, ${b}`;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b].some(Number.isNaN) ? null : `${r}, ${g}, ${b}`;
  }
  return null;
};

const token = (name: string, fallback: string): string => {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && hexToRgb(v)) || fallback;
  } catch {
    return fallback;
  }
};

export function Boxes({
  active = true,
  className = "",
}: {
  active?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Locked palette, read from the CSS tokens so the grid can never drift.
    const PALETTE = [
      token("--color-accent", "255, 106, 26"), // amber (the one bright accent)
      token("--color-drafting", "58, 90, 120"), // drafting-blue (grid layer)
      token("--color-vellum", "236, 231, 221"), // vellum (neutral)
    ];
    const GRID_LINE = `rgba(${token("--color-graphite", "126, 132, 143")}, 0.10)`;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let running = false;
    let onscreen = true;
    let last = 0;
    let rectLeft = 0;
    let rectTop = 0;
    const grid = document.createElement("canvas");
    const gctx = grid.getContext("2d");
    // key "col,row" -> { c, v, col, row }
    const lit = new Map<string, { c: string; v: number; col: number; row: number }>();

    const pickColor = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];

    const syncRect = () => {
      const r = canvas.getBoundingClientRect();
      rectLeft = r.left;
      rectTop = r.top;
    };

    const drawGridBitmap = () => {
      if (!gctx) return;
      grid.width = Math.round(w * dpr);
      grid.height = Math.round(h * dpr);
      gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gctx.clearRect(0, 0, w, h);
      gctx.strokeStyle = GRID_LINE;
      gctx.lineWidth = 1;
      gctx.beginPath();
      for (let x = 0; x <= cols; x++) {
        const px = Math.round(x * CELL) + 0.5;
        gctx.moveTo(px, 0);
        gctx.lineTo(px, h);
      }
      for (let y = 0; y <= rows; y++) {
        const py = Math.round(y * CELL) + 0.5;
        gctx.moveTo(0, py);
        gctx.lineTo(w, py);
      }
      gctx.stroke();
    };

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      lit.forEach((cell) => {
        ctx.fillStyle = `rgba(${cell.c}, ${(cell.v * MAX_ALPHA).toFixed(3)})`;
        ctx.fillRect(cell.col * CELL, cell.row * CELL, CELL, CELL);
      });
      if (gctx) ctx.drawImage(grid, 0, 0, w, h);
    };

    const tick = (ts: number) => {
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      syncRect(); // once per frame, not per pointer move
      lit.forEach((cell, key) => {
        cell.v -= dt / FADE;
        if (cell.v <= 0.02) lit.delete(key);
      });
      paint();
      if (lit.size > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        raf = 0;
      }
    };

    const ensureRunning = () => {
      if (running || !onscreen) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      rectLeft = rect.left;
      rectTop = rect.top;
      if (w === 0 || h === 0) return; // wait for a real size (ResizeObserver)
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawGridBitmap();
      paint();
    };

    const onMove = (e: PointerEvent) => {
      if (!activeRef.current || !onscreen) return;
      const x = e.clientX - rectLeft;
      const y = e.clientY - rectTop;
      if (x < 0 || y < 0 || x > w || y > h) return;
      const col = Math.floor(x / CELL);
      const row = Math.floor(y / CELL);
      const key = `${col},${row}`;
      const existing = lit.get(key);
      if (existing) existing.v = 1;
      else lit.set(key, { c: pickColor(), v: 1, col, row });
      ensureRunning();
    };

    build();

    if (reduced) {
      const ro = new ResizeObserver(build);
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => {
        onscreen = entry.isIntersecting;
        if (onscreen) {
          syncRect();
          if (lit.size > 0) ensureRunning();
          else paint();
        } else {
          running = false;
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
