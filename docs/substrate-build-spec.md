# Substrate Portfolio: Build Spec

Single source of truth for the "Substrate" Product Designer portfolio. Authored 2026-06-01. This document is the contract every implementation decision answers to. If code and this spec disagree, fix one of them on purpose, do not let them drift.

Writing rule for this whole project, including this file: no em-dashes anywhere (use periods, commas, colons, parentheses, or hyphens). Numeric ranges use a hyphen.

---

## 0. Decisions log (provenance)

- **Creative direction:** "Substrate" was chosen over two strong alternatives (Topology, Infinite Drafting Plane) from a 7-concept panel. Substrate uses the designer's actual deliverable (a real product UI) as the 3D object, which is the hardest of the three for a skeptical audience to dismiss as spectacle.
- **Audience:** big-tech and scale-up design leads. They scan fast and distrust decoration. Every spatial move must encode systems substance.
- **Fonts:** fully free, open-source (SIL OFL) trio. The original premium picks (Soehne Breit, Reckless Neue) are dropped to remove all licensing cost and the Phase 0 font gate.
- **Hero layer art:** built as real React components, exported to images at build time. The hero literally renders the site's own design system, which is itself proof of systems thinking.
- **Content:** not final yet. Built against realistic placeholders that are clearly marked MOCK and structured for a clean swap.
- **Hosting:** Vercel.

---

## 1. Concept summary

A Next.js App Router site whose centerpiece is a pinned, scroll-driven hero. One flawless product UI hangs in a dark void. As the visitor scrolls, it does not slide away like a normal hero image, it delaminates along the Z-axis into the five layers a systems designer actually reasons about, isolating one layer per scroll state with a sentence about how the designer works, then reconverges into the shipped product. The disassembly proves visual and motion craft; the reassembly proves product thinking. The same layer language recurs across the site (index filtering, page transitions, in-study diagrams) so the concept reads as a real design system, not a one-off hero trick.

Energy: experimental, spatial, premium, high-contrast, confident. Never childish, cartoonish, or gimmicky.

---

## 2. Non-negotiables

These are pass/fail. A build that misses any of these is not done.

1. **No em-dashes** anywhere in copy, labels, captions, or alt text.
2. **Full reduced-motion fallback** and **full no-WebGL fallback**, both with **byte-identical copy** to the live hero, both server-rendered.
3. **Keyboard operable hero.** Focusable per-state anchors that move focus and drive the timeline to each snap point, plus a skip-hero link past the entire pinned region.
4. **WCAG AA contrast** at every size used, verified for amber and blue against the void and vellum, including the drei `Html` labels at every Z depth.
5. **LCP under 2.5s**, with server-rendered display text as the first paint and the largest contentful element. The canvas is never the LCP element. This is proven in lab (throttled mobile), not assumed.
6. **CLS near zero.** Hero height reserved; fonts self-hosted with reserved metrics; canvas dimensions fixed.
7. **Motivated motion only.** Every animation answers to hierarchy, storytelling, feedback, or state transition. No infinite decorative loops. The one allowed idle is a 1-2px hero float, which stops under reduced motion.
8. **One accent per viewport.** Signal Amber appears on roughly one element at a time so it always means "this is live, selected, or important."
9. **No window scroll listeners and no React-state scroll tracking.** GSAP ScrollTrigger owns scroll; continuous values use Motion motion values.
10. **One theme, locked dark.** No section inverts to a light mode mid-page.

---

## 3. Design tokens

### 3.1 Color

Off-black base, one locked accent, contained structural blue. No purple. No gradients on text or large surfaces. Shadows are tinted to the void, never pure black.

| Token | Hex | Role and usage |
|---|---|---|
| `--void` | `#0B0D10` | All section backgrounds sitewide. The stage. Off-black with a faint blue-graphite cast. |
| `--vellum` | `#ECE7DD` | Primary headlines, layer surfaces, serif body. Warm paper-white so panels read as drafted vellum, not cold screen-white. |
| `--graphite` | `#7E848F` | Secondary text, mono labels, captions. Lightened from the original `#6B7079` (which measured ~3.9:1 on the void, below AA) to ~5.2:1 so small mono labels pass WCAG AA. |
| `--layer-glass` | `rgba(236,231,221,0.04)` | Fill for every floating plane, over the void. |
| `--hairline` | `#2A2E34` | 1px edges on planes and rules. |
| `--accent` (Signal Amber) | `#FF6A1A` | The locked accent. Allowed on exactly these roles and nowhere else: the active-layer indicator, the live cursor focus ring, the single primary CTA, the scroll-rail current-state marker, and the single key metric per case study. Roughly one element per viewport. |
| `--drafting-blue` | `#3A5A78` | Contained structural color. Lives only inside the grid/foundation layer's blueprint lattice. It is a material inside one object, never a UI accent, and never competes with amber. |

Contrast: verify amber and blue pass WCAG AA at the exact sizes used, against both void and vellum, before Phase 1 sign-off. Amber is never the sole carrier of meaning; it always pairs with a mono label or a shape.

Tokens are declared once in a Tailwind v4 `@theme` block in `globals.css` as CSS variables, so JavaScript can read the exact same hex via `getComputedStyle`. The offscreen canvases that texture the 3D layers must draw with these read-from-CSS values so there is zero palette drift between the WebGL hero and the SSR fallback.

### 3.2 Type system (free, SIL OFL)

Three voices, each load-bearing, loaded via `next/font/google` (self-hosted at build time, `font-display: swap`, reserved metrics). No Inter, no Fraunces, no Instrument Serif, no Space Grotesk.

| Voice | Family | Weights | Role |
|---|---|---|---|
| Display (product voice) | **Archivo Expanded** | 700-900 | Hero state headlines, section titles. An engineered, extended grotesque with blueprint-title-block authority. |
| Long-form serif (depth and decisions) | **Spectral** | 400, 500, 600 | Case-study reading and editorial body. Sharp, high-contrast, intelligent. Safe swap if too sharp for very long reads: Newsreader (same role). |
| Mono (rigor and receipts) | **JetBrains Mono** | 400, 500 | Labels, coordinates, metrics, the scroll rail, all numerals. |

Scale:
- Hero headline: `clamp(2.75rem, 6vw, 6.5rem)`, tracking -2%, line-height 0.95.
- Serif body: 1.18rem / 1.65, measure capped at 64ch.
- Mono labels: 0.72rem, uppercase, +8% tracking.

Emphasis inside a headline is a weight shift within Archivo Expanded, never a swapped-in serif word. Italic words with descenders (`y g j p q`) get `leading-[1.1]` minimum plus bottom reserve so descenders never clip.

### 3.3 Spacing, grid, radius

- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 (px). The visible 8px grid is also a literal hero layer.
- Radius: one system, mostly sharp. Default radius 0 to reinforce the drafting register; interactive controls may use a small consistent radius if a documented rule says so. Do not mix sharp cards with pill buttons without a stated rule.
- Layout container: `max-w-[1400px] mx-auto`. Mobile gutters `px-4`, scaling up by breakpoint.
- Breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536.

### 3.4 Motion tokens

- Primary settle ease: `cubic-bezier(0.16, 1, 0.3, 1)`. Layers carry mass, never elastic.
- Delamination stagger: 40ms per layer.
- Amber selection marker: 120ms snap (faster than the slow planes, so selection feels machine-precise).
- Headline reveal (SplitText): ~90ms clip-path wipe, no letter bounce. States 02-05 only, never State-01.
- Exit animations run at roughly 60-70% of enter duration.
- Reduced motion: everything above a trivial level collapses to static or instant.

### 3.5 Z-index scale

Documented and finite. No arbitrary `z-50` spam.

| Layer | z-index |
|---|---|
| Base content | 0 |
| Hero canvas | 10 |
| Hero annotations and HUD | 20 |
| Sticky nav | 40 |
| Modal / sheet / overlay | 60 |
| Grain overlay (fixed, pointer-events-none) | 70 |

---

## 4. Tech stack (pinned)

| Package | Version | Notes |
|---|---|---|
| Next.js | 15.x (App Router) | RSC default. `force-static` for home and reader. |
| React / React DOM | 19.0 to 19.2, pinned exactly | R3F 9.x peers `>=19 <19.3`. Pin via `package.json` `overrides`/`resolutions` so a Next minor bump cannot float React past 19.3. |
| Tailwind CSS | v4 | `@tailwindcss/postcss`. Tokens and fonts declared in one `@theme` block. |
| gsap + @gsap/react | 3.15.x | `useGSAP` for auto-cleanup. ScrollTrigger, SplitText, Flip. Free for commercial use. |
| motion | 12.x | Import `motion/react`. Non-hero motion only. |
| three | 0.184.x, pinned | `MeshBasicMaterial`, `PlaneGeometry`, `CanvasTexture`, `SRGBColorSpace`. Browser-only. |
| @react-three/fiber | 9.6.x | `<Canvas>` in a `'use client'` leaf, loaded via `next/dynamic(..., { ssr:false })`. `frameloop="demand"`. |
| @react-three/drei | 10.7.x | Import only `{ Html, Line, ContactShadows }`. Tree-shake. |
| next-view-transitions | 0.3.x | Same-document route transitions. Feature-detected, instant-cut fallback. |
| lucide-react | latest | Functional icons, named imports, single weight. |
| shadcn/ui | copy-in | Only 4-6 primitives, restyled hard. Owned code, not a runtime dep. Init after Tailwind. |
| web-vitals + Vercel Speed Insights | latest | Field Core Web Vitals. |
| lenis | 1.x | Optional smoothing, v1.1. Single shared rAF, disabled under reduced motion. |
| Playwright | dev only | Build-time screenshot export of the layer components. |
| sharp or cwebp or ffmpeg | dev only | PNG to WebP q80 for the mobile/no-WebGL frame sequence. |

**Isolation rules (hard):**
- GSAP and R3F live together in the hero leaf only; they share one ticker.
- Motion (`motion/react`) is used everywhere else and never shares a component tree or frame loop with GSAP/R3F.
- Never import `three`, R3F, or drei into a Server Component or any module reachable from RSC at module scope.

---

## 5. The hero

### 5.1 The five layers (real interface content)

Each layer is built as a real React component using the site's own tokens, then exported to a transparent retina PNG at build time and baked into a `CanvasTexture` on a 3D plane. Author panels wide, not square (target ~2048x1152), to keep GPU texture cost down.

| Layer | Name | Real content it shows | Notes |
|---|---|---|---|
| L0 | Foundation | Baseline grid, 8px column lattice, spacing scale | The only place Drafting Blue appears. |
| L1 | Data | Structured data records / data model, with live-binding rows | Two rows pulse amber to show binding. |
| L2 | Components and states | Component tiles cycling default, hover, loading, error, empty | Active state ringed in amber. |
| L3 | Overlay and interaction | A modal plus a toast | Sits just above components, soft contact shadow. |
| L4 | Live cursor | Cursor with an amber focus ring | Top layer. See 5.4 for its bounded animation. |

### 5.2 The five scroll states

Five discrete, scrubbed, snapped states. A fixed mono progress rail on the left labels states 01 to 05 with the amber marker on the active one. No "scroll" cue copy anywhere.

| State | On-screen headline (locked) | Object transform | Mono callout |
|---|---|---|---|
| 01 Assembled | "Most people see the screen. I design the system behind it." | Fully composed UI as one flat panel, face-on, 1-2px idle float. Held a beat. | none |
| 02 Foundation | "I start at the foundation. The grid, the spacing scale, the rules everything obeys." | Front content lifts and recedes; grid layer slides front, tilts ~12 degrees; others fan back along Z, dimmed to 30%. | `L0 / FOUNDATION / scale 4-8-12-16` |
| 03 Data | "Then the data model, because a dashboard is only as honest as what feeds it." | Grid recedes; data layer advances and rotates ~18 degrees on Y; two rows pulse amber; wires draw from data fields to the dimmed component layer. | `L1 / DATA / 1 source of truth` |
| 04 Components and states | "Components carry the load. Every state designed, not just the happy path." | Component layer scales to fill; tiles cycle states with the active one ringed amber; modal plus toast slide in from front-right. | `L2 / COMPONENTS / 5 states each` |
| 05 Reconverge | "I take complexity apart so the person using it never has to." | All layers rotate face-on and collapse along Z into the composed UI; the live cursor lands an amber focus ring on a primary button. CTA "View the case files" fades up. | none |

### 5.3 Rendering architecture

- 5 `PlaneGeometry` meshes in a single R3F `<Canvas>`, low-FOV perspective camera (~22 degrees) to keep technical-drawing flatness with real depth.
- Each plane uses `MeshBasicMaterial` (unlit, so the palette renders at exact hex) with a `CanvasTexture` (sRGB color space, mipmaps, max anisotropy).
- Animate only `position.z`, `rotation`, and `material.opacity`. Never width or height.
- drei `Html` for crisp, selectable, keyboard-reachable layer annotations, kept at fixed screen size for AA legibility, with logical DOM order. The same callout copy must also exist byte-identical in the SSR fallback markup, which is the canonical accessible source.
- drei `Line2` (fat lines) for the State-03 wires so they have consistent screen-space pixel width.
- No postprocessing. Optional single tinted `ContactShadows` under the reconverged product if it earns its place.

### 5.4 The live cursor versus `frameloop="demand"` (resolved)

A continuously moving cursor would force an always-on rAF, which contradicts demand rendering and "motivated motion." Resolution, locked for v1: **Option A.** The cursor animates only while State-04/05 is the active snap state and the section is in view, as a short bounded GSAP tween that pumps `invalidate()` for its duration then idles. Never an always-on `useFrame`. (Fallback definition if A proves awkward in build: a single drei `Html` dot moved by a Motion value over the canvas, needing no WebGL re-render.)

### 5.5 Build-time layer export pipeline

1. Build each of the 5 layers as real React components using the site tokens and the three fonts.
2. A Playwright script renders each layer at retina scale with fonts preloaded (`document.fonts.ready`) and screenshots it to a transparent PNG. Do not use runtime `html-to-image` (its foreignObject pipeline drops custom webfonts, worst on Safari/iOS).
3. PNGs become the `CanvasTexture` source for the desktop hero, and the same PNGs feed the export of the mobile WebP frame sequence and the reduced-motion stills. One pipeline, three renderers, byte-identical look and copy.

---

## 6. Renderer architecture and capability routing

Three renderers, one asset pipeline. Choose one at mount, re-evaluate on `orientationchange`. Do not gate on `navigator.deviceMemory` (Chromium-only, undefined on Safari/iOS).

Decision tree, in priority order:

1. `prefers-reduced-motion: reduce` -> **reduced-motion stacked stills.** Highest priority, nothing else evaluated.
2. WebGL2 context acquisition fails -> **no-WebGL layered-SVG IntersectionObserver sequence.**
3. `(pointer: fine)` AND desktop min-width AND a coarse `hardwareConcurrency` floor -> **live R3F hero.** A dpr-times-viewport-area ceiling guards against huge high-DPR canvases.
4. Otherwise (mobile, coarse pointer, low core count, or signal absent) -> **WebP sequence renderer** (or, in the v1 cut, the no-WebGL SVG/stills path).

Treat a missing signal conservatively: assume the desktop R3F path only when `pointer: fine` and the desktop min-width are both satisfied.

---

## 7. Fallback contracts

| Path | Mechanism | Copy | Motion |
|---|---|---|---|
| Reduced-motion | 5 static stacked full-bleed sections, each an exploded still from the same exported art. Built behind `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` so the pinned timeline is never constructed. SSR-rendered, runtime-toggle-safe. | byte-identical | none |
| No-WebGL | Server-rendered layered-SVG sequence revealed by IntersectionObserver. CSS scroll-driven animations only as a progressive enhancement behind `@supports` (Firefox still flags it in 2026). | byte-identical | minimal |
| Mobile / low-power | WebP frame sequence drawn to a flat 2D canvas, driven by the same ScrollTrigger snap-progress-to-frame-index mapping. | byte-identical | scrubbed frames |

WebGL context loss (`webglcontextlost` / `webglcontextrestored`) degrades to the sequence or stills, never a dead black canvas.

Keyboard: normal document scroll drives the hero, but keyboard scrolling can strand a user mid-delamination, so the focusable per-state anchors are the real keyboard mechanism (each moves focus and drives the timeline to its snap point), plus a skip-hero link to the index. This is a hard requirement, not polish.

---

## 8. Homepage structure

Eight sections, all on the locked void, at least four distinct layout families, eyebrows rationed to at most two across the page.

1. Pinned cinematic hero (the five-state delamination), fixed left mono progress rail 01-05.
2. Positioning statement: a single large display line as the layers settle ("Product designer for complex software. I make dense systems feel obvious."), with one mono sub-line listing domains (Dashboards / Workflows / Design systems / Data-heavy B2B).
3. Selected Work: the filterable mixed-depth case-study index.
4. Proof strip: a thin mono band of real outcomes, each a quiet amber-keyed metric, in plain layout, not cards.
5. Practice: three columns mapping to the trio of claims (How I think / How I decide / How I craft), each one tight serif paragraph plus one mono micro-diagram. The page's one allowed three-column moment.
6. About: short founder-grade bio in serif, with a portrait treated as a layered panel holding a subtle Z-parallax on scroll.
7. Contact: the single amber primary action plus a direct email and an availability line in mono. One contact intent only.
8. Footer: minimal mono nav, last-updated date, and a one-line colophon naming the typefaces and stack.

No locale or weather strip, no decoration text strip, no scroll cue, no version stamp.

---

## 9. Case study system

### 9.1 Index (Selected Work)

Built for 4-6 mixed-depth projects. Each card: a flat preview panel echoing the hero, client/context in mono, a one-line outcome, and a DEPTH tag (DEEP DIVE or BRIEF) so a scanning lead instantly knows the full teardowns from the medium ones. Filter row (mono controls, not toy chips): by Type (Dashboard / Workflow / Design System / Zero-to-One), by Depth (Deep / Brief), by Outcome lens (Adoption / Efficiency / Scale). Selecting a filter triggers a layer-style re-sort: non-matching cards recede along Z and dim while matches advance, reusing the hero metaphor. Built on CSS Grid with Motion `layout` animation; collapses to an instant reorder under reduced motion and to single column below 768px. Real preview images, never div-built fake screenshots.

### 9.2 Single study (reading experience)

Long-form Spectral on the void. Narrative spine: (a) Context and constraints with a mono fact panel (team, role, duration, surface area); (b) the problem framed as a systems problem with a small before-state exploded diagram using the hero layer technique at small scale; (c) Decisions and tradeoffs as annotated decision cards (the tension, the call, what was sacrificed); (d) Craft gallery (high-fidelity stills and short clips, captioned with intent); (e) Outcome in large mono metrics with the amber key, plus one honest "what I would change." BRIEF studies skip the deep diagram and craft gallery and run as a single-screen scroll: context, one key decision, one outcome. A persistent mono mini-rail mirrors the hero rail; a "next study" z-collapse transition carries the reader onward.

### 9.3 Placeholder content set (MOCK, replace before launch)

Structured for a clean swap. All metrics below are MOCK and flagged as such in the data, not presented as real until verified. Client names are intentionally anonymized to domain/context rather than invented brands, to avoid implying real relationships.

| # | Depth | Working title | Context (placeholder) | Mock outcome |
|---|---|---|---|---|
| P1 | DEEP DIVE | Observability console redesign | Series-C devtools platform | time-to-acknowledge down ~41% (MOCK) |
| P2 | DEEP DIVE | Underwriting workflow | Commercial insurtech | throughput ~3x (MOCK) |
| P3 | DEEP DIVE | Design system and token pipeline | Multi-product enterprise suite | 280+ components, 3 products unified (MOCK) |
| P4 | DEEP DIVE | Zero-to-one analytics platform | Data infrastructure startup | 0 to ~12k seats (MOCK) |
| P5 | BRIEF | Billing console redesign | B2B SaaS | support tickets down ~63% (MOCK) |
| P6 | BRIEF | Internal tooling consolidation | Logistics operations | 9 tools into 1 (MOCK) |

The 5 hero headlines in section 5.2 are locked copy and not placeholders.

---

## 10. Page transitions

- Cross-route: `next-view-transitions` for same-document View Transitions, with a `view-transition-name` on the shared card-to-reader element. Feature-detect `document.startViewTransition`; degrade to an instant cut. Do not lean on it for the heavy hero (the maintainer scopes it to basic cases).
- Signature transition: a GSAP Flip z-collapse reusing the hero metaphor (entering or leaving a study, the interface collapses or expands along Z). Same GSAP instance and easing vocabulary as the hero. Honors reduced motion by snapping to end state. (v1.1.)
- Do not use Motion `AnimatePresence` for route-level exit animations in the App Router (the next route commits before the old tree can exit). Use it for in-page presence only (the index re-sort).

---

## 11. Asset budgets

- Desktop hero: live R3F, five `CanvasTexture` planes ~2048px on the long edge, panels wide not square, dpr capped at 2. Per-texture GPU cost including mipmaps is roughly 9MB for a 2048x1152 panel (a square 2048x2048 would be ~22MB, so keep them wide). No frame sequence shipped to capable desktop.
- Mobile / no-WebGL WebP sequence: ~60-90 frames mobile, up to ~120-160 on the desktop fallback, WebP q80, ~1600px wide on desktop (~25-45 KB per frame). Roughly 3-5 MB total on the desktop fallback, ~1.5-2.5 MB on mobile. Preload only the first ~10 frames; lazy-load the rest after the LCP event. Decode with `image.decode()` or `createImageBitmap` (off main thread) before `drawImage`, with a cancellable decode queue so fast scrubbing does not queue stale decodes. Draw only when the frame index changes. Set canvas width and height to keep CLS near zero.
- Reduced-motion stills: 5 static exploded stills, same art, no scrub, no autoplay.

Rejected formats: PNG sequence to ship (source only), MP4/WebM video scrub (seek jank, soft type, alpha fragmentation), AVIF sequence (heavy per-frame decode), Lottie for the hero (no true depth, no live cursor), WebCodecs (Safari support too young in 2026). AI-generated frames are rejected outright (illegible pseudo-UI, broken palette discipline, uneditable, IP-risky, a credibility failure for this audience).

---

## 12. Performance targets

- LCP under 2.5s, proven in throttled-mobile lab in Phase 2 (before any canvas) and re-confirmed in Phase 3 (after the canvas mounts). The SSR State-01 headline is the LCP element.
- CLS near zero. Reserve hero height; self-host fonts with reserved metrics; fixed canvas dimensions; re-pin on late assets via `document.fonts.ready` plus a `ResizeObserver` or debounced refresh, not a single early refresh.
- INP under 200ms. No per-frame React state; scroll progress read from a ref inside `useFrame`.
- `frameloop="demand"`, with `invalidate()` on scroll-progress change, during any independent GSAP tween for its duration (so the canvas never freezes mid-tween), and on resize.
- Code-split: three, R3F, drei, gsap, and motion sit behind the `ssr:false` hero leaf and are absent from the index and reader route bundles. Set and verify a hero-chunk JS budget.
- Field Core Web Vitals via Vercel Speed Insights, monitored post-launch, not just in lab.

---

## 13. Accessibility requirements

- Keyboard: focusable per-state hero anchors (move focus and drive the timeline), arrow and Page key handlers, skip-hero link. Index and reader fully keyboard navigable with visible amber focus rings.
- Screen readers: all copy in real SSR DOM (selectable, translatable, crawlable). drei `Html` children are not in SSR DOM, so their copy is mirrored byte-identical in the SSR fallback, which is the canonical source.
- Contrast: WCAG AA across all DOM and at every Z depth for `Html` labels. Amber never the sole signal.
- `prefers-reduced-motion`: served the static stacked stills; the pinned timeline is never built. Runtime-toggle-safe.
- Forced-colors / Windows High Contrast: degrades gracefully.
- Reduced transparency: any glass effect provides a solid-fill fallback.

---

## 14. Library decisions (condensed)

USE-DIRECTLY: GSAP core, SplitText, ScrollTrigger (`useGSAP`), Motion, three, IntersectionObserver, Tailwind v4, Radix primitives, Lucide, `MeshBasicMaterial`, drei `Line2`, web-vitals.
ADAPT (specific integration pattern): R3F, drei (`Html`/`Line`/`ContactShadows`), Lenis (optional), `next-view-transitions`, GSAP Flip z-collapse, shadcn/ui (copy-in and restyle), the magnetic CTA and contained spotlight (gated).
INSPIRATION-ONLY (study, never copy layout/motion/assets): Apple scroll sequences, Stripe, Linear, GitHub Universe, Awwwards/FWA entries.
BANNED or rejected: full custom cursor that hides the native cursor, `@react-three/postprocessing`, Phosphor (do not mix icon families), video scrub, Lottie hero, AI-generated UI frames, Motion `AnimatePresence` for route exits.

---

## 15. Implementation roadmap

Phase 0 is effectively closed (fonts free, layer-art source decided, content approach decided, hosting decided). Phases 3 and 6 are the long poles.

**v1 cut line.** Ship first: ScrollTrigger-only R3F hero, reduced-motion stills, no-WebGL SVG fallback, index, reader, SSR/LCP discipline, full keyboard and AA. Defer to v1.1: Lenis smoothing, magnetic CTA and spotlight, GSAP Flip z-collapse, and the dedicated mobile WebP renderer (mobile takes the no-WebGL path in v1).

- **Phase 1: setup and tokens.** Next 15 / React pinned via overrides; Tailwind v4 `@theme` with the locked tokens and three fonts via `next/font/google`; install and pin packages (pin three); shadcn init after Tailwind, 4-6 primitives; lucide and web-vitals; em-dash lint rule; verify the `getComputedStyle` token-read path. DoD: amber and blue verified AA at exact sizes, no FOUT-CLS, no Inter, React held below 19.3.
- **Phase 2: static SSR homepage, no motion.** Full page as Server Components with real SSR text (5 hero headlines, index with DEEP DIVE/BRIEF, reader shell); `force-static`; State-01 headline a genuinely large above-the-fold display node; reserved hero height; skip-hero link; metadata, static OG cards, sitemap, robots; 5 static stills as placeholders. DoD: LCP confirmed as the SSR headline under 2.5s in throttled-mobile lab before any canvas exists; CLS near zero; full keyboard including skip-hero; AA; forced-colors degrades; copy identical to all later fallbacks.
- **Phase 3: scroll-driven hero prototype (long pole).** Author the 5 real layer components and the Playwright export script; `'use client'` `Hero3D` via `next/dynamic({ssr:false})`; 5 planes `MeshBasicMaterial` plus `CanvasTexture` (sRGB, wide not square); `useGSAP` plus ScrollTrigger pin ~500vh, scrub, snap `[0,.25,.5,.75,1]`, `invalidate()` on progress/tween/resize; drei `Html` plus `Line2`; live-cursor layer per 5.4; focusable per-state anchors plus arrow/Page handlers; re-pin on `document.fonts.ready` plus `ResizeObserver`; `webglcontextlost` to fallback; build the no-WebGL SVG path and the reduced-motion stills behind `gsap.matchMedia`. DoD: clean scrub and snap; keyboard users reach every state and can skip the hero; no freeze mid-tween; canvas never the LCP element; no window scroll listeners.
- **Phase 4: visual polish (largely v1.1).** Tune easing, snap, Z spacing; SplitText reveals on states 02-05 only; optional Lenis; optional gated magnetic CTA and spotlight; optional one `ContactShadows`. DoD: every motion motivated; amber at most one element per viewport; blue stays in the grid layer; touch/keyboard/reduced-motion see no flourishes.
- **Phase 5: case study system.** Wire content into RSC data fetching; filterable index with Radix toggle and Motion `layout` re-sort (non-matches recede in Z, instant under reduced motion); long-form reader (Spectral body, JetBrains Mono captions, `whileInView`, `next/image`); `next-view-transitions` shared element and the GSAP Flip z-collapse (v1.1), with Lenis stop/reset around navigation. DoD: filter smooth and gated; reader fully keyboard and SR navigable; transitions degrade to instant cuts; reader images do not regress LCP.
- **Phase 6: performance, accessibility, responsive, observability (long pole).** Implement the capability decision tree and route mobile to the WebP sequence; wire field CWV; set and verify the hero JS budget and confirm code-splitting; Playwright matrix emulating reduced-motion, no-WebGL, and mobile asserting byte-identical copy across all paths; full keyboard/AA/forced-colors audit; Lighthouse plus field metrics. DoD: LCP under 2.5s and CLS near zero on desktop and mid-tier mobile in lab and field; copy parity asserted by test; context-loss path verified; no GSAP triggers leak across routes.

---

## 16. Open items to resolve before launch

- Replace all MOCK case-study content and metrics with real, verified copy and images, plus real client names or a deliberate anonymization policy.
- Final visual design of each of the 5 hero layers (the real React components).
- Real portrait and About copy.
- Confirm Playwright and the WebP tooling are available in the build environment.
- Decide whether v1 ships the mobile WebP renderer or defers it to the no-WebGL path.

---

## 17. References (study, never copy)

- GSAP ScrollTrigger docs and Demo Hub (pin, scrub, snap on one master timeline).
- pmndrs react-three-fiber examples and drei docs (`Html`, `CanvasTexture`, `frameloop="demand"`).
- Lenis repo and its ScrollTrigger sync recipe (single rAF).
- Motion for React docs (`layout`, `AnimatePresence`, `useReducedMotion`).
- MDN: CSS scroll-driven animations, WebGL context loss, plus the web-vitals library.
- Codrops 2026 scroll and WebGL tutorials (MIT demo code, re-home into App Router islands; visuals are inspiration-only).
- Apple scroll sequences, Stripe, Linear, GitHub Universe, Awwwards/FWA storytelling collections: inspiration-only. Study the technique and the restraint, never clone the design.

Cloning any award-winning site is an IP and reputational risk and reads as derivative to the exact audience this portfolio targets.
