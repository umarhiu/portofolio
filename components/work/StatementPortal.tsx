"use client";

import { useId, useLayoutEffect, useRef, type RefObject } from "react";
import type { MotionValue } from "motion/react";
import { interior } from "@/components/ui/glyph-portal";

// Inline adaptation of Glyph Portal © 2026 Christian Katzmann, MIT.
// The same measured-ink camera, but its opening is the REAL statement text,
// not a second title screen. Positioning remains the only scroll clock.
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function StatementPortal({ source, progress, readingProgress, firstWord, wordStep }: {
  source: RefObject<HTMLSpanElement | null>;
  progress: MotionValue<number>;
  readingProgress: MotionValue<number>;
  firstWord: number;
  wordStep: number;
}) {
  const id = `statement-portal-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const layer = useRef<HTMLDivElement>(null);
  const clip = useRef<SVGGElement>(null);
  const zoomClip = useRef<SVGClipPathElement>(null);
  const mask = useRef<SVGMaskElement>(null);
  const glyph = useRef<SVGTextElement>(null);

  useLayoutEffect(() => {
    const element = layer.current;
    const text = source.current;
    if (!element || !text || !clip.current || !glyph.current) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    let disposed = false;
    let ready = false;
    let width = 1, height = 1, endScale = 1;
    let center = { x: 0, y: 0 };
    let target = { x: 0, y: 0, radius: 1 };
    const paint = () => {
      const p = clamp(progress.get());
      element.dataset.portalProgress = p.toFixed(5);
      if (!ready) return;
      for (const span of Array.from(glyph.current!.children)) {
        const index = Number(span.getAttribute("data-word"));
        const start = .08 + (firstWord + index) * wordStep;
        span.setAttribute("opacity", String(.18 + .82 * clamp((readingProgress.get() - start) / (wordStep * 1.5))));
      }
      const t = p;
      element.style.setProperty("--statement-gradient-opacity", String(1 - smooth(0, .65, t)));
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const scale = Math.exp(Math.log(endScale) * eased);
      const blend = (1 / scale - 1) / (1 / endScale - 1);
      const cx = center.x + (target.x - center.x) * blend;
      const cy = center.y + (target.y - center.y) * blend;
      const sx = center.x + (width / 2 - center.x) * eased;
      const sy = center.y + (height / 2 - center.y) * eased;
      const roll = -4 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t));
      // Scale the clip, not an HTML text bitmap: glyph edges stay sharp even
      // at the final camera scale. The measured solid ink covers every corner.
      const radians = roll * Math.PI / 180;
      // Test the viewport corners against the measured solid ink square.
      // The handoff cue starts when the camera actually covers the screen,
      // rather than waiting for an arbitrary scroll-progress threshold.
      const covered = [[0, 0], [width, 0], [0, height], [width, height]].every(([x, y]) => {
        const rx = (Math.cos(radians) * (x - sx) + Math.sin(radians) * (y - sy)) / scale + cx;
        const ry = (-Math.sin(radians) * (x - sx) + Math.cos(radians) * (y - sy)) / scale + cy;
        return Math.abs(rx - target.x) <= target.radius && Math.abs(ry - target.y) <= target.radius;
      });
      element.dataset.portalFilled = String(covered || p === 1);
      const dx = sx / scale, dy = sy / scale;
      clip.current!.setAttribute("transform", `scale(${scale}) rotate(${roll})`);
      zoomClip.current!.setAttribute("transform", `scale(${scale}) rotate(${roll})`);
      // Like upstream, keep translation text-local for WebKit's HTML clip
      // reference coordinates, including browser page zoom.
      glyph.current!.setAttribute("transform", `translate(${Math.cos(radians) * dx + Math.sin(radians) * dy - cx} ${-Math.sin(radians) * dx + Math.cos(radians) * dy - cy})`);
      // Alpha masks are rasterized and can lose the glyph at extreme zoom.
      // Once the reading reveal is complete, clip with the SAME SVG text:
      // vector clipping keeps the expanding ink intact at any camera scale.
      element.style.maskImage = t === 0 ? `url(#${id})` : "none";
      element.style.clipPath = t > 0 && t < 1 ? `url(#${id}-zoom)` : "none";
      element.style.visibility = "visible";
      // Keep HTML for layout and accessibility only. The same SVG renders
      // both the word-opacity reveal and the camera, with no render swap.
      text.style.color = "transparent";
      text.dataset.portalActive = "true";
    };
    const measure = () => {
      if (disposed) return;
      const frame = element.getBoundingClientRect();
      const bounds = text.getBoundingClientRect();
      const font = getComputedStyle(text);
      const size = parseFloat(font.fontSize);
      const baseline = text.querySelector("[data-portal-baseline]")!.getBoundingClientRect().top - frame.top;
      width = frame.width; height = frame.height;
      mask.current!.setAttribute("width", String(width));
      mask.current!.setAttribute("height", String(height));
      center = { x: bounds.left - frame.left + bounds.width / 2, y: bounds.top - frame.top + bounds.height / 2 };
      Object.assign(glyph.current!.style, {
        fontFamily: font.fontFamily, fontWeight: font.fontWeight,
        fontSize: `${size}px`, fontKerning: "none", letterSpacing: "0px",
      });
      glyph.current!.replaceChildren();
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let node: Node | null;
      let best = 0;
      // Per-character DOM ranges retain the approved wrapping, tracking and
      // word spacing. No guessed desktop offset and no font-metric jump.
      while ((node = walker.nextNode())) {
        const value = node.textContent ?? "";
        for (let i = 0; i < value.length; i++) {
          if (!value[i].trim()) continue;
          range.setStart(node, i); range.setEnd(node, i + 1);
          const x = range.getBoundingClientRect().left - frame.left;
          const char = font.textTransform === "uppercase" ? value[i].toUpperCase() : value[i];
          const span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
          span.setAttribute("x", String(x)); span.setAttribute("y", String(baseline));
          span.setAttribute("data-word", String(Array.from(text.children).indexOf(node.parentElement!)));
          span.textContent = char; glyph.current!.appendChild(span);
          const ink = interior(context, char, `${font.fontWeight} 300px ${font.fontFamily}`);
          if (ink && ink.radius > best) {
            best = ink.radius;
            target = { x: x + ink.x * size / 100, y: baseline + ink.y * size / 100, radius: ink.radius * size / 100 };
          }
        }
      }
      ready = best > 0 && width > 0 && height > 0;
      endScale = Math.max(1.01, Math.hypot(width, height) / (target.radius * 1.35));
      paint();
    };
    const unsubscribe = progress.on("change", paint);
    const unsubscribeReading = readingProgress.on("change", paint);
    const observer = new ResizeObserver(measure);
    observer.observe(element); observer.observe(text);
    document.fonts.ready.then(measure);
    measure();
    return () => {
      disposed = true; observer.disconnect(); unsubscribe(); unsubscribeReading();
      text.style.color = "";
      delete text.dataset.portalActive;
    };
  }, [id, progress, readingProgress, firstWord, wordStep, source]);

  return <>
    <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
      <defs>
        <mask ref={mask} id={id} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" style={{ maskType: "alpha" }}>
          <g ref={clip}><text id={`${id}-glyph`} ref={glyph} fill="white" /></g>
        </mask>
        <clipPath ref={zoomClip} id={`${id}-zoom`} clipPathUnits="userSpaceOnUse">
          <use href={`#${id}-glyph`} />
        </clipPath>
      </defs>
    </svg>
    <div ref={layer} aria-hidden="true" className="statement-portal pointer-events-none absolute inset-0 z-20"
      style={{ visibility: "hidden" }}>
      <div className="statement-portal__gradient absolute inset-0" />
    </div>
  </>;
}
