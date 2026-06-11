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
9. Selected Work concept: the "Selected Work" title should appear from behind
   the previous section (same reveal feel as the Positioning statement), then
   reveal the 6 project cards one by one, stacked, then expand the stack into
   the full grid where all 6 are visible together. Use GSAP.
10. Stacked cards must have an opaque surface. Near-transparent cards
    (rgba vellum at 0.02 on void) let every stacked card's text bleed through
    and read as a mess; opaque cards occlude the ones beneath.
11. Sequencing: the title must fully disappear BEFORE the cards reveal (no
    overlap), then reappear as a top-left section header with a description
    AFTER all the cards have landed.
12. Reworked the card layout to horizontal (media left, text right) and the
    reveal to a sticky stack: the first card sticks and each next card deals up
    and stacks on top, like a "how we work" process section. End state stays the
    compact 3x2 grid from the prior version (he picked "grid" when asked).
13. Alignment: the cinematic title was not lining up with the other sections.
    Match the site's container exactly so the left edge aligns with the text
    above (see lesson 12 in section 6).
14. The cards should fill the section width, not sit in a narrower centred box.
15. During the stack the cards should be sticky near the top, about 40px below
    the navbar, not floating in the vertical centre. The first card rises from
    under the title to that top rest as the title clears.
16. Responsive overlap on short laptop heights (fine on large screens). Two hero
    backgrounds collided with text only at laptop viewport heights: the state 02
    "24px space.lg" token chip landed on the "rules everything inherits." sub
    line, and the state 04 component folder (pocket + "click to open" caption)
    dropped onto the "Every state designed." headline. Both read fine on tall
    monitors. Cause and fix in lesson 18.
17. Selected Work depth cue: the cards already in the stack should look 3D as a
    new card lands. Two passes he asked for, in order: (a) the stacked cards get
    SMALLER the deeper they sit; (b) they also get more TRANSPARENT the deeper
    they sit (more stacked = smaller + fainter), so the deck recedes into the void.
18. Selected Work flow CHANGE (supersedes items 9, 11, 12, lesson 16, and the old
    HorizontalCard note in section 7). It should STAY stacked: no bloom into the
    full 3x2 grid. The last card is the end of the section. The cards are now
    clickable to open the case file. Chosen via clarifying questions: a "sticky
    scroll-stack" where only the front (active) card is clickable and carries a
    hover lift + a "View case file" button cue, and clicking navigates to the
    /work/[slug] page (not an in-place modal).
19. Began replacing the mock work index with real case studies, one card at a time,
    each linking to a real /work/[slug] page. #1 = the Reusely AI design workflow
    (new "Ways of Working" type). #2 = the Reusely design system ("Design System"
    type, replaced the mock pipeline; still 6 cards, no duplicate). Reusely and the
    tools are named (he confirmed).
20. #1 framing (chosen via clarifying questions): "two paths to the same screen",
    his AI loop (ChatGPT brainstorm, Claude Code prototype, Figma MCP components,
    Figma iterate) against the conventional manual-Figma path, told through ONE
    example, the trade-in widget. The AI workflow is the subject; the widget is one
    example, not the whole story. The loop is its own highlighted section, and the
    card surfaces it with an "AI workflow" stack line.
21. Honesty correction. My first proof line "hours not days" was an overclaim (the
    widget was about one to two focused weeks across a month, split with another
    feature). Reframed to the honest, stronger claim: a working build that runs the
    real logic and every edge case, which a Figma prototype can only fake as static
    frames. Never ship fake-precise numbers.
22. He supplies the assets: real before/after screenshots plus a generated, abstract
    on-brand cover, and he removed the prototype iframe embed for a plain link. For
    #2 the "before" was so scattered he had to ask the previous designer to
    understand prior work; the "after" is one named library (foundations as Figma
    variables feeding tokens, documented components, adopted across products), built
    solo in about a month.

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
11. GSAP fromTo immediateRender. In a scrubbed timeline, fromTo defaults to
    immediateRender:true, so it paints its from-state at build time and the
    element flashes visible before the scrub reaches it (the cards showed at
    progress 0). Set immediateRender:false on staggered/later fromTo tweens and
    hide the initial state with an explicit gsap.set, so each element stays
    hidden until its own playhead arrives.
12. Section container nesting. Every section nests as outer padding then inner
    max-w-[1400px] mx-auto (px-4 sm:px-8 lg:px-20 on the outer). Putting both on
    one element (max-w then padding) indents the content by the padding amount
    and breaks left-edge alignment with the rest of the page. Match the
    outer-padding-then-inner-max-w pattern; for absolute overlays, pad the
    inset-0 element and centre an inner max-w wrapper.
13. matchMedia cleanup. A gsap.matchMedia() created inside useGSAP is NOT
    reverted by the useGSAP context revert. Return () => mm.revert() from the
    useGSAP callback so its listeners and tweens tear down on unmount (the
    WebGLHero pattern).
14. Reduced-motion fallback for animated layers. Default the decorative animated
    elements (intro title, the stacking cards) to opacity-0 in CSS and leave the
    resting content (the grid) visible. Then a matchMedia revert (reduced-motion
    toggled mid-session) clears GSAP's inline styles and the stage falls back to
    a clean, clickable grid with no leftover overlapping layers.
15. Pin with CSS sticky, ScrollTrigger only for scrubbed progress. The whole
    site pins via position:sticky (hero, Positioning, the work cinematic); never
    ScrollTrigger pin:true. pin:true injects a pin-spacer that, sitting next to
    the Positioning negative-margin reveal, is the classic "jumps a section" /
    mis-push bug. Drive a paused master timeline via tl.progress(self.progress)
    in onUpdate, on a normalised [0,1] clock (a 1-unit spacer tween fixes total
    duration to 1).
16. Stack-to-grid via hand-rolled FLIP. (SUPERSEDED by section-4 item 18 and
    lessons 19-20: the stack no longer blooms into a grid, so this FLIP code was
    removed. Kept for history.) The grid cards live in the real CSS grid (honest,
    clickable DOM, correct view-transitions, no ghost tree, no reflow swap). The
    deck/stack is an inverse transform on top: measure each card's true slot and
    the pile centre, store the delta, tween it to zero. Remeasure on every
    ScrollTrigger refresh so the landing is correct at any viewport.
17. Trust but verify review agents (again, see lesson 8). The adversarial review
    confirmed three real fixes but also proposed replacing a function-based
    fromTo from-value with a frozen constant, which would have broken resize
    re-resolution (GSAP only re-evaluates function values on invalidate). Trace
    the GSAP / CSS semantics before applying a review fix.
18. Responsive overlap: top-anchored fixed-px decoration vs viewport-relative
    text. A decoration pinned to the top with a near-fixed pixel height (the
    state-04 folder at top-[8%], scale 1.4) or a chip at a raw top:% rides INTO
    bottom-anchored or flow text as the viewport shortens, while looking fine when
    tall (its % resolves to fewer px and climbs into the text). Fix by tracking
    the SAME anchor the text uses: (a) pin a chip a fixed clearance below the
    text's own anchor, top: calc(19vh + 260px) instead of a raw %, so it sits the
    same gap below at every height; (b) drive a decoration's scale from a CSS var
    that viewport-HEIGHT media queries shrink (--folder-scale: 1.4 down to 0.9),
    scaling from center-top so a smaller scale lifts the bottom edge clear of the
    text. Short screens are also narrower, so the text shrinks too, adding margin.
19. Stay-stacked Selected Work: unique view-transition names without the grid
    finale. The stacking cards now ARE the navigable links (title-{slug} on the
    title), and the in-stage grid is only the reduced-motion-mid-session fallback.
    To avoid duplicate view-transition names, the stack and the grid are never
    display-rendered at the same time: under motion gsap.set(deck,{display:"none"});
    under a reduced-motion mid-session flip the matchMedia reduce branch
    gsap.set(hcards,{display:"none"}) and shows the grid. The external static
    .work-static grid is already display:none under data-work=cinematic. Only
    display:none (not opacity/visibility) makes a name inert for VT capture.
20. Stay-stacked Selected Work: keyboard reach + depth recede. (a) Keyboard: every
    card stays in the tab order, so hide undealt cards with plain opacity, NOT
    autoAlpha (autoAlpha sets visibility:hidden, which drops the element from the
    tab order). On focus, scroll that card to the front (st.scroll to its rest
    progress) and gate that behind :focus-visible so a mouse click does not jump.
    Only the front card gets pointer-events:auto, derived idempotently from
    progress (no latch). (b) Depth recede: animate scale AND opacity down per depth
    level with transformOrigin "50% 0%" so the peeking tops stay fixed; use
    ABSOLUTE targets (not "-=") so they survive invalidateOnRefresh (lesson 17);
    read offsetHeight (not getBoundingClientRect) for layout measures that must
    ignore the live scale.
21. Case-study content model. Project gained an optional `study` (CaseStudy): lede,
    role, duration, metric, and optional loop / comparison / prototypeUrl /
    before+after / gallery, plus sections. app/work/[slug]/page.tsx renders the rich
    study when present and the old placeholder spine otherwise, so real content
    lands one project at a time without touching the others. Project also gained
    cover (card media image) and stack + stackLabel (a labelled tool or makeup line
    on the card, e.g. "AI workflow: ChatGPT / Claude Code / Figma MCP").
22. Cover art must fit the slot. The cinematic card cover is roughly SQUARE (the
    left half at full card height), so generate cover illustrations at 1:1 and fill
    with object-cover; a wide 16:10 image crops hard or letterboxes. An abstract
    dark illustration blends into the dark card. Do not feed real UI to the image
    model for a collage (it reads as slop): use either a real screenshot or a clean
    abstract from a text prompt, on palette (void background, vellum and graphite,
    one amber accent).
23. Wide reference boards render full-width and uncropped. Design-system file grids,
    foundations, and component sheets are wide and dense, so a small side-by-side is
    illegible. Use a full-width captioned gallery (w-full, natural aspect, no
    object-cover crop) so the scatter-to-order story reads. Reserve the side-by-side
    before/after pair for clean, similar-aspect UI shots.
24. Honesty, and the colleague-comparison risk. Lead with the honest claim, never a
    fake-precise number. When the story compares to another designer's method, at a
    current employer, in public, compare METHODS not people ("the conventional path"
    vs "the path I run"), so it never reads as throwing a colleague under the bus.

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
- Work index follows the same enhancer pattern. A desktop-only GSAP cinematic
  island (`components/work/SelectedWorkCinematic.tsx`) is code-split and gated by
  `WorkEnhancer` (pointer:fine, min-width 1024, no reduced-motion), mirroring
  `HeroEnhancer` with an `html[data-work="cinematic"]` attribute that hides the
  static `.work-static` grid. The cinematic is now a sticky SCROLL-STACK that
  STAYS stacked (no grid finale): cards deal up one per scroll beat, each new one
  lands in front while the deck behind recedes (scale) and dims (opacity) per
  depth level; the last card (06/06) is the end state. Only the front (active)
  card is clickable, derived from scroll progress, and it carries a hover lift +
  a "View case file" button (styled in `globals.css` off `.hcard[data-active]`).
  `HorizontalCard` is therefore now a real link to `/work/[slug]` carrying the
  `title-{slug}` view-transition (NOT decorative any more). Duplicate
  view-transition names are avoided by never display-rendering the stack and any
  grid at the same time (see lesson 19). The static, filterable `<SelectedWork/>`
  grid (`.work-static`) is the SSR / mobile / reduced-motion / no-JS fallback; the
  cinematic also keeps an in-stage grid as the reduced-motion-mid-session
  fallback. GSAP enters only via this code-split chunk, so the home First Load JS
  stays put (about 160 kB).
- Case studies are real content now, filled one card at a time. Project carries an
  optional `study` (CaseStudy) that app/work/[slug]/page.tsx renders; without it a
  card falls back to the placeholder reading spine. #1 (reusely-design-workflow,
  "Ways of Working") and #2 (reusely-design-system, "Design System") are real; the
  rest stay mock. Card covers and evidence shots live in public/asset/project/
  (square abstract illustrations or real screenshots); wide evidence boards use the
  full-width gallery, while the clean before/after pair stays side-by-side.
- Non-negotiables: full reduced-motion and no-WebGL fallbacks with byte-identical
  copy, keyboard-operable hero, WCAG AA, LCP under 2.5s with SSR text first,
  CLS near zero, motivated motion only, one theme (locked dark).

## 8. Environment notes

- Current machine: macOS (darwin), bash, Node 22.17, npm 10.9. Working dir
  `/Users/umar/portofolio`. (The project was previously built on a Windows /
  PowerShell / Node 24 machine at `d:\NEXUS\Umar2`; the PowerShell-specific
  commands in lesson 1 are from there.)
- `npm install`, `next build`, and `next dev` need network, so run them with the
  sandbox disabled.
- Dev server: `npm run dev` serves on port 3002. On macOS, kill a stuck listener
  with `lsof -ti :3002 | xargs kill -9`. In the agent harness the backgrounded
  `next dev` tends to exit on its own once a turn ends, so it usually needs a
  restart at the start of a session before he can view the site.
- Git repo: origin `https://github.com/umarhiu/portofolio.git`, default branch
  `main`. Work is committed straight to `main` (solo portfolio, linear history);
  he asks to "push and commit" rather than open PRs.
