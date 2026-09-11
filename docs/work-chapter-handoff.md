# Handoff: the Selected Work portal chapter

## Updated direction, September 10

Palette update: the field is violet `#7E3BED`, with white foregrounds and white
borders on the work surface. The old `--color-amber-*` tokens are gone; the pair
is now `--color-chapter-field` and `--color-chapter-deep`, renamed because the
name had been wrong three generations running (orange, then green, now violet).
The site accent is lime `#C6FF34`.

**This chapter has been through three palettes.** Everything below the next
section that says "amber" is describing the mechanic, not the colour; substitute
violet. The authority on colour is [`palette.md`](./palette.md), and the only
numbers in this document that describe the shipped build are the ones in
"Contrast, measured" below, which were re-measured for violet.

Positioning now owns the portal opening, with no separate WORK title screen.
The enlarged headline reveals fully and holds through 64 percent of its progress.
Then StatementPortal enters the measured solid ink of the actual "Mine run."
letterforms, using Glyph Portal's opaque-ink scan and logarithmic camera zoom.
The camera now has 3.5 viewport heights of scroll travel, independent of
the original headline reading pace, followed by a short full-field hold.
The violet fills the entire sticky viewport and stays as Selected Work
scrolls into view. WorkRail retains its scroll-driven card behavior, with white
text on the violet surface. The long Reusely paragraph is no longer rendered.

The work handoff uses normal document scrolling. Once the letters fill the
viewport with violet, the fully visible heading and cards enter from below as
the visitor continues scrolling. Both surfaces use the same violet. A static
35dvh overlap and a reduced 4dvh settling hold shorten the empty field travel
by 55dvh, without a visibility switch, fade or artificial entrance transform.
The experimental WorkReveal wrapper has been removed. Desktop card travel
starts only once the rail reaches its sticky position; touch keeps native
horizontal scrolling. Reduced motion keeps the whole handoff in normal flow.

The work rail now starts at the heading gutter rather than centering card one.
Desktop vertical scrolling drives horizontal overflow continuously at 1:1;
there is no rounding or spring in its position. The last card ends at the right
gutter, and the scroll track is measured from the actual overflow. Touch and
reduced motion retain native horizontal scrolling without mandatory snapping.

The desktop stage reserves 48px above and below its content. Title and outcome
rows use the tallest measured copy across the six cards, keeping tags aligned.
Cover height fits the remaining viewport space so the longest card cannot clip
at the bottom. Viewports shorter than 700px use the normal-flow native rail.

StatementPortal measures DOM character positions and a real baseline to preserve
the opening layout across viewport sizes and font loading. Its clip and camera
are driven solely by Positioning's progress: stopping freezes the portal and
scrolling upward retraces it. The original text remains the accessible source;
the SVG layer is decorative and never intercepts input. Reduced motion shows
the statement and work in normal flow without the moving portal or sticky hold.

WorkPortal remains as the legacy wrapper but is not mounted. Glyph Portal keeps
its original implementation except for exporting its MIT-attributed `interior`
helper for StatementPortal. The older documentation below records the original
standalone WORK opening; its typography and timing no longer describe the entry.

The entrance to Selected Work is now a portal. The word WORK sits in the display
face on the dark page with the amber accent showing through its letterforms;
scrolling flies a camera into the solid ink of the W until the amber fills the
viewport; the flood reveals the eyebrow counter, the Selected work heading, and a
horizontal rail of six large image-first case-file cards that the page scroll
drives sideways one card per viewport, snapping card to card.

This document covers that feature only: what it is, how it is built, why it is
built that way, what was verified, and what is still open. It follows the same
no-dash convention as the rest of the docs.

---

## 1. Where to look

| Thing | Location |
| --- | --- |
| The flag that selects this implementation | `lib/flags.ts`, `WORK_CHAPTER = "chapter"` |
| Section wrapper, owns `#selected-work` | `components/home/WorkSection.tsx` |
| Chapter composition | `components/work/WorkChapter.tsx` |
| Font gate and portal configuration | `components/work/WorkPortal.tsx` |
| The vendored portal itself | `components/ui/glyph-portal.tsx` (MIT, notice kept) |
| The rail of cards | `components/work/WorkRail.tsx` |
| Tokens, surface, rail styles | `app/globals.css`, the `@theme` chapter pair and the block headed "The violet chapter" |
| Design rules and the recorded exceptions | `docs/design.md`, Principles and Progressive enhancement |

To see the previous implementation, set `WORK_CHAPTER` to `"cinematic"`. Nothing
else needs to change. Both implementations stay in the repo; see section 5 for
why only one may ever render.

---

## 2. What the visitor sees

On a capable desktop (fine pointer, at least 1024px wide, motion allowed):

1. After the Positioning statement, the page turns dark again and the word WORK
   fills the frame, amber through the letters, with a small mono link reading
   "Skip to the work".
2. Scrolling roughly 2.2 viewport heights flies the camera into the W. The amber
   grows until it is edge to edge. The portal chooses the W itself as the largest
   patch of solid ink; nothing is hard-coded to a letter.
3. The heading appears on the amber in near-black ink: an eyebrow reading
   `01 / 06   case files` and `Selected work`.
4. Below it, the rail. One card is centred with its neighbours peeking at both
   edges. Each further viewport of scroll advances one card on a spring, and the
   eyebrow counts up to `06 / 06`.
5. After the sixth card the page continues to the next section.

Everyone else (touch, narrow, reduced motion, no JavaScript, or the moment
before the display font resolves) sees the same six cards as a native horizontal
snap scroller on the amber, with no camera and no sticky track. Content and
links are byte-identical between the two paths.

---

## 3. How it is built

### 3.1 The section and the flag

`WorkSection` still owns the `#selected-work` anchor, so the four inbound links
keep working: the nav item, the hero CTA, and both back-links on case-study
pages. It branches on `WORK_CHAPTER` and renders either `WorkChapter` or the
original pair (`SelectedWork` + `WorkEnhancer`), never both. It carries
`z-index: 1`, which matters: `.statement` above it is also `z-index: 1` and
earlier in the DOM, so without an explicit index the releasing statement paints
over the top of the chapter at the seam.

### 3.2 The portal

`components/ui/glyph-portal.tsx` is the 21st.dev Glyph Portal by Christian
Katzmann, vendored verbatim under its MIT notice. The one edit is an en dash in a
comment, replaced with words because this repo bans the character and gates on
it. The header records this. Configuration is entirely through props and the
`--gp-*` custom properties, so the file can be diffed against upstream.

The mechanic: the word is SVG `<text>` inside a `<clipPath>`; an amber field is
clipped to it; on scroll the clip is scaled (scale lives on the clip, not the
text, to avoid text paint limits) toward a target found by scanning a canvas
render of each letter for the largest opaque square. Once the ink fills the frame
the clip is dropped, and the content below fades in.

`WorkPortal` wraps it for this site:

- `word="WORK"`, `fontWeight={800}`, `scrollLength={2.2}`, `interactive={false}`
  (no letter picker), `enterLabel="Skip to the work"`.
- `--gp-paper` is void, `--gp-ink` is vellum, `--gp-field` is the amber, and
  `--gp-foreground` is void, so everything that lands on the flooded field is
  near-black ink.
- The `background` prop supplies the amber field with its gradient
  (`.work-portal__field`), which also receives the portal's slow push-in via
  `--gp-field-scale`.

**Why it waits for the font.** The portal freezes whichever font faces are
available at mount and treats a face that is still loading as a stall that keeps
the whole mount static, with no camera. Below-the-fold hydration can beat
`next/font` on a slow connection, so `WorkPortal` calls `document.fonts.load` on
the display face first, with a 1600ms timeout, and renders the children plainly
until then. That plain render is also what the server sends and what no-JS users
keep, so the cards are always in the document.

### 3.3 The rail

`WorkRail` is Motion-based (Motion is already in the home bundle), so it adds no
GSAP and needs no code-split island. It is two components behind one gate:

- `RailScroll` on a capable desktop. A track `N * 100dvh` tall with a
  `position: sticky` stage of `100dvh` inside it, never ScrollTrigger `pin`.
  `useScroll` over the track gives progress 0 to 1; `round(p * (N - 1))` is the
  snapped index; `x = -index * slot` where slot is the measured card width plus
  gap; `useSpring` (stiffness 150, damping 26, mass 0.9) turns the steps into the
  settle. The eyebrow counter is React state driven from the snapped index.
  Focusing a card with the keyboard scrolls the page so that card is centred,
  guarded on `:focus-visible` so a pointer click never yanks the scroll.
- `RailStatic` everywhere else: the same cards in a `overflow-x: auto` row with
  `scroll-snap-type: x mandatory`.

The gate is the shared capable-desktop query, evaluated in a mount effect and
reactive to changes, so the server render is always the static rail and there is
no hydration mismatch.

**The scroll variant must be its own component.** Motion's `useScroll` throws
"Target ref is defined but not hydrated" if the target ref is not attached when
its effect runs. The first version held one ref in one component and only
rendered the track in one of two branches; it threw on every load and the rail
never moved. Keeping the hook inside the component that always renders the track
is what makes it safe.

### 3.4 The cards

Cover image, title, one-line outcome, and two badges (`type` and `depth`), all
in void ink on the amber. Card width is owned by CSS:

```
--rail-card: min(52vw, 720px, calc((100dvh - 28rem) * 1.3333));
```

The third term caps the card by viewport height. The media box is 4:3, so a card
is 0.75 times its width tall plus roughly 28rem of heading, title, outcome and
badges; without the cap a 720px card overran a 768px viewport. Measured: 427px
at 1366x768, 603px at 1440x900, 720px at 1920x1080, all fully in frame.

`WorkRail` reads the slot width back out of the DOM, so this variable is the one
place to resize a card.

---

## 4. Decisions, and why

These were made with Umar in an interview before the build and are recorded so
nobody reopens them by accident.

| Decision | Choice | Reason |
| --- | --- | --- |
| How far the amber goes | Stays amber through the cards | He wanted the accent as the chapter surface, not a transition |
| Cards on the amber | Big image-first cards in void ink, no card panel | Matches his reference screenshot: image, title, description, badges |
| Carousel feel | Snap card to card, neighbours peeking | Reads clearly as a carousel and shows there is more |
| Zoom method | Vendor the reference component as-is | He asked for it explicitly after seeing a plan to reimplement |
| Old cinematic | Keep behind a flag | So the two can be compared live |
| Eyebrow | Live counter `01 / 06` | The old `06 / case files` numbering had nothing establishing 01 to 05 |
| Tenure, tools | Not relevant here | (Positioning copy decisions, see that section of design.md) |

Two written rules are knowingly suspended inside this chapter, both scoped to it
and both recorded in `docs/design.md`:

- **One accent per viewport** ("never as a fill spread across a screen"). The
  chapter is the one place the accent becomes a surface.
- **No gradients on large surfaces** (build spec). The field gradient is
  material rather than ambient: brightest where the heading sits, falling to
  `--color-chapter-deep` at the bottom edge, never crossing type.

### Contrast, measured

On the violet field `#7E3BED`. Note that the ink runs the **opposite** way from
the amber field this chapter used to have: there, only near-black was legible;
here, only white is.

| Ink | Ratio | Verdict |
| --- | --- | --- |
| white `#FFFFFF` | 5.62:1 | passes, used for all type on the field |
| white on `--color-chapter-deep` `#5829A6` | 9.20:1 | passes; the gradient darkens downward, so the top is always the binding case |
| white / 85% | 4.51:1 | passes, but only just |
| lime `#C6FF34` | 4.75:1 | passes, but two saturated hues vibrate: counter and rules only, never a paragraph |
| black `#000000` | 3.74:1 | fails for body; clears 3:1 for large text and for a surface boundary |

Two consequences worth keeping:

- **Nothing on this field is dimmed.** The ink ladder (white/87 for body, /60 for
  meta) exists to stop halation at 21:1 on the black page. At 5.62:1 there is no
  halation to stop, and the tiers eat most of the budget: white/70 is already
  3.53:1. Hierarchy on the field is carried by size and weight instead.
- **Badge outlines are white/70 (3.53:1), not white/35.** The old value measured
  1.90:1 here. An outline is a boundary, and a boundary owes 3:1.

The covers sit on a black mat. All six were authored for a dark surround and
several are saturated blue, which sits a short way round the wheel from violet
and vibrates against it; the mat gives each one back the surround it was drawn
for and separates it from the field at 3.74:1.

---

## 5. Things that will bite the next person

- **Only one Selected Work implementation may render.** Every implementation
  renders each project with `view-transition-name: title-{slug}`, and duplicate
  active names break the page transition to a case study. The flag is a real
  branch for this reason. Do not "hide" one with CSS.
- **Do not put the flag's two branches in one component with one ref** (see 3.3).
- **The covers are 1:1.** The rail crops them to 4:3, 12.5 percent off top and
  bottom. A 16:10 box was tried first and cut the headline baked into cover one.
  The lasting fix is asset-side: export covers at 4:3, or keep each subject inside
  the middle 75 percent.
- **The portal picks its own letter.** `interactive` is off, so there is no
  picker; the W was chosen because it has the largest solid ink. Changing the word
  changes the target. `focusChar` exists if a specific letter is ever wanted.
- **The portal is in the main bundle.** It is plain React with a canvas scan,
  about 15kB of source, not code-split. A production build has not yet been run
  to confirm the home First Load JS figure (about 160kB before this work).
- **`app/globals.css` is CRLF**, as are several components after the last pull.
  Scripted edits must normalise and restore line endings or their anchors will
  not match.
- **Adjacent-sibling coupling upstream.** `.hero-reveal + .statement` carries the
  hero handoff. Nothing may be inserted between `Hero` and `Positioning` in
  `app/page.tsx`. The chapter comes after Positioning, so it is safe.

---

## 6. Process, briefly

1. Explored the existing Selected Work and found it was a vertical card stack
   with no horizontal movement to build on, and that three renderings of the
   projects were already mutually `display: none` for view-transition safety.
2. Interviewed Umar on the seven decisions above and measured the contrast
   consequences of a full amber surface before writing any UI.
3. Phase 1 stood up the amber shell with dark cards to prove the palette. He then
   asked for the zoom next, then for the reference component verbatim and for
   cards like his screenshot, which reshaped Phases 2 and 3 into what shipped:
   the vendored portal plus a Motion rail, no GSAP island.
4. Fixed in passing: the old `WorkEnhancer` skeleton reserved 360dvh for a
   440dvh track (an 80dvh layout jump on the dynamic-import swap).

---

## 7. Verification

The browser suites live outside the repo by project convention, in the session
scratchpad under `pwtest/`, driven by puppeteer-core against the dev server on
port 3002. They print PASS/FAIL per claim with the measured value.

| Suite | Assertions | What it covers |
| --- | --- | --- |
| `verify-portal.mjs` | 29 | Portal mounts after the font, motion on, target letter, progress tracks scroll, clip drops at the flood, viewport amber at the corners by pixel, rail in scroll mode with six cards, exact centring at cards 1, 3 and 6 with the counter following, cards over 600px wide, one live element per view-transition name, reduced-motion and mobile static fallbacks, no console errors |
| `verify-cursor.mjs` | 66 | The fluid cursor, including magnetic grow over a rail card and a pixel-contrast sample over a cover |
| `verify-nav.mjs` | 16 | Nav geometry, unaffected by the chapter but run as a regression |

Also clean at handoff: `npx tsc --noEmit`, and the em-dash and en-dash gate over
`app components lib docs` (match U+2014 and U+2013 by code point; a literal in
the check trips itself). The rendered frames were read back at 768 and 900.

Not yet run: `npm run build` with the dev server stopped, to confirm the bundle
figure. The `prebuild` guard refuses to build while port 3002 is listening.

---

## 8. Open items

- **Amber exit.** The chapter currently hard-cuts back to the dark surface after
  the sixth card. He chose "recedes back to dark"; that transition is not built.
- **Bundle check.** See section 7.
- **Covers at 4:3.** See section 5.
- **Old cinematic.** Kept behind the flag. Deleting it would also orphan
  `projectTypes` in `lib/content.ts`, `HorizontalCard.tsx`, and the
  `.hcard` and `.work-card` rules in `globals.css`.
- **Eyebrow copy.** "case files" stays; the live counter replaced the orphaned
  `06`.
- **Pre-existing, not caused here.** With JavaScript off, `.hero-reveal +
  .statement` still applies its `-35dvh` overlap while `is-sticky` needs JS, so
  the statement's first lines sit behind the opaque hero. Separate fix.
- **Pre-existing, not caused here.** `proofMetrics` still holds four invented
  numbers under a "Sample outcomes" label.
