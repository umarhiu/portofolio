import { TOKENS, cssVarName, type TokenName } from "@/lib/tokens";

/**
 * Read a CSS custom property at runtime, in the browser.
 *
 * The Phase 3 hero draws each layer to an offscreen 2D canvas. Those canvases
 * must paint with the exact same hex as the DOM, so they read the live CSS
 * variable here rather than hardcoding a color. On the server (or before
 * hydration) this falls back to the mirrored constant in lib/tokens.ts.
 */
export function readToken(name: TokenName): string {
  if (typeof window === "undefined") {
    return TOKENS[name];
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarName(name))
    .trim();
  return value || TOKENS[name];
}

/** Read an arbitrary CSS custom property, with an optional fallback. */
export function readCssVar(property: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(property).trim() ||
    fallback
  );
}
