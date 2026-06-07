"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/*
  Mirrors HeroEnhancer. On a capable desktop only, code-split + mount the GSAP
  "Selected Work" cinematic and hide the static grid (via data-work, like
  data-hero). Keeps GSAP out of the home First Load JS: it ships only inside
  this dynamically imported, never-SSR'd chunk. The 360dvh track height is
  reserved by the loading skeleton so the swap causes no layout jump.
*/
const SelectedWorkCinematic = dynamic(
  () => import("@/components/work/SelectedWorkCinematic"),
  {
    ssr: false,
    loading: () => <div aria-hidden className="h-[360dvh]" />,
  },
);

type Mode = "pending" | "cinematic" | "fallback";

// Lighter gate than the hero's: no WebGL2/core floor (this is a transform-only
// scroll sequence). Desktop, fine pointer, motion allowed.
function detectWork(): boolean {
  if (typeof window === "undefined") return false;
  const m = window.matchMedia;
  if (!m) return false;
  if (m("(prefers-reduced-motion: reduce)").matches) return false;
  if (!m("(pointer: fine)").matches) return false;
  if (!m("(min-width: 1024px)").matches) return false;
  return true;
}

export function WorkEnhancer() {
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    setMode(detectWork() ? "cinematic" : "fallback");
  }, []);

  useEffect(() => {
    if (mode === "pending") return;
    const root = document.documentElement;
    if (mode === "cinematic") root.setAttribute("data-work", "cinematic");
    else root.removeAttribute("data-work");
    return () => root.removeAttribute("data-work");
  }, [mode]);

  if (mode !== "cinematic") return null;

  return <SelectedWorkCinematic />;
}
