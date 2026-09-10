/**
 * Build-time feature flags.
 *
 * WORK_CHAPTER selects which Selected Work implementation renders:
 *
 *   "chapter"    the amber portal chapter with the horizontal carousel
 *   "cinematic"  the original vertical sticky card stack, kept for comparison
 *
 * Exactly one may be in the tree at a time. Both render every project with the
 * same view-transition-name (title-{slug}), and duplicate active names break
 * the page transition, so WorkSection branches rather than hiding one with CSS
 * (docs/feedback.md, lesson 19: only display:none makes a name inert, and a
 * branch is stronger than display:none).
 *
 * The type annotation is deliberately the full union rather than `as const`,
 * so both branches stay reachable to TypeScript and flipping this constant
 * needs no other edit.
 */
export const WORK_CHAPTER: "chapter" | "cinematic" = "chapter";
