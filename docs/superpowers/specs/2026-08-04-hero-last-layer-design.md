# Hero redesign: The Last Layer

Date: 2026-08-04. Status: approved direction (original, simple version chosen over the elevated variant). Replaces the 5-state scroll hero.

Convention: this document, like all Substrate copy, contains no em-dashes.

## 1. Summary

One 100dvh hero. At rest it is a finished, austere editorial screen. Beneath it, invisible, is a full-viewport drafting-blue working drawing. The visitor's pointer is an X-ray: a soft circular reveal (~200px) that peels the surface wherever it moves and shows the drawing underneath. The entrance performs one autonomous X-ray pass so every visitor discovers the mechanic, then hands over the flashlight. The hero enacts the brand name, Substrate, and the headline is literal: the screen is the last layer.

There is no scroll story. Scrolling leaves the hero immediately. The wow is on load and under the pointer.

## 2. Goals and non-goals

Goals

- Amaze on first sight without a scroll tax: entrance settles in about 2.3s, headline readable at 0ms.
- Every element means something about how Umar works: construction guides, edge-case notes, real tokens. No decoration.
- Delete the 5-state hero apparatus and its WebGL scene entirely; the home bundle gets lighter.
- Complete experiences for touch, mobile, no-JS, and reduced motion, not degraded ones.

Non-goals

- No multi-layer strata, no hold-to-dig, no rectangular instrument lens, no grid-snapped cut (explored and rejected by Umar in favor of the simple version).
- No scroll-driven choreography inside the hero. No WebGL, no three.js.
- No new global design tokens. The hero uses the existing palette and type.

## 3. Composition (the surface, stratum 00)

Single 100dvh section, void background, left-aligned editorial stack inside the site's standard frame (px-4 sm:px-8 lg:px-20, max-w-[1400px]).

- Eyebrow, top-left, JetBrains Mono, uppercase, wide tracking, graphite: "UMAR / PRODUCT DESIGNER / COMPLEX B2B SOFTWARE".
- Headline, Archivo Expanded (wdth 115), extrabold, uppercase, two lines, fluid clamp sizing consistent with the site's display scale: "THE SCREEN IS / THE LAST LAYER."
- Support line, Spectral, vellum/70: "Beneath it: tokens, states, edge cases, decisions. I design that part."
- CTA, bottom-left, mono, uppercase, in a hairline box, THE one amber element: "SEE THE LAYERS UNDERNEATH" linking to /#selected-work (in-page anchor; SmoothScroll handles the glide and focus).
- Corner metadata, bottom-right, mono, graphite, quiet: availability line from lib/content.ts site data.
- One hairline rule under the eyebrow. No other visible structure at rest.

Copy above is draft-final; Umar may run a voice pass before launch. No em-dashes anywhere.

## 4. The underlayer (the drawing)

A full-viewport layer beneath the surface, revealed only through the X-ray. Drafting blue #3a5a78 on void, 1px strokes, plus the blueprint grid at low opacity. Contents:

1. The headline's own construction skeleton: the same live DOM text rendered as outline glyphs (transparent fill, 1px drafting-blue text stroke) so it always matches the real metrics at any viewport. Cap-height and baseline guides drawn as dashed hairlines with small mono labels (CAP / BASE).
2. Three to four margin notes in mono, Umar's words, real decisions: examples "states: default / loading / empty / error", "empty state? ships too", "token: --space-6", "cta hit area 44pt min, drawn, not hoped".
3. A small state-machine diagram (default / loading / empty / error) in 1px strokes.
4. A frozen collaborator cursor with an ENG name tag, pointing at one note.

Asset plan: the build ships with a fully generated placeholder (grid, outline text, DOM-drawn notes, SVG cursor) so nothing waits on assets. Umar then replaces the annotation set with one authored SVG (1px #3a5a78 strokes on transparent, notes in his handwriting or set in JetBrains Mono, the state diagram, the ENG cursor). The glyph skeletons stay live DOM text permanently; the SVG covers only the annotations around them, so type metrics never drift from the drawing.

The underlayer contains zero amber. The accent belongs to the finished world only.

## 5. Choreography

Entrance (desktop, motion allowed; total to settle about 2.3s):

- 0.0s: SSR paint. Eyebrow, headline, support, CTA all present and readable. LCP is the headline text.
- 0.2 to 0.6s: registration settle. The composition resolves from a 2px misregister (translate + opacity) like a print pass settling. Eyebrow hairline draws in.
- 0.6 to 1.7s: one autonomous X-ray pass. A ~200px reveal circle traces a slow diagonal across the headline, exposing skeleton glyphs and a strip of annotations as it passes, then closes. Interruptible: the first pointermove kills the timeline and hands the mask to the pointer from its current position.
- 1.7 to 2.3s: the CTA hairline box draws and its text sets in amber. A mono hint fades in near the bottom: "your cursor does that too". The hint fades out after ~6s or on the first pointer reveal, whichever comes first.

Idle (after settle): every ~9s a coin-sized patch (40 to 60px) of the underlayer self-reveals for 600ms at a different annotation anchor, then reseals. Suppressed while the pointer is inside the hero. The ENG cursor's tag blinks a text caret at a slow clock-like interval.

Interaction: the pointer carries the reveal. CSS radial mask (or clip-path circle on an underlayer duplicate, whichever proves cheaper; both are GPU-composited) driven by gsap.quickTo on two CSS custom properties, radius eases up on entry and collapses to zero over 300ms on leave. Hovering the CTA reveals its underlayer note beneath it. The reveal never exceeds ~35% of the viewport; the surface always dominates.

## 6. Progressive enhancement and fallbacks

Follows the site's established island pattern (static SSR base + client enhancer), with the SmoothScroll lesson applied: the capability gate is a live matchMedia, not a mount-time snapshot.

- Base (SSR, no JS, and the LCP frame): the finished surface with a fixed horizontal band already peeled across the headline's second line, showing the skeleton and two annotations. It reads as a printed poster torn to show its substrate: complete, composed, nothing broken. This is what bots, no-JS, and everyone pre-hydration see.
- Capable desktop (fine pointer, min-width 1024px, motion allowed), gated via gsap.matchMedia: the enhancer hides the static band, arms the mask, runs the entrance. If the gate flips mid-session (reduced motion toggled, window shrunk), the enhancer reverts to the static band.
- Touch and mobile: the static peeled band, full stop. Optionally (phase 2, not required to ship) the band follows a drag.
- Reduced motion: static peeled band, no registration settle, no auto pass, no idle reveals, no hint line. The CTA renders lit.

Lenis coexistence: the mask is pointer-driven, never scroll-driven, so there is no scroll coupling. The CTA anchor ride-along is already handled by SmoothScroll (scroll + focus).

## 7. Architecture

New / rewritten

- components/home/HeroStatic.tsx: rewritten to the new composition, including the static peeled band (pure CSS clip on the underlayer container).
- components/hero/HeroXray.tsx: new client island (dynamic, ssr false). Owns the mask CSS vars, quickTo, the entrance timeline, idle patches, the live gate, and cleanup (mm.revert()).
- components/home/Hero.tsx: still the server wrapper; mounts HeroStatic + the enhancer.

Deleted (the whole 5-state apparatus)

- components/hero/WebGLHero.tsx, LayerArt.tsx, HeroEnhancer.tsx (replaced), HeroBackground.tsx and all HeroBackground*.tsx islands (Foundation, Data, Signal, States, Skills, Folder, Tokens).
- lib/hero/capability.ts (the WebGL decision tree; the new gate is a one-line matchMedia inside the island).
- lib/content.ts: heroStates, HeroState, LayerKind, HeroPlacement types and data.
- app/layout.tsx: the pre-paint data-hero inline script.
- app/globals.css: the data-hero rules, 500dvh reservation, hero-rail block, hero-folder-stage block, hero-fade-in. The #hero { z-index: 2; background: void } rule STAYS (the Positioning statement still tucks under the hero).
- package.json: three, @react-three/fiber, @react-three/drei, @types/three removed after a grep confirms no other consumer.

Ripple checks (part of the build, not optional)

- Positioning's reveal-from-behind (statement.is-sticky, -100vh tuck) verified against the now-100dvh opaque hero.
- Nav hero-rail references, skip-link target, and any data-hero readers grepped out.
- OG image generator (lib/tokens.ts) untouched.

## 8. Performance and accessibility contracts

- Headline text is SSR'd and readable at 0ms; entrance never obscures it (the X-ray annotates, the type is never hidden, only overdrawn regions swap rendering).
- Animation cost: transform, opacity, mask/clip only. quickTo for per-frame vars; no layout writes in the pointer path. Target 60fps on a mid M-series and a 60Hz Windows laptop.
- Home First Load JS must not grow; with three.js and seven islands gone it should shrink materially. Record the before/after route table in the PR.
- Focus and keyboard: the CTA is a real link, focus-visible amber outline; the hero adds no keyboard traps and no wheel/touch hijacking. Screen readers get the surface content once (underlayer duplicate is aria-hidden).
- The em-dash gate applies to all new copy. Reduced-motion contract per section 6.

## 9. Success criteria

1. tsc clean, build clean, all routes 200.
2. / First Load JS at or below the pre-redesign figure, with the three.js chunk absent from the build output.
3. Reduced-motion, no-JS, and mobile each render a complete composed hero (manual check).
4. Entrance interruptible at any frame without visual snap (manual check).
5. The five retired headlines and hero-rail no longer render anywhere; grep proves heroStates is gone.
6. Umar's gut check on feel: the reveal must feel like an instrument, not a gimmick. If it reads as a trick, the idle self-reveals and hint line are the first knobs to turn down.

## 10. Risks

- Known-trick gravity: cursor spotlights are common. Defenses: the underlayer is authored evidence (his real notes, real tokens, the type's real skeleton), the entrance teaches it once with intent, and the accent discipline keeps it premium.
- Mask performance on large type in Safari: validate early; fall back from mask-image to a clipped duplicate layer if needed.
- Entrance interrupt handoff: kill + quickTo takeover from current values, never assume end state (same lesson as the cinematic's fromTo re-resolution).
- Placeholder quality: the generated underlayer must still look intentional so the hero ships credible before the authored SVG lands.
