/**
 * Canonical token values, mirrored from app/globals.css.
 *
 * The browser always reads the CSS custom property. These constants exist
 * only for environments that cannot read the DOM, which today means the
 * build-time OG image generator (app/opengraph-image.tsx) and Node-side
 * scripts. Satori cannot resolve var(), so these must stay literal hexes.
 *
 * If you change a token, change it in globals.css first, then here, then
 * rebuild: the OG image is generated at build time and will not pick up a
 * CSS change on its own.
 */
export const TOKENS = {
  /* The four palette colours. Nothing else is a hue. */
  void: "#000000",
  paper: "#ffffff",
  violet: "#7e3bed",
  lime: "#c6ff34",

  /* Roles. Lime is the one signal colour (17.75:1 on black, 1.18:1 on white,
     so it never lands on paper). Violet is surface and structure only
     (3.74:1 on black, under the body floor). */
  accent: "#c6ff34",
  violetDeep: "#5829a6",
  onAccent: "#000000",
  onViolet: "#ffffff",

  /* The ink ladder on the black page. Pure white halates over paragraphs at
     21:1, so body copy is 87% (15.61:1) and pure white is display only. */
  vellum: "#ffffff",
  inkBody: "rgb(255 255 255 / 0.87)",
  graphite: "rgb(255 255 255 / 0.6)",
  hairline: "rgb(255 255 255 / 0.24)",
} as const;

export type TokenName = keyof typeof TOKENS;
