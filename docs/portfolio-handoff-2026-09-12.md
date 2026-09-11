# Portfolio handoff — 2026-09-12

## Current approved direction

- Preserve the white hero, interactive controller, rotating headline, staged entrance and stepped scroll transition.
- Hero imagery responds to the entire hero pointer area; the primary CTA reuses the footer CTA interaction.
- A purple multilingual greeting preloader precedes the existing hero entrance. Greetings: Hello, Halo, Thai, Japanese, Korean, Bonjour, Hola. No dot.
- Scrolling is locked while the preloader/entrance runs. Wheel, touch-move and scroll keys are blocked; completion restores scrolling. Resource/animation failure watchdogs also unlock. Control activation, navigation and reduced-motion recovery paths remain.
- Mine run retains its layered violet gradient and vector zoom, handing off to the dark-purple chapter field (`--color-chapter-field`).

## Featured Work

`components/work/WorkRail.tsx` owns six projects: Reusely Dashboard, Reusely Design System, Reusely Trade-in, RS Muhammadiyah, Volunteer App, Banding.ID.

Cards are intentionally non-clickable. The old `/work/[slug]` route was removed at the user's request; sitemap no longer advertises those detail pages. Historical content and inactive components may still exist.

Latest card design removes the reference-like white frames and pill tags. Images are edge-to-edge with a subtle border and 14px radius. Captions sit on the purple field, with lime two-digit indices and plain categories separated by slashes. Center scaling is now 1.0 versus 0.91 for neighbors. Desktop scrolling stays vertically driven and horizontal; mobile/reduced-motion uses native horizontal overflow. Scroll distance derives from the project count and measured card width.

High-resolution assets are in `public/images/featured-work/`; keep these separate from the smaller hero assets. Banding.ID uses a generated 1536×1024 laptop-on-rock mockup, saved as `banding-laptop-mockup.webp`. The provided design screenshot captured the headline mid-word; that state is preserved in the mockup. Generated with the built-in image tool using the user's Banding screenshot as screen content and laptop-on-rock reference for composition.

## Scroll cue and wave

- `components/work/StatementPortal.tsx` publishes `data-portal-filled` when the measured solid ink square covers the viewport corners.
- `components/work/WorkScrollCue.tsx` listens for portal updates and native scroll. The bottom-center cue appears on fill and loops vertically by 7px over 1.8s; reduced motion disables this loop and hides the wave.
- The lime SVG uses actual path-length dash units (not normalized length plus non-scaling stroke, which caused separated segments).
- The stroke starts at zero, is 12 SVG units wide, and moves in page space. Its draw range uses heading/card viewport geometry; it is reversible and introduces no extra runway. It fades as cards enter.
- This is an original simplified path informed by the supplied Skiper19 behavior, not its full path or layout.

## Important files

- `lib/hero-intro-bootstrap.ts`: early initialization, eligibility, scroll lock, fail-open deadlines and cleanup.
- `components/hero/useHeroEntrance.ts`: greeting and hero choreography, computed completion budget.
- `components/hero/GreetingPreloader.tsx`: overlay markup.
- `components/hero/HeroStudio.tsx`: full-hero image pointer movement.
- `components/home/HeroStatic.tsx`: CTA integration.
- `components/work/StatementPortal.tsx`: SVG ink camera and fill detection.
- `components/work/WorkScrollCue.tsx`: cue/wave geometry.
- `components/work/WorkRail.tsx`: project data, card rendering and scroll rail.
- `app/globals.css`: appearance and responsive/reduced-motion styles.

## Verification actually performed

- TypeScript (`npx tsc --noEmit`) and `git diff --check` passed during implementation and before handoff.
- Browser checks confirmed wheel/Page Down keep scrollY at zero during entrance; wheel scrolling resumes after normal completion.
- Earlier cue checks covered desktop/mobile, stopping, reverse scroll and reduced motion. Subsequent desktop checks confirmed continuous stroke and card handoff. Latest page-space wave revision received TypeScript checks, not a complete cross-device visual pass.
- Generated Banding mockup was visually inspected. Latest frameless card revision received TypeScript checks; a final desktop/mobile visual review remains advisable.
- No production build or deployment is claimed for this handoff.

## Running / follow-up

Use the scripts in `package.json` (`npm run dev`; current preview has used port 3002). Review at desktop and mobile sizes after the full intro completes. Prioritize fast/reverse scrolling across the wave/card handoff, reduced-motion behavior, touch-device scroll locking and final card caption wrapping. Do not reintroduce detail links or the old white card frames without user approval.
