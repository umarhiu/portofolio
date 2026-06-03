/**
 * Canonical token values, mirrored from app/globals.css.
 *
 * Source of truth for the browser is always the CSS variable (read via
 * lib/cssvar.ts). These constants exist only for environments that cannot
 * read the DOM at runtime, such as the build-time OG image generator and
 * Node-side scripts. If you change a token, change it in globals.css first,
 * then here.
 */
export const TOKENS = {
  void: "#0b0d10",
  vellum: "#ece7dd",
  graphite: "#7e848f",
  hairline: "#2a2e34",
  accent: "#ff6a1a",
  drafting: "#3a5a78",
} as const;

export type TokenName = keyof typeof TOKENS;

/** Maps a token name to its CSS custom property. */
export const cssVarName = (name: TokenName): string => `--color-${name}`;
