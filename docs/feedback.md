# Working Feedback and Preferences (Umar / Substrate portfolio)

Reload this at the start of future sessions on this project. It captures the
corrections, preferences, and lessons from the build so far so I do not relearn
them. Project rule applies to this file too: no em-dashes anywhere.

Companion docs: the full build contract lives in `docs/substrate-build-spec.md`.

---

## 1. Who the work is for

- User: Umar (umar@reusely.com), a Product / UI-UX designer.
- Project: his personal portfolio site.
- His specialty to sell: complex / B2B SaaS and systems design (dashboards,
  workflows, design systems, taming complexity).
- Primary audience for the site: big-tech and scale-up design leads who scan
  fast and distrust spectacle. Substance over decoration.

## 2. The single most important taste rule

- "Fun" does NOT mean childish, cartoonish, toy-like, or playground-like. It
  means expressive, bold, creative, memorable, high-contrast, confident, and
  premium. Also not stiff or overly formal. He stated this emphatically up
  front; treat it as a standing guardrail for every visual decision.
- Energy is experimental and spatial (3D / pseudo-3D, depth, tech-forward,
  Awwwards-leaning), but it must always serve clarity.
- Readability is non-negotiable. He rejected a hero composition for being
  "messy" and bad for readability. Spatial or 3D craft must never fight
  legibility. Compose text and the visual object so they do not collide.
- Motion must feel smooth, intentional, and high-end. He follows Emil
  Kowalski's design-engineering principles (he asked for the
  `emil-design-eng` skill): custom easing curves, transform/opacity only,
  sub-300ms UI timings, scale-on-press, spring smoothing, reduced-motion
  honored.

## 3. Decisions already locked (do not relitigate)

- Creative direction: "Substrate" (a finished product UI that delaminates into
  its real system layers on scroll, then reconverges). Chosen over the
  alternatives Topology and Infinite Drafting Plane.
- Fonts: free / open-source only. He declined paid faces (Soehne, Reckless).
  Locked: Archivo Expanded (loaded as the Archivo variable font with the wdth
  axis), Spectral (serif body), JetBrains Mono. No Inter, no Space Grotesk.
- Hero layer art: built as real React components (then exported), not AI frames.
- Content: not final yet. Use realistic placeholders, clearly marked MOCK,
  structured for a clean swap.
- Hosting: Vercel.
- Dev server port: 3002 (not the default 3000).
- Stack: Next.js 15 App Router, React pinned 19.1.0 (R3F 9.x needs < 19.3),
  Tailwind v4, three / R3F / drei, GSAP, Motion, next-view-transitions.

## 4. Corrections and refinements he made (chronological)

1. Clarified "fun" is premium and bold, never childish. Recurring guardrail.
2. Saw an unstyled page and asked to fix it. Root cause was a stale dev server,
   not code. Lesson in section 6.
3. Called the scroll-driven hero "messy" and bad for readability, and pushed
   back on deferring it to a later "polish" phase. Readability is a now problem,
   not a polish problem.
4. Asked to move the dev server to localhost 3002.
5. Wanted the hero state rail to highlight the number of the state currently in
   view (active tracking on scroll).
6. Asked to apply a sticky scroll effect (Codrops "Sticky Grid Scroll" idea) to
   the "Product designer for complex software. I make dense systems feel
   obvious." statement section.
7. On that sticky reveal: it should feel smoother, the highlight should persist
   and feel seamless not messy, and the text should be placed on the left.
8. Then refined: scrolling back up should reverse the motion (bidirectional).
   Net rule for scroll reveals: default to reversible and spring-smoothed.

## 5. How he likes me to work

- He likes the structured pipeline: brainstorm to creative directions to a
  recommendation, then an implementation plan, then a committed spec doc, then a
  phased build. Keep that rigor.
- He is comfortable with me running Workflows for divergent generation,
  research, and adversarial review. He used the "workflow" keyword repeatedly.
- He reviews visually at milestones ("I will review the result once it is
  finished"). He is fine with me completing several phases in one pass and then
  reviewing.
- Be honest about what is actually verified. A green build proves compile, SSR,
  and types, not that it looks right. Say plainly what still needs his eyes.
- He values being asked sharp, high-leverage clarifying questions before big
  work (he answered the multiple-choice rounds quickly and well).

## 6. What I would do differently next time (lessons)

1. Dev server hygiene. The long-running `next dev` repeatedly broke: stale
   `.next`, RSC "Client Manifest" errors, "Cannot find module './NNN.js'", and
   EADDRINUSE port conflicts. After any `npm install` of new deps or a large
   refactor, restart the dev server and clear `.next`. If a port is stuck, find
   and kill the listener (`Get-NetTCPConnection -LocalPort 3002` then
   `Stop-Process`).
2. Verify rendering, not just status. He caught an unstyled page that returned
   HTTP 200. When checking the dev server, also confirm the stylesheet is linked
   and populated (fetch the HTML, look for `/_next/static/css/...`), not just a
   200.
3. Validate font names. `Archivo_Expanded` is not a `next/font/google` family
   and failed the build. Verify family names, or use a variable font plus an
   axis (Archivo + wdth) for an expanded look.
4. Bundle discipline. A static import of GSAP via a normal component pulled GSAP
   into the home First Load (jumped to ~200 kB). Keep heavy libs (GSAP, three)
   out of statically-imported components. Use Motion (already bundled) for DOM
   scroll effects; reserve GSAP and three for the code-split WebGL hero chunk.
5. Compose hero text and the 3D object so they never overlap badly. Use a scrim
   and a constrained left text column, pull the camera back so the object never
   crops, and do not show all scene layers at full strength at once (dim the
   grid, hide the modal in the assembled state).
6. Flex shrink trap. A `max-w-[...]` container inside a `display:flex` sticky
   stage shrinks to its content and `mx-auto` then centers it. Add `w-full` to
   keep it left-aligned. This is what moved the statement off the left.
7. Scroll reveals. Default to bidirectional and spring-smoothed unless told
   otherwise. Drive opacity off a spring-smoothed `scrollYProgress`.
8. Trust but verify review agents. An accessibility reviewer flagged the
   graphite text contrast as failing using the old hex; I recomputed `#7e848f`
   on the void at ~5.18:1 (passes AA) and correctly rejected it. Recompute
   before acting on a contrast or factual claim.
9. Em-dash gate. The project bans em and en dashes; a `prebuild` script
   enforces it. Keep all copy hyphen-only. When editing that check script,
   reference the banned characters by code point, not as literals, or the file
   trips its own check.
10. Edit-tool escaping. JSON decodes `\uXXXX` in tool arguments to the actual
    glyph. To write a literal escape sequence into a file, use code points in
    the logic or double-escape the backslash.

## 7. Project conventions to remember

- Color tokens: void `#0b0d10`, vellum `#ece7dd`, graphite `#7e848f` (lightened
  from `#6b7079` to pass AA), hairline `#2a2e34`, accent Signal Amber `#ff6a1a`
  (about one accent element per viewport), drafting blue `#3a5a78` (only inside
  the grid layer, never a UI accent).
- Motion tokens in `globals.css`: `--ease-out: cubic-bezier(0.23,1,0.32,1)`,
  `--ease-in-out: cubic-bezier(0.77,0,0.175,1)`, `--ease-drawer`.
- Renderer routing: reduced-motion, no-WebGL, mobile, and low-power all take the
  SSR static fallback. Only a capable desktop with WebGL2 gets the live R3F
  hero. The SSR static hero is the LCP source and the fallback; the WebGL
  enhancer mounts client-side and hides the static layout.
- Non-negotiables: full reduced-motion and no-WebGL fallbacks with byte-identical
  copy, keyboard-operable hero, WCAG AA, LCP under 2.5s with SSR text first,
  CLS near zero, motivated motion only, one theme (locked dark).

## 8. Environment notes (this machine)

- Windows, PowerShell, Node 24, npm 11. Working dir `d:\NEXUS\Umar2`.
- `npm install`, `next build`, and `next dev` need network, so run them with the
  sandbox disabled.
- Not a git repo yet (I offered to `git init` several times; he has not asked
  for it). Re-offer when it next makes sense.
