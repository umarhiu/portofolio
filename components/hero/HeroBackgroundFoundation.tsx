"use client";

import { useEffect, useRef } from "react";

/*
  Background for hero state 02 ("It starts at the Foundation. The grid, the
  spacing scale, the rules everything inherits."). A "living token shelf": the
  design system's own foundation tokens rendered as a quiet spec sheet in the
  lower-right: the brand COLOR SWATCHES, a SPACING-SCALE ladder, and a TYPE-SCALE
  ramp. An amber active-value indicator sweeps the spacing ladder; swatches
  breathe; hovering a token reveals its exact value (hex / px). It illustrates
  the words instead of decorating them, and brings real color by showing the
  brand palette itself.

  Canvas + rAF + pointer ref (no per-frame React state), DPR capped, paused
  off-screen, reduced-motion paints one static frame. Masked to fade out of the
  top-left so the ghost headline stays clean.
*/

const VELLUM = "236, 231, 221";
const GRAPHITE = "126, 132, 143";
const AMBER = "255, 106, 26";
const BLUE = "58, 90, 120";
const HAIRLINE = "42, 46, 52";

const SPACING = [4, 8, 12, 16, 24, 32, 48];
const TYPE_TIERS = [
  { name: "caption", px: 12 },
  { name: "body", px: 16 },
  { name: "display", px: 28 },
];
const SWATCHES = [
  { rgb: BLUE, slug: "blue.500", hex: "#3A5A78" },
  { rgb: GRAPHITE, slug: "ink.400", hex: "#7E848F" },
  { rgb: VELLUM, slug: "paper.100", hex: "#ECE7DD" },
  { rgb: AMBER, slug: "accent.500", hex: "#FF6A1A" },
];

const MASK =
  "linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.12) 30%, #000 58%)";

const easeInOut = (x: number) =>
  x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

type Rect = { x: number; y: number; w: number; h: number };

export function HeroBackgroundFoundation() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999, active: false };
    const mono =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-jetbrains-mono")
        .trim() || 'ui-monospace, "SFMono-Regular", monospace';

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let t = 0;
    let labelPx = 11;
    let showLabels = true;
    let contentX = 0;
    let sheet: Rect = { x: 0, y: 0, w: 0, h: 0 };
    let railX = 0;
    let baselineY = 0;
    let div1 = 0;
    let div2 = 0;

    type Swatch = Rect & { rgb: string; slug: string; hex: string };
    type Rung = Rect & { px: number; barW: number; cy: number };
    type Tier = Rect & { name: string; px: number };
    let swatches: Swatch[] = [];
    let rungs: Rung[] = [];
    let tiers: Tier[] = [];

    // sweep state
    let sweepIndex = 3;
    let sweepFrom = 3;
    let sweepPhase = 0;
    let sweepResting = true;
    let readoutA = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      labelPx = Math.max(10.5, 11);
      showLabels = labelPx * dpr >= 10;

      const marginR = Math.max(28, w * 0.05);
      const marginB = Math.max(28, h * 0.07);
      sheet.w = Math.min(w * 0.4, 460);
      sheet.h = Math.min(h * 0.62, 520);
      sheet.x = Math.max(w - marginR - sheet.w, w * 0.52);
      sheet.y = Math.max(h - marginB - sheet.h, h * 0.34);
      railX = sheet.x;
      contentX = railX + 22;
      const contentW = sheet.x + sheet.w - contentX;

      const GAP = 26;
      const usable = sheet.h - GAP * 2;
      const bandSwatch = usable * 0.42;
      const bandLadder = usable * 0.36;
      const bandType = usable * 0.22;
      div1 = sheet.y + bandSwatch + GAP / 2;
      div2 = sheet.y + bandSwatch + GAP + bandLadder + GAP / 2;

      // swatches
      const chip = Math.min(28, (bandSwatch / SWATCHES.length) * 0.62);
      const chipX = sheet.x + sheet.w - chip;
      const rowH = bandSwatch / SWATCHES.length;
      swatches = SWATCHES.map((s, i) => ({
        x: chipX,
        y: sheet.y + i * rowH + (rowH - chip) / 2,
        w: chip,
        h: chip,
        rgb: s.rgb,
        slug: s.slug,
        hex: s.hex,
      }));

      // ladder
      const ladderTop = sheet.y + bandSwatch + GAP;
      const maxBarW = contentW * 0.72;
      const rungH = bandLadder / SPACING.length;
      const maxVal = SPACING[SPACING.length - 1];
      rungs = SPACING.map((px, i) => {
        const cy = ladderTop + i * rungH + rungH / 2;
        return {
          x: contentX,
          y: cy - rungH / 2,
          w: contentW,
          h: rungH,
          cy,
          barW: (px / maxVal) * maxBarW,
          px,
        };
      });

      // type ramp
      const typeTop = ladderTop + bandLadder + GAP;
      baselineY = typeTop + bandType * 0.66;
      const tierGap = 16;
      const tierW = Math.min(34, ((contentW - tierGap * 2) / 3) * 0.85);
      tiers = TYPE_TIERS.map((tr, i) => {
        const blockH = (tr.px / 28) * (bandType * 0.5);
        return {
          x: contentX + i * (tierW + tierGap),
          y: baselineY - blockH,
          w: tierW,
          h: blockH,
          name: tr.name,
          px: tr.px,
        };
      });

      sweepIndex = Math.min(sweepIndex, SPACING.length - 1);
      sweepFrom = sweepIndex;
    };

    const hitTest = (px: number, py: number): string | null => {
      const pad = 8;
      const inside = (r: Rect) =>
        px >= r.x - pad &&
        px <= r.x + r.w + pad &&
        py >= r.y - pad &&
        py <= r.y + r.h + pad;
      for (let i = 0; i < swatches.length; i++) if (inside(swatches[i])) return "sw:" + i;
      for (let i = 0; i < rungs.length; i++) if (inside(rungs[i])) return "rung:" + i;
      for (let i = 0; i < tiers.length; i++) if (inside(tiers[i])) return "tier:" + i;
      return null;
    };

    const cornerBrackets = (r: Rect, a: number) => {
      const pad = 4;
      const T = 6;
      const x0 = r.x - pad;
      const y0 = r.y - pad;
      const x1 = r.x + r.w + pad;
      const y1 = r.y + r.h + pad;
      ctx.strokeStyle = `rgba(${AMBER}, ${0.9 * a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // tl
      ctx.moveTo(x0, y0 + T); ctx.lineTo(x0, y0); ctx.lineTo(x0 + T, y0);
      // tr
      ctx.moveTo(x1 - T, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + T);
      // bl
      ctx.moveTo(x0, y1 - T); ctx.lineTo(x0, y1); ctx.lineTo(x0 + T, y1);
      // br
      ctx.moveTo(x1 - T, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 - T);
      ctx.stroke();
    };

    const paint = (animated: boolean) => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${labelPx}px ${mono}`;
      ctx.textBaseline = "middle";

      // hover resolution
      const hoverId = animated && pointer.active ? hitTest(pointer.x, pointer.y) : null;
      const hoverRung =
        hoverId && hoverId.startsWith("rung:") ? parseInt(hoverId.slice(5), 10) : -1;
      if (animated) {
        readoutA += ((hoverId ? 1 : 0) - readoutA) * 0.2;
      }

      // advance sweep (paused while hovering a rung)
      if (animated && hoverRung < 0) {
        const restF = 900 / 16;
        const glideF = 380 / 16;
        sweepPhase += 1 / (sweepResting ? restF : glideF);
        if (sweepPhase >= 1) {
          sweepPhase = 0;
          if (sweepResting) {
            sweepResting = false;
            sweepFrom = sweepIndex;
            sweepIndex = (sweepIndex + 1) % SPACING.length;
          } else {
            sweepResting = true;
          }
        }
      }
      const activeRung = hoverRung >= 0 ? hoverRung : sweepIndex;

      // left tick-rail
      ctx.fillStyle = `rgba(${VELLUM}, 0.3)`;
      ctx.fillRect(Math.round(railX) + 0.5, sheet.y, 1, sheet.h);
      // dividers
      ctx.fillStyle = `rgba(${HAIRLINE}, 0.9)`;
      ctx.fillRect(contentX, Math.round(div1) + 0.5, sheet.x + sheet.w - contentX, 1);
      ctx.fillRect(contentX, Math.round(div2) + 0.5, sheet.x + sheet.w - contentX, 1);

      // swatches
      for (let i = 0; i < swatches.length; i++) {
        const s = swatches[i];
        const isHover = hoverId === "sw:" + i;
        const breathe = animated
          ? 0.78 + 0.22 * (0.5 + 0.5 * Math.sin((t / 6) * Math.PI * 2 + i * 1.1))
          : 1;
        const alpha = isHover ? 1 : breathe;
        ctx.fillStyle = `rgba(${s.rgb}, ${alpha})`;
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(s.x, s.y, s.w, s.h, 3);
          ctx.fill();
        } else {
          ctx.fillRect(s.x, s.y, s.w, s.h);
        }
        if (showLabels) {
          ctx.textAlign = "right";
          ctx.fillStyle = `rgba(${VELLUM}, ${isHover ? 0.55 : 0.42})`;
          ctx.fillText(s.slug, s.x - 10, s.y + s.h / 2);
        }
      }

      // spacing ladder
      for (let i = 0; i < rungs.length; i++) {
        const r = rungs[i];
        const isActive = i === activeRung;
        ctx.fillStyle = `rgba(${VELLUM}, ${isActive ? 1 : 0.2})`;
        ctx.fillRect(r.x, r.cy - 1.5, r.barW, 3);
        if (showLabels) {
          ctx.textAlign = "right";
          ctx.fillStyle = `rgba(${VELLUM}, ${isActive ? 0.85 : 0.32})`;
          ctx.fillText(`${r.px}`, sheet.x + sheet.w, r.cy);
        }
      }

      // amber active-value sweep tick under the active rung
      const fromY = rungs[sweepFrom]?.cy ?? rungs[activeRung].cy;
      const toY = rungs[sweepIndex].cy;
      const sweepY =
        hoverRung >= 0
          ? rungs[hoverRung].cy
          : sweepResting || !animated
            ? toY
            : fromY + (toY - fromY) * easeInOut(sweepPhase);
      const ar = rungs[activeRung];
      ctx.fillStyle = `rgba(${AMBER}, 0.9)`;
      ctx.fillRect(ar.x - 1, sweepY + 4, ar.barW + 2, 1.5);
      ctx.fillRect(ar.x - 4, sweepY - 1, 2.5, 2.5);

      // type ramp on baseline
      ctx.fillStyle = `rgba(${VELLUM}, 0.22)`;
      ctx.fillRect(contentX, Math.round(baselineY) + 0.5, sheet.x + sheet.w - contentX, 1);
      for (let i = 0; i < tiers.length; i++) {
        const tr = tiers[i];
        const isHover = hoverId === "tier:" + i;
        ctx.fillStyle = `rgba(${VELLUM}, ${isHover ? 0.92 : 0.62})`;
        ctx.fillRect(tr.x, tr.y, tr.w, tr.h);
        if (showLabels) {
          ctx.textAlign = "left";
          ctx.fillStyle = `rgba(${VELLUM}, ${isHover ? 0.55 : 0.38})`;
          ctx.fillText(`${tr.px}`, tr.x, baselineY + labelPx + 2);
        }
      }
      // amber caret under the aligned tier
      const caretTier = tiers[Math.floor((activeRung / SPACING.length) * tiers.length)] ?? tiers[1];
      const caretA = animated ? 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * Math.PI * 1.4)) : 0.5;
      ctx.fillStyle = `rgba(${AMBER}, ${caretA})`;
      ctx.fillRect(caretTier.x, baselineY + 2, 1.5, 7);

      // hover readout + bracket
      if (animated && hoverId && readoutA > 0.01) {
        let r: Rect | null = null;
        let text = "";
        if (hoverId.startsWith("sw:")) {
          const s = swatches[+hoverId.slice(3)];
          r = s;
          text = s.hex;
        } else if (hoverId.startsWith("rung:")) {
          const ru = rungs[+hoverId.slice(5)];
          r = { x: ru.x, y: ru.cy - 1.5, w: ru.barW, h: 3 };
          text = `${ru.px}px`;
        } else if (hoverId.startsWith("tier:")) {
          const tr = tiers[+hoverId.slice(5)];
          r = tr;
          text = `${tr.px} / ${tr.name}`;
        }
        if (r) {
          cornerBrackets(r, readoutA);
          ctx.fillStyle = `rgba(${AMBER}, ${readoutA})`;
          let rx = r.x + r.w + 12;
          const ry = r.y + r.h / 2;
          ctx.textAlign = "left";
          if (rx + 80 > w) {
            rx = r.x - 12;
            ctx.textAlign = "right";
          }
          ctx.fillText(text, Math.max(rx, contentX), ry);
        }
      }
    };

    const frame = () => {
      paint(true);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    build();

    if (reduced) {
      paint(false);
      const ro = new ResizeObserver(() => {
        build();
        paint(false);
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

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
      style={{ WebkitMaskImage: MASK, maskImage: MASK }}
    />
  );
}
