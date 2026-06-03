/**
 * Picks the hero renderer at mount. Mirrors the spec decision tree, collapsed
 * to the v1 cut line: reduced-motion, no-WebGL, mobile, and low-power all take
 * the static fallback (the SSR stacked layout). Only a capable desktop with a
 * real WebGL2 context and no reduced-motion preference gets the live scene.
 *
 * Deliberately does NOT read navigator.deviceMemory (Chromium-only, undefined
 * on Safari/iOS, which would misroute the browsers that most need the cheap
 * path).
 */
export type HeroRenderer = "webgl" | "fallback";

export function detectRenderer(): HeroRenderer {
  if (typeof window === "undefined") return "fallback";

  // 1. Reduced motion wins outright.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "fallback";
  }

  // 2. Hard requirement: a real WebGL2 context.
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  try {
    const probe = document.createElement("canvas");
    gl = probe.getContext("webgl2");
  } catch {
    gl = null;
  }
  if (!gl) return "fallback";

  // 3. Capable desktop only: fine pointer, desktop width, a coarse CPU floor.
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const desktopWidth = window.matchMedia("(min-width: 1024px)").matches;
  const cores =
    typeof navigator.hardwareConcurrency === "number"
      ? navigator.hardwareConcurrency
      : 4;

  if (!finePointer || !desktopWidth || cores < 4) return "fallback";

  return "webgl";
}
