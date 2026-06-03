"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { detectRenderer } from "@/lib/hero/capability";

// Code-split the three/R3F/gsap scene behind the hero. Never SSR it, and
// reserve the full hero height while the chunk loads so there is no CLS.
const WebGLHero = dynamic(() => import("@/components/hero/WebGLHero"), {
  ssr: false,
  loading: () => <div aria-hidden className="h-[500dvh]" />,
});

type Mode = "pending" | "webgl" | "fallback";

export function HeroEnhancer() {
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    setMode(detectRenderer() === "webgl" ? "webgl" : "fallback");
  }, []);

  // Confirm or revert the pre-paint decision. The inline script may have set
  // data-hero before paint; once React resolves the renderer it reconciles it.
  // Skip while pending so we never clobber the script's decision (which would
  // flash the static hero in during hydration). On fallback or context loss we
  // remove data-hero so the static layout becomes visible again.
  useEffect(() => {
    if (mode === "pending") return;
    const root = document.documentElement;
    if (mode === "webgl") root.setAttribute("data-hero", "webgl");
    else root.removeAttribute("data-hero");
  }, [mode]);

  if (mode !== "webgl") return null;

  return <WebGLHero onContextLost={() => setMode("fallback")} />;
}
