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

- **Four colours, nothing else.** Black, white, violet, lime. Every other value
  in the system is one of those four at some alpha. See
  [`palette.md`](./palette.md) for the measured contrast matrix; the numbers
  there decide most of the rules below.
- **Locked dark theme.** One palette, dark. `color-scheme: dark`. No light mode.
  One scoped exception: the hero renders on a white canvas with near-black type,
  a violet controller shell and a lime active cap (see `--color-paper` and the
  `--color-play-*` tokens). That palette lives only inside `.hero-play` and on
  `#hero`; every other surface stays dark.
- **One accent per viewport, and the accent is lime.** Use it for a single point
  of emphasis at a time (active state, one rule, one CTA), never as a fill
  spread across a screen. Lime is 17.75:1 on the page and **1.18:1 on white**,
  so it never lands on paper; on a light surface the emphasis is violet or
  black instead.
- **Violet is surface, never highlight.** At 3.74:1 on black it is under the
  body floor, and violet tints get worse as they darken toward the page (85% is
  2.92:1, 40% is 1.43:1). So violet is never small type, a chip, or a hairline
  on black. It works full bleed.
  One scoped exception to the fill rule, deliberate: the Selected Work chapter
  takes violet to a full surface (`--color-chapter-field`,
  `--color-chapter-deep`, scoped to `.work-chapter`). It is the one chapter
  allowed to do this, it is entered through a zoom into the accent words that
  precede it, and it carries a second exception with it: a gradient on a large
  surface, which the build spec otherwise forbids. That gradient is material
  rather than ambient, brightest where the title sits and falling off toward the
  bottom edge, and it never crosses type. The ink on that field runs the
  opposite way from the old amber one: white is 5.62:1 and black only 3.74:1,
  so everything on it is white. The field darkens toward `--color-chapter-deep`
  (white 9.20:1), so the top of the gradient is the binding case. Nothing on the
  field is dimmed, because opacity tiers exist to stop halation at 21:1 and
  5.62:1 has none to stop.
- **No pure white *body* type.** Pure white on pure black is 21:1, the highest
  two colours can reach, and it halates over paragraphs. Body copy is
  `--color-ink-body` (white/87, 15.61:1); pure white (`--color-vellum`) is for
  display headings and for surfaces. White/50 (5.32:1) is the hard floor for any
  text: white/45 is 4.43:1 and fails.
- **Readability first, motion motivated.** Motion carries meaning (reveal, hierarchy,
  feedback). It is never decoration, and it always honors reduced-motion.
- **Premium and bold, not childish.** Confident type, restrained color, deliberate
  space.

---

## 2. Color

Declared once as CSS custom properties in `@theme`, so JS can read the exact same
hex via `getComputedStyle` and the WebGL hero, the SSR fallback, and the OG image
generator never diverge.

| Token | Value | Tailwind | Role |
|---|---|---|---|
| `--color-void` | `#000000` | `void` | Page background, dark objects on light |
| `--color-paper` | `#ffffff` | `paper` | The hero canvas |
| `--color-violet` | `#7e3bed` | `violet` | Surface and structure only |
| `--color-lime` | `#c6ff34` | `lime` | The one signal colour |
| `--color-vellum` | `#ffffff` | `vellum` | Display ink |
| `--color-ink-body` | `white / 87%` | `ink-body` | Body copy (15.61:1) |
| `--color-graphite` | `white / 60%` | `graphite` | Muted text, labels (7.84:1) |
| `--color-hairline` | `white / 24%` | `hairline` | Decorative rules only (1.93:1) |
| `--color-accent` | `= lime` | `accent` | Emphasis, focus, active |
| `--color-on-accent` | `#000000` | `on-accent` | Ink on lime. Never white: 1.18:1 |
| `--color-on-violet` | `#ffffff` | `on-violet` | Ink on violet |
| `--color-violet-deep` | `#5829a6` | `violet-deep` | Chapter gradient base, controller shading |

`--color-accent-readable` is an alias of `--color-accent`; both are lime. It
survives only because a handful of call sites still name it.

**One trap.** `app/globals.css` carries an unlayered
`.bg-accent { color: var(--color-on-accent) }` that beats Tailwind's own
utility. It has to: `bg-accent` paints lime, and without it the element keeps
whatever foreground it inherited, which on this site is white, at 1.18:1.

### Surfaces and opacity

Solid brand tokens cover most needs. Two recurring elevated surfaces are built from
vellum-over-void so they stay on-palette:

- **Faint panel** (default cards, media wells): `rgba(255, 255, 255, 0.02)`.
- **Opaque stacked card** (cinematic deck, where cards must occlude each other):
  `color-mix(in srgb, var(--color-vellum) 6%, var(--color-void))` plus a soft shadow.

Text tiers use white at reduced alpha rather than new colors, per the ink ladder
in [`palette.md`](./palette.md). On the black page every tier down to white/50
clears the body floor. On the violet chapter almost none of them do, which is
why nothing there is dimmed.

### Editing tokens

Change the value in `app/globals.css` first, then mirror it in `lib/tokens.ts`. Do
not hardcode hex in components; use the Tailwind token utilities (`text-vellum`,
`border-hairline`, `bg-void`, `text-accent`).

`lib/tokens.ts` is not reactive. Its only consumer is the build-time OG image,
so a token change reaches that image only after `npm run build`.

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

The gutter belongs on the full-width outer element and the max-width on the block
inside it, in that order. Putting the padding inside the capped block instead
insets the content by the gutter again once the cap binds, which is how the nav
wordmark ended up 32px out of line with every section below it.

### Navigation bar

The bar uses the same frame, so the wordmark sits on the same vertical as the
section content: gutter on `.site-nav__links`, column on `.site-nav__row`.

It has three scroll states, driven from `components/site/Nav.tsx` and mirrored to
`data-mode` on the header: `full` (the whole bar) at the top of the page,
`compact` (a 48px hamburger pill, centred) once scrolled, and `hidden` while
scrolling down away from the hero. The header animates its own width between
`100vw` and `48px`.

Two invariants, both load-bearing:

- **`.site-nav__links` must never have a max-width.** It is a full-viewport
  positioning wrapper: `left: 50%` offsets it by half the *header* width and
  `translate: -50%` pulls back half of *its own* width, which cancel only while
  it is exactly `100vw`. That pair is what keeps the row centred on the viewport
  while the header collapses to the pill, and `mx-auto` cannot do that job
  because auto margins stop centring once the element is wider than its
  container. When this element also carried `max-w-[1400px]`, everything above
  1400px was displaced right by `(100vw - 1400) / 2`.
- **Style the wordmark through `.site-nav__mark`, never a child combinator.**
  Its compact-mode fade was written as `.site-nav__links > a`, which silently
  stopped applying the moment the row was introduced.

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
- **Hero rail**: the active state's tick extends and turns lime.
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

- **Focus**: `:focus-visible` shows a `2px solid var(--color-accent)` outline
  (lime, 17.75:1 on the page), `outline-offset: 3px`. Never remove it. It is
  surface-scoped: black on the white hero (21:1), and lime again on the
  controller, a dark object on that canvas, where black would be invisible and
  violet only 2.90:1.
- **Selection**: `::selection` is a lime background with black ink (`--color-on-accent`). White there would be 1.18:1.
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
- Selected Work is selected by `WORK_CHAPTER` in `lib/flags.ts`, a real branch rather
  than a CSS hide, because every implementation renders each project with the same
  view-transition-name and duplicates break the page transition.
  - `chapter` (current): the vendored Glyph Portal (`components/ui/glyph-portal.tsx`,
    MIT, notice kept) with the word WORK in the display face, the violet field
    showing through the letters, and a scroll-driven camera into the ink until the
    violet fills the viewport. It reveals `components/work/WorkRail.tsx`: six big
    image-first cards on a horizontal rail that the page scroll drives sideways one
    card per viewport, snapping on a Motion spring, with a live `01 / 06` counter.
    `WorkPortal` waits for the display face before mounting the portal, because the
    portal freezes whichever faces are loaded at mount and treats a pending face as
    a stall. Server render, touch, narrow and reduced motion all get the same cards
    as a native horizontal snap scroller with no track.
  - `cinematic`: the original vertical card stack, a code-split GSAP island gated by
    `html[data-work="cinematic"]`, which hides the static grid (`.work-static`).
- Rule of thumb: SSR the accessible version, gate the enhancement behind a capability
  attribute, and make the two share one palette and one set of card components so
  they cannot drift.

---

## 8. Quick reference

```
Colors    black #000000 · white #ffffff · violet #7e3bed · lime #c6ff34
          and nothing else. ink-body white/87 · graphite white/60
          hairline white/24 · accent = lime · violet-deep #5829a6
Hero only paper #ffffff (canvas) · play-red = violet · play-face #1f1f1f
Never     lime on white (1.18:1) · violet as an accent on black (3.74:1)
          white on lime (1.18:1) · text under white/50 on black (5.32:1 floor)
Type      Archivo Expanded (display, uppercase) · Spectral (serif, body)
          JetBrains Mono (mono, labels)
Frame     px-4 sm:px-8 lg:px-20 · mx-auto max-w-[1400px] · reading max-w-[760px]
Ease      out cubic-bezier(0.23,1,0.32,1) · in-out cubic-bezier(0.77,0,0.175,1)
Rules     dark only (hero excepted) · one accent · no pure white TYPE
          no em-dashes · motion motivated
```
