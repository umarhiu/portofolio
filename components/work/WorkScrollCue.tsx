"use client";

import { useEffect, useRef } from "react";

/** Original broad wave, drawn by native scroll; no added layout runway. */
export function WorkScrollCue() {
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  useEffect(() => {
    const element = root.current!;
    const chapter = element.parentElement!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const stroke = path.current!;
    const length = stroke.getTotalLength();
    // Use path units, without non-scaling-stroke: mixing that with a
    // normalized pathLength can repeat the dash after viewport scaling.
    stroke.style.strokeDasharray = `${length} ${length}`;
    let frame = 0;
    const paint = () => {
      frame = 0;
      const heading = chapter.querySelector<HTMLElement>(".work-gallery__heading");
      if (!heading) return;
      const box = heading.getBoundingClientRect();
      const height = innerHeight;
      const card = chapter.querySelector<HTMLElement>(".work-gallery__card");
      const cardTop = card?.getBoundingClientRect().top ?? box.bottom;
      // Like the reference, the SVG lives in page space. Only its drawn
      // length changes with scroll; it never waits, then slides away.
      const start = box.top + window.scrollY - height * 1.6;
      const end = cardTop + window.scrollY;
      const travel = Math.max(height * .5, end - start - height * .65);
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / travel));
      const filled = document.querySelector<HTMLElement>(".statement-portal")?.dataset.portalFilled === "true";
      element.style.opacity = filled ? String(Math.max(0, Math.min(1, (cardTop - height * .15) / (height * .3)))) : "0";
      const departure = Math.max(0, height - box.top);
      const svg = element.querySelector("svg")!;
      svg.style.height = `${Math.max(height, end - start)}px`;
      svg.style.transform = `translateY(${start - window.scrollY}px)`;
      element.querySelector("span")!.style.opacity = String(Math.max(0, 1 - departure / (height * .2)));
      if (reduced.matches) {
        element.style.opacity = "1";
        element.style.setProperty("--cue-wave-display", "none");
      } else {
        element.style.setProperty("--cue-wave-display", "block");
      }
      stroke.style.strokeDashoffset = String(length * (1 - progress));
      stroke.style.visibility = progress > 0 ? "visible" : "hidden";
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const observer = new ResizeObserver(update);
    const portalObserver = new MutationObserver(paint);
    portalObserver.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-portal-filled", "data-portal-progress"] });
    observer.observe(chapter);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    reduced.addEventListener("change", update);
    update();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); portalObserver.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      reduced.removeEventListener("change", update);
    };
  }, []);
  return <div ref={root} className="work-scroll-cue" aria-hidden="true">
    <span>Scroll to explore ↓</span>
    <svg viewBox="0 0 1000 800" preserveAspectRatio="none" fill="none">
      <path ref={path} d="M1040 -20 C980 60 660 20 650 130 C640 240 80 130 80 290 C80 420 930 290 930 470 C930 600 960 720 820 800" stroke="currentColor" strokeWidth="12" strokeLinecap="round" style={{ visibility: "hidden" }} />
    </svg>
  </div>;
}
