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
  primary: "#075056",
  secondary: "#ff5b04",
  tertiary: "#e4eef0",
  mirage: "#16232a",
  paper: "#ffffff",
  void: "#0b0d10",
  vellum: "#ffffff",
  graphite: "#969c9f",
  hairline: "#404b50",
  accent: "#075056",
  drafting: "#075056",
} as const;

export type TokenName = keyof typeof TOKENS;

/** Maps a token name to its CSS custom property. */
export const cssVarName = (name: TokenName): string => `--color-${name}`;
