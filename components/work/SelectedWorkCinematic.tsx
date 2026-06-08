"use client";

import { useRef, type FocusEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { projects } from "@/lib/content";
import { ProjectCard } from "@/components/work/ProjectCard";
import { HorizontalCard } from "@/components/work/HorizontalCard";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
  Desktop-only cinematic for the work index. Mounted by WorkEnhancer behind a
  capability + reduced-motion gate; the static <SelectedWork/> is the fallback.

  Scroll-driven sticky scroll-stack over one CSS-sticky stage (no ScrollTrigger
  pin:true -- the shipped hero and Positioning both pin via position:sticky, so
  this mirrors them and can never inject a pin-spacer that mis-pushes the section
  below):

    0. The big title (top-left) and the FIRST wide card are visible at rest.
    1. On scroll the title slides up and clears; the first card rises to its rest.
    2. Cards 2..6 deal up from below and STACK on top, one per scroll beat. As
       each new card lands in front, the cards already in the deck recede (scale)
       and dim (opacity) one depth level, so the stack reads as 3D.
    3. The stack IS the end state -- no grid finale. The last card (06/06) is the
       front card when the section ends.

  Interaction: every card is a real link to /work/[slug]. Only the FRONT (active)
  card is mouse-clickable and shows its "View case file" CTA + hover lift; the
  active card is derived idempotently from scroll progress. All cards stay in the
  tab order, and focusing one with the keyboard scrolls it to the front, so every
  project is reachable without a mouse.

  Reduced motion: WorkEnhancer does not mount this on a reduced-motion load (the
  static grid shows instead). If reduced motion is toggled mid-session, the
  matchMedia branch hides the stack and reveals the in-stage grid fallback below
  (the only place the grid cards are display-rendered, so view-transition names
  never collide with the stack's). Everything animated is transform/opacity only.
*/

const N = projects.length; // 6

// Sticky stack near the top: cards clear the fixed navbar (h-16 = 64px) by ~40px
// and peek downward, newer cards in front.
const PEEK = 16; // px
const NAV_CLEAR = 104; // px from the stage top (navbar 64 + 40 gap)
const stackTop = (i: number) => NAV_CLEAR + i * PEEK;
// Card 0 starts this far below its top rest (under the intro title) and rises to
// the top as the title clears.
const INTRO_DROP = 130; // px
// As each new card lands in front, every card already in the deck recedes one
// depth level (scales down + dims a notch) so the stack reads as 3D. Scale
// pivots at the top edge (see transformOrigin) so the peeking tops stay fixed.
const STACK_SCALE_STEP = 0.04;
const STACK_OPACITY_STEP = 0.13;

// Normalised [0,1] timeline (see the spacer tween) so scroll progress maps 1:1.
const TITLE_OUT = 0.03; // title clears
const STACK_START = 0.16; // card 1 begins dealing
const STACK_STAGGER = 0.165; // spacing between deals (card 5 starts ~0.82)
const STACK_DUR = 0.1; // a single deal-in / recede
// Progress at which card i becomes the front (active) card.
const activeThreshold = (i: number) =>
  i === 0 ? 0.1 : STACK_START + (i - 1) * STACK_STAGGER + STACK_DUR * 0.5;
// Progress that parks card i comfortably at the front (keyboard focus jumps here).
const restProgress = (i: number) =>
  i === 0
    ? 0.12
    : Math.min(0.96, STACK_START + (i - 1) * STACK_STAGGER + STACK_DUR + 0.02);

export default function SelectedWorkCinematic() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const introTitle = useRef<HTMLDivElement>(null);
  const hcardRefs = useRef<HTMLDivElement[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);

  // Skip the long scrubbed stack: jump near the end (last card on top).
  const handleSkip = () => {
    const st = stRef.current;
    if (st) st.scroll(st.start + 0.97 * (st.end - st.start));
  };

  // Keyboard focus on a card scrolls it to the front so it is revealed and
  // clickable. Ignore focus that came from a mouse click (no jump on click).
  const focusCard = (i: number, e: FocusEvent<HTMLAnchorElement>) => {
    const st = stRef.current;
    if (!st) return;
    if (!e.currentTarget.matches(":focus-visible")) return;
    st.scroll(st.start + restProgress(i) * (st.end - st.start));
  };

  useGSAP(
    () => {
      const rootEl = root.current;
      const stageEl = stage.current;
      if (!rootEl || !stageEl) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const hcards = hcardRefs.current.filter(Boolean);
        if (hcards.length !== N) return;

        // The stack is the experience: hide the in-stage grid fallback + header.
        gsap.set(deck.current, { display: "none" });
        gsap.set(header.current, { autoAlpha: 0 });
        gsap.set(introTitle.current, { autoAlpha: 1, y: 0 });

        // Resting (pre-show) state. Cards use plain opacity (not autoAlpha) so
        // they stay in the tab order even while transparent -- keyboard users can
        // focus any card and it scrolls itself to the front. Scale pivots at the
        // top edge so a receding card keeps its peeking top in place.
        gsap.set(hcards, { transformOrigin: "50% 0%", pointerEvents: "none" });
        hcards.forEach((c, i) =>
          gsap.set(c, {
            zIndex: i + 1,
            y: i === 0 ? stackTop(0) + INTRO_DROP : stackTop(i),
            scale: 1,
            opacity: i === 0 ? 1 : 0,
          }),
        );

        const tl = gsap.timeline({ paused: true });
        // Spacer: pins total duration to 1 so tl.progress(p) maps to fractions.
        tl.to({}, { duration: 1 }, 0);

        // Beat 1 -- intro title clears; the first card rises to its top rest.
        tl.to(
          introTitle.current,
          { y: -48, autoAlpha: 0, ease: "power2.in", duration: 0.06 },
          TITLE_OUT,
        );
        tl.to(
          hcards[0],
          { y: stackTop(0), ease: "power2.out", duration: 0.08 },
          TITLE_OUT,
        );

        // Beat 2 -- cards 2..6 deal up and sticky-stack on top. The dealing card
        // lands in front at full size; every card already in the deck recedes one
        // depth level (absolute targets so they survive invalidate).
        for (let i = 1; i < N; i++) {
          const side = i % 2 ? 1 : -1;
          const dealAt = STACK_START + (i - 1) * STACK_STAGGER;
          tl.fromTo(
            hcards[i],
            {
              y: () => window.innerHeight * 0.62,
              rotation: side * 3,
              opacity: 0,
            },
            {
              y: stackTop(i),
              rotation: 0,
              opacity: 1,
              ease: "power3.out",
              duration: STACK_DUR,
              immediateRender: false,
            },
            dealAt,
          );
          for (let j = 0; j < i; j++) {
            const depth = i - j;
            tl.to(
              hcards[j],
              {
                scale: 1 - depth * STACK_SCALE_STEP,
                opacity: 1 - depth * STACK_OPACITY_STEP,
                ease: "power3.out",
                duration: STACK_DUR,
              },
              dealAt,
            );
          }
        }

        // Active (front) card: only it is mouse-clickable and shows its CTA.
        // Derived idempotently from progress -- no fragile latch.
        let activeIdx = -1;
        const computeActive = (p: number) => {
          let a = 0;
          for (let i = 1; i < N; i++) if (activeThreshold(i) <= p) a = i;
          return a;
        };
        const applyActive = (a: number) => {
          if (a === activeIdx) return;
          activeIdx = a;
          hcards.forEach((c, i) => {
            const on = i === a;
            c.style.pointerEvents = on ? "auto" : "none";
            if (on) c.setAttribute("data-active", "true");
            else c.removeAttribute("data-active");
          });
        };

        const st = ScrollTrigger.create({
          trigger: rootEl,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            tl.progress(self.progress);
            applyActive(computeActive(self.progress));
          },
          onRefresh: (self) => {
            tl.invalidate();
            tl.progress(self.progress);
            applyActive(computeActive(self.progress));
          },
          onToggle: (self) =>
            gsap.set(hcards, {
              willChange: self.isActive ? "transform" : "auto",
            }),
        });
        stRef.current = st;
        applyActive(computeActive(st.progress));

        let raf = 0;
        const refresh = () => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => ScrollTrigger.refresh());
        };
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => ScrollTrigger.refresh());
        }
        const ro = new ResizeObserver(refresh);
        ro.observe(stageEl);

        return () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          st.kill();
          stRef.current = null;
          // Direct (non-GSAP) styles/attrs are not reverted by matchMedia; clear
          // them so a flip to reduced-motion leaves no stale interactive card.
          hcards.forEach((c) => {
            c.style.pointerEvents = "";
            c.removeAttribute("data-active");
          });
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const hcards = hcardRefs.current.filter(Boolean);
        // Static fallback: hide the stack (out of the tab order too) and reveal
        // the in-stage grid. The grid cards are the only project links rendered
        // here now, so their view-transition names cannot collide.
        gsap.set(hcards, { display: "none" });
        gsap.set(deck.current, { pointerEvents: "auto" });
      });

      // Revert the matchMedia on unmount (useGSAP's context revert does not).
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="work-cine relative h-[440dvh]">
      <div
        ref={stage}
        className="sticky top-0 h-[100dvh] overflow-hidden bg-void"
        style={{ perspective: "1600px" }}
      >
        <button
          type="button"
          onClick={handleSkip}
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-40 focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-wider focus:text-void"
        >
          Skip the stacking animation
        </button>

        {/* Persistent heading for assistive tech (visible titles are animated
            and aria-hidden; the static fallback's h2 is display:none here). */}
        <h2 className="sr-only">Selected work</h2>

        {/* Beat 0/1 -- big intro title, top-left, visible at rest then clears. */}
        <div
          ref={introTitle}
          aria-hidden="true"
          // opacity-0 by default: GSAP fades it in for the show; if GSAP reverts
          // (reduced-motion toggled mid-session), it falls back to hidden so only
          // the grid fallback remains.
          className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pt-[7vh] opacity-0 sm:px-8 lg:px-20"
        >
          <div className="mx-auto max-w-[1400px]">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-graphite">
              06 / case files
            </p>
            <div
              className="font-display font-extrabold uppercase leading-[1] tracking-tight text-vellum"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5.25rem)" }}
            >
              Selected work
            </div>
          </div>
        </div>

        {/* Beat 2 -- horizontal cards, full content width, sticky-stacking. Each
            is a real link; the cinematic flags the front one data-active. */}
        <div className="pointer-events-none absolute inset-0 z-10 px-4 sm:px-8 lg:px-20">
          <div className="mx-auto grid h-full max-w-[1400px] items-start">
            {projects.map((p, i) => (
              <div
                key={p.slug}
                ref={(el) => {
                  if (el) hcardRefs.current[i] = el;
                }}
                // opacity-0 default so a GSAP revert (reduced-motion) cleanly
                // hides the whole stack. w-full fills the section width. GSAP
                // owns this wrapper's transform; the link inside stays static.
                className="hcard h-[clamp(340px,60vh,660px)] w-full opacity-0"
                style={{ gridArea: "1 / 1" }}
              >
                <HorizontalCard
                  project={p}
                  index={i}
                  total={N}
                  href={`/work/${p.slug}`}
                  onFocus={(e) => focusCard(i, e)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Reduced-motion fallback (mid-session toggle): top-left header + the
            real grid. Hidden under motion (display:none / autoAlpha 0); this is
            the only place the grid project links are display-rendered. */}
        <div className="pointer-events-none absolute inset-0 z-20 px-4 pb-[6vh] pt-[7vh] sm:px-8 lg:px-20">
          <div className="mx-auto flex h-full max-w-[1400px] flex-col">
            <div ref={header} className="shrink-0">
              <div
                className="font-display font-extrabold uppercase leading-[1] tracking-tight text-vellum"
                style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.6rem)" }}
              >
                Selected work
              </div>
              <p
                className="mt-3 max-w-[48ch] text-vellum/70"
                style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.15rem)" }}
              >
                Six systems I designed end to end. Dashboards, workflows, and the
                design systems beneath them.
              </p>
            </div>

            <div
              ref={deck}
              className="mt-[4vh] grid min-h-0 flex-1 grid-cols-3 content-center gap-5"
            >
              {projects.map((p) => (
                <div key={p.slug}>
                  <ProjectCard project={p} compact />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
