# Substrate, design system

The styling reference for this site. It documents the tokens, type, spacing, and
motion that every screen inherits from, so new work stays consistent and nothing
drifts. Values here are mirrored from the code, not invented: the source of truth
for color and type is [`app/globals.css`](../app/globals.css) (the `@theme` block),
with a Node-side mirror in [`lib/tokens.ts`](../lib/tokens.ts).

Convention note: this project bans em-dashes and en-dashes in all copy. This doc
follows the same rule.

---

## 1. Principles

- **Locked dark theme.** One palette, dark. `color-scheme: dark`. No light mode.
  One scoped exception: the hero renders on a white canvas with near-black type
  and a red controller accent (see `--color-paper` and the `--color-play-*`
  tokens). That palette lives only inside `.hero-play` and on `#hero`; every
  other surface stays dark.
- **One accent per viewport.** Amber (`--color-accent`) is the only accent. Use it
  for a single point of emphasis at a time (active state, one rule, one CTA), never
  as a fill spread across a screen.
- **No pure white type.** On dark surfaces the lightest ink is vellum (`#ece7dd`),
  an off-white; never `#fff`. Pure white appears only as a *surface*: the hero
  canvas (`--color-paper`) and illustration/screenshot content inside project
  covers.
- **Drafting blue is contained.** `--color-drafting` belongs to the hero grid layer
  only. It is never a UI accent.
- **Readability first, motion motivated.** Motion carries meaning (reveal, hierarchy,
  feedback). It is never decoration, and it always honors reduced-motion.
- **Premium and bold, not childish.** Confident type, restrained color, deliberate
  space.

---

## 2. Color

Declared once as CSS custom properties in `@theme`, so JS can read the exact same
hex via `getComputedStyle` and the WebGL hero, the SSR fallback, and the OG image
generator never diverge.

| Token | Hex | Tailwind | Role |
|---|---|---|---|
| `--color-void` | `#0b0d10` | `void` | Page background, dark surfaces, text on light |
| `--color-vellum` | `#ece7dd` | `vellum` | Primary text/foreground, lightest surface |
| `--color-graphite` | `#7e848f` | `graphite` | Muted text, labels, secondary lines |
| `--color-hairline` | `#2a2e34` | `hairline` | Borders, dividers, rules |
| `--color-accent` | `#ff6a1a` | `accent` | The single accent (amber): emphasis, focus, active |
| `--color-drafting` | `#3a5a78` | `drafting` | Hero grid layer only, never a UI accent |

### Surfaces and opacity

Solid brand tokens cover most needs. Two recurring elevated surfaces are built from
vellum-over-void so they stay on-palette:

- **Faint panel** (default cards, media wells): `rgba(236, 231, 221, 0.02)`.
- **Opaque stacked card** (cinematic deck, where cards must occlude each other):
  `color-mix(in srgb, var(--color-vellum) 6%, var(--color-void))` plus a soft shadow.

Text tiers use vellum at reduced alpha rather than new colors: body at `vellum/80`
or `vellum/70`, supporting detail at `vellum/60`, on-brand hairlines and graphite
for the quietest lines.

### Editing tokens

Change the value in `app/globals.css` first, then mirror it in `lib/tokens.ts`. Do
not hardcode hex in components; use the Tailwind token utilities (`text-vellum`,
`border-hairline`, `bg-void`, `text-accent`).

---

## 3. Typography

Three faces, three jobs. All loaded via `next/font/google` in
[`app/layout.tsx`](../app/layout.tsx) and exposed as CSS variables.

| Face | Variable | Tailwind | Job | Weights |
|---|---|---|---|---|
| **Archivo** (expanded) | `--font-archivo-expanded` | `font-display` | Headlines, titles. The product voice. | variable, `wdth` axis |
| **Spectral** | `--font-spectral` | `font-serif` | Body and long-form. The depth and decisions voice. Default `<body>` font. | 400 / 500 / 600, + italic |
| **JetBrains Mono** | `--font-jetbrains-mono` | `font-mono` | Labels, eyebrows, metadata, telemetry, numerals. The rigor voice. | 400 / 500 |

Fallback stacks (in `@theme`): display falls back to `"Arial Black", system-ui`;
serif to `Georgia, "Times New Roman"`; mono to `ui-monospace, "SFMono-Regular"`.

### Display face detail

Archivo is loaded as a variable font with the width axis, then pushed wide via
`.font-display { font-variation-settings: "wdth" 115; }` (115, not the max 125, so
long multi-word headlines do not over-stretch). Weight is still set with the normal
`font-*` utilities. Display type is used **uppercase, extrabold/bold, tracking-tight,
tight leading** (0.95 to 1.0).

### Numerals

Metrics and mono numerals use `.tabular` (`font-variant-numeric: tabular-nums`) so
figures align in columns.

### Type scale (fluid, observed in code)

Sizes are fluid via `clamp(min, vw, max)` so they read well from mobile to wide
desktop. Representative usages:

| Use | Size | Face / style |
|---|---|---|
| Case study `h1` | `clamp(2rem, 5vw, 3.75rem)` | display, extrabold, uppercase, `leading-[0.98]` |
| Section heading `h2` | `clamp(1.75rem, 3.5vw, 3rem)` | display, extrabold, uppercase |
| Metric figure | `clamp(2.5rem, 6vw, 4.5rem)` | display, extrabold, `leading-none`, `.tabular` |
| Card title (wide) | `clamp(1.6rem, 2.8vw, 2.9rem)` | display, extrabold, uppercase |
| Card title (grid) | `clamp(1.25rem, 2vw, 1.6rem)` | display, bold, uppercase |
| Body / lede | `1.18rem`, `line-height: 1.65` | serif |
| Mono label / eyebrow | `text-xs` to `text-[10px]` | mono, uppercase, `tracking-[0.16em]` to `[0.24em]` |

---

## 4. Spacing and layout

### Page container

The standard content frame is padding on the outside, a max-width on the inside:

```
px-4 sm:px-8 lg:px-20      // responsive gutter
mx-auto max-w-[1400px]     // centered content column
```

- **Reading column** (case study article): `mx-auto max-w-[760px]`.
- **Section rhythm**: vertical padding `py-24`, `lg:py-32`.
- **Prose measure**: cap body text around `max-w-[42ch]` where line length matters.

### Borders and structure

Structure is drawn with `1px` hairlines (`border-hairline`), not shadows. Shadows
are used only to lift stacked/elevated cards off the void. Grids and dividers use
`divide-hairline` / `border-hairline`.

---

## 5. Motion

Custom easings, because the built-in ones are too weak. Defined in `@layer base`.

| Token | Curve | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Default for reveals and most transitions |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | View transitions, symmetric moves |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawer / panel slides |
| CTA overshoot | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Press/hover scale with a subtle bounce |

### Duration guidance

- Micro-interactions (hover, color, opacity): **160 to 220ms**.
- Transforms and reveals: **220 to 280ms**.
- View transitions (page nav): **320ms**.
- Signature flips (nav 3D roll): **450ms**.

### Signature interactions

- **CTA**: hover `scale(1.05)`, active `scale(0.97)`, with a slow warm-white sheen
  glint (`cta-sheen`) that sweeps every few seconds and settles.
- **Nav / CTA label**: a 3D roll on the X axis (`nav-flip`), a duplicate face rolls
  into place like a turning cube edge.
- **Work card**: hover lift `translateY(-6px)`, border warms to graphite, and an
  accent rule wipes in (`scaleX(0)` to `1`).
- **Hero rail**: the active state's tick extends and turns amber.
- **Shared element transitions**: project titles carry `view-transition-name:
  title-{slug}` so the card title morphs into the case study title across navigation.
- **Scroll choreography**: GSAP + ScrollTrigger drive scrubbed timelines. Pinning is
  done with CSS `position: sticky`, never ScrollTrigger `pin: true`. The "reveal from
  behind" statement and the Selected Work cinematic are the two set pieces.
- **Fluid cursor**: a precise dot on the pointer plus a ring that trails it on a
  spring and stretches along its own direction of travel. Near something
  interactive the ring turns magnetic. See the section below.

### Fluid interaction cursor

`components/site/FluidCursor.tsx` gates it; `lib/fluid-cursor.ts` is the engine,
dynamically imported so it never enters the initial bundle. Three states, picked
from the target's measured size:

| State  | When                                              | Ring                                        |
| ------ | ------------------------------------------------- | ------------------------------------------- |
| `free` | nothing interactive under the pointer             | 34px disc, trails and stretches with speed  |
| `lock` | target at most 96px in both axes, not `soft`      | morphs into the element's box + 10px pad    |
| `grow` | larger target, or inside `[data-cursor="soft"]`   | 60px disc, heavier spring, follows pointer  |

Authoring hooks, all opt-in from markup:

- `data-cursor="none"` excludes a subtree entirely.
- `data-cursor="soft"` keeps the swell but suppresses the box. On the hero
  controller, because an axis-aligned rectangle over a perspective-tilted 3D
  object reads as pasted on.
- `data-cursor="magnetic"` makes a non-interactive element a target. Links,
  buttons, `[role="button"]`, `summary` and labelled `label`s are already
  targets, so cards need nothing.

Two rules to keep if you touch the CSS:

- The three layers are **body children, never wrapped**. `mix-blend-mode` only
  blends inside the nearest ancestor stacking context, so a fixed z-indexed
  wrapper would leave them blending against each other rather than the page.
  For the same reason none of them may gain an ancestor with `opacity`, a
  filter, or a blend mode.
- `transform-origin: 0 0` is load-bearing. Each layer is positioned by a
  transform chain ending in `translate(-50%, -50%)`, and the default 50% 50%
  origin would rotate that centering shift along with the box.

One white cursor covers both regimes through `mix-blend-mode: exclusion`: it
resolves near-black on the white hero and near-white on the dark page, measured
at 19.9:1 and 17.6:1 against their backdrops, and 13.9:1 over a project cover.
A backdrop at almost exactly 50% grey is the degenerate case for any inverting
blend, which is what the ring's `backdrop-filter: contrast()` mitigates.

### Reduced motion (hard contract)

A global guard in `@media (prefers-reduced-motion: reduce)` collapses all animation
and transition durations to near-zero, sets `scroll-behavior: auto`, and turns page
view transitions into an instant cut. GSAP work is wrapped in
`gsap.matchMedia("(prefers-reduced-motion: no-preference)")` so it never runs for
those users. Design every motion so the reduced-motion state is a complete,
non-broken experience.

---

## 6. Interaction and state

- **Focus**: `:focus-visible` shows a `2px solid var(--color-accent)` outline,
  `outline-offset: 3px`. Never remove it.
- **Selection**: `::selection` is amber background on void text.
- **Hover gating**: all hover affordances are wrapped in
  `@media (hover: hover) and (pointer: fine)` so touch devices do not get stuck
  hover states.
- **Cursor**: the native cursor is hidden only while the fluid cursor is actually
  mounted (`html[data-fluid-cursor="on"]`), and text entry keeps its I-beam. If
  the engine chunk fails to load, nothing sets the attribute and the page keeps
  its ordinary cursor rather than having none.
- **Forced colors**: under `forced-colors: active`, the system owns color and focus
  falls back to `CanvasText`. The fluid cursor stands down completely there,
  since a blended white overlay can resolve to nothing.
- **Skip link**: a visually-hidden "skip to selected work" link appears on focus.

---

## 7. Progressive enhancement

The rich experience is layered on top of a complete static one; it never replaces
the accessible baseline.

- The hero ("A little play, serious craft", v2) is static-first: the full
  headline, role, copy, and links SSR immediately inside a one-viewport intro
  shell (nav included, white bar with dark links while over the hero). The
  HeroPlay island adds the living parts: the verb auto-rotates every 3.5s with
  a persistent pause control (a manual pick holds 5s, rotation suspends when
  hidden/offscreen/pressed/keyboard-focused), the D-pad advances, four diamond
  buttons select directly, and the controller's orientation follows the pointer
  across the whole hero (anchored slot, springs, resting pose 10/-10/-5).
  No-JS keeps the complete static composition with inert controls; reduced
  motion defaults to manual, swaps instantly, and drops tilt and springs while
  keeping static press/focus feedback. The boundary into the next section is a
  stepped cap (center highest) revealed by native scroll.
- The Selected Work cinematic uses `html[data-work="cinematic"]`, which hides the
  static fallback grid (`.work-static`). The GSAP island provides its own scroll
  track.
- Rule of thumb: SSR the accessible version, gate the enhancement behind a capability
  attribute, and make the two share one palette and one set of card components so
  they cannot drift.

---

## 8. Quick reference

```
Colors    void #0b0d10 · vellum #ece7dd · graphite #7e848f
          hairline #2a2e34 · accent #ff6a1a · drafting #3a5a78 (grid only)
Hero only paper #ffffff (canvas) · play-red #c43a28 · play-face #f9f4e7
Type      Archivo Expanded (display, uppercase) · Spectral (serif, body)
          JetBrains Mono (mono, labels)
Frame     px-4 sm:px-8 lg:px-20 · mx-auto max-w-[1400px] · reading max-w-[760px]
Ease      out cubic-bezier(0.23,1,0.32,1) · in-out cubic-bezier(0.77,0,0.175,1)
Rules     dark only (hero excepted) · one accent · no pure white TYPE
          no em-dashes · motion motivated
```
