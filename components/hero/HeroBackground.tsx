"use client";

import { useEffect, useRef } from "react";

/*
  Interactive dot-matrix behind hero state 01: the systems motif, structure
  beneath the surface. Dots brighten and grow near the cursor, with a faint
  idle shimmer so it moves even at rest. Masked to fade out on the left so it
  never competes with the bottom-left headline. Canvas + rAF + a pointer ref
  (no React state per frame), paused when off-screen, disabled under reduced
  motion.
*/
export function HeroBackground() {
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
    const GAP = 34; // dot spacing
    const RADIUS = 150; // cursor influence radius
    const pointer = { x: -9999, y: -9999, active: false };
    let dots: { x: number; y: number }[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let t = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) dots.push({ x, y });
      }
    };
    build();

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        let prox = 0;
        if (pointer.active) {
          const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
          prox = Math.max(0, 1 - dist / RADIUS);
          prox *= prox; // ease the falloff
        }
        const idle = 0.1 + 0.05 * Math.sin(t * 1.3 + d.x * 0.012 + d.y * 0.012);
        const alpha = Math.min(0.85, idle + prox * 0.75);
        const r = 1 + prox * 2.4;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(236, 231, 221, ${alpha})`; // vellum
        ctx.fill();
      }
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
          "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 30%, #000 58%)",
        maskImage:
          "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 30%, #000 58%)",
      }}
    />
  );
}
