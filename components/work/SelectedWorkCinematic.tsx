"use client";

import { useRef } from "react";
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

  Scroll-driven beats over one CSS-sticky stage (no ScrollTrigger pin:true --
  the shipped hero and Positioning both pin via position:sticky, so this mirrors
  them and can never inject a pin-spacer that mis-pushes the section below):

    0. The big title (top-left) and the FIRST wide card are visible at rest.
    1. On scroll the title slides up and clears.
    2. Cards 2..6 deal up from below and STACK on top of the first -- a sticky
       deck where earlier cards peek at the top (image-left/text-right cards).
    3. The horizontal stack cross-dissolves into the grid "bloom": each grid
       card relaxes to transform identity == its slot in a real CSS grid (the
       end state requested -- same compact 3x2 grid as before). Honest,
       clickable DOM; no reflow swap.
    4. The title returns as a top-left section header; the grid holds, pinned.

  The grid deck is an inverse transform on top of the real grid (hand-rolled
  FLIP): measure each card's true slot + the stage centre, store the delta that
  flings it to the centre pile, tween it to zero. Remeasured on every refresh.
  Everything animated is transform/opacity only.
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

// Grid finale fan (restrained "case files" spread).
const FAN_ROT = [-4, 2.5, -1.5, 3, -2.5, 1];
const fanX = (i: number) => (i - (N - 1) / 2) * 7;
const fanY = (i: number) => (i - (N - 1) / 2) * -6;
const fanZ = (i: number) => i * 16;

// Normalised [0,1] timeline (see the spacer tween) so scroll progress maps 1:1.
const TITLE_OUT = 0.04; // 0.04 -> 0.12
const STACK_START = 0.12;
const STACK_STAGGER = 0.095;
const STACK_DUR = 0.11; // cards 1..5; last lands ~0.61
const MORPH_START = 0.64; // horizontal stack fades out
const FADE_DUR = 0.1;
const BLOOM_START = 0.64; // grid blooms in (cross-dissolve)
const BLOOM_STAGGER = 0.015;
const BLOOM_DUR = 0.14; // last grid card lands ~0.855
const HEADER_IN = 0.8; // 0.80 -> 0.88
const INTERACT_AT = 0.88; // grid clickable, then holds to 1.0

export default function SelectedWorkCinematic() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);
  const introTitle = useRef<HTMLDivElement>(null);
  const hcardRefs = useRef<HTMLDivElement[]>([]);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);

  const handleSkip = () => {
    const st = stRef.current;
    if (st) st.scroll(st.start + INTERACT_AT * (st.end - st.start));
  };

  useGSAP(
    () => {
      const rootEl = root.current;
      const deckEl = deck.current;
      const stageEl = stage.current;
      if (!rootEl || !deckEl || !stageEl) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const grid = cardRefs.current.filter(Boolean);
        const hcards = hcardRefs.current.filter(Boolean);
        if (grid.length !== N || hcards.length !== N) return;

        // Per grid-card inverse transform that flings it to the centre pile
        // (stage centre, where the horizontal stack lives). Recomputed on every
        // refresh from real layout rects, so the bloom lands correctly at any
        // viewport.
        const dx: number[] = [];
        const dy: number[] = [];
        const scl: number[] = [];

        const measure = () => {
          gsap.set(grid, { x: 0, y: 0, scale: 1, rotation: 0, z: 0 });
          const s = stageEl.getBoundingClientRect();
          const cx = s.left + s.width / 2;
          // Pile the grid bloom where the horizontal stack sits (top region), so
          // the cross-dissolve flows from the stack into the grid.
          const cardH = hcards[0].getBoundingClientRect().height;
          const cy = s.top + NAV_CLEAR + cardH / 2;
          const stackW = Math.min(560, window.innerWidth * 0.78);
          const maxStackH = window.innerHeight * 0.6;
          grid.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            dx[i] = cx - (r.left + r.width / 2);
            dy[i] = cy - (r.top + r.height / 2);
            scl[i] = Math.min(stackW / r.width, maxStackH / r.height);
          });
        };

        // Resting (pre-show) state: intro title + first horizontal card visible;
        // the rest of the stack and the whole grid hidden.
        gsap.set(introTitle.current, { autoAlpha: 1, y: 0 });
        gsap.set(header.current, { autoAlpha: 0, y: 26 });
        gsap.set(grid, { autoAlpha: 0 });
        hcards.forEach((c, i) =>
          gsap.set(c, {
            zIndex: i + 1,
            y: i === 0 ? stackTop(0) + INTRO_DROP : stackTop(i),
            autoAlpha: i === 0 ? 1 : 0,
          }),
        );

        measure();

        const tl = gsap.timeline({ paused: true });
        // Spacer: pins total duration to 1 so tl.progress(p) maps to fractions.
        tl.to({}, { duration: 1 }, 0);

        // Beat 1 -- intro title clears; the first card rises to its top rest.
        tl.to(
          introTitle.current,
          { y: -48, autoAlpha: 0, ease: "power2.in", duration: 0.08 },
          TITLE_OUT,
        );
        tl.to(
          hcards[0],
          { y: stackTop(0), ease: "power2.out", duration: 0.1 },
          TITLE_OUT,
        );

        // Beat 2 -- cards 2..6 deal up from below and stack on top.
        for (let i = 1; i < N; i++) {
          const side = i % 2 ? 1 : -1;
          tl.fromTo(
            hcards[i],
            {
              y: () => window.innerHeight * 0.62,
              rotation: side * 3,
              autoAlpha: 0,
            },
            {
              y: stackTop(i),
              rotation: 0,
              autoAlpha: 1,
              ease: "power3.out",
              duration: STACK_DUR,
              immediateRender: false,
            },
            STACK_START + (i - 1) * STACK_STAGGER,
          );
        }

        // Beat 3a -- the horizontal stack cross-dissolves out.
        tl.to(
          hcards,
          { autoAlpha: 0, scale: 0.96, ease: "power2.in", duration: FADE_DUR },
          MORPH_START,
        );

        // Beat 3b -- the grid blooms in from the centre pile to its real slots.
        grid.forEach((c, i) => {
          tl.fromTo(
            c,
            {
              x: () => dx[i] + fanX(i),
              y: () => dy[i] + fanY(i),
              rotation: FAN_ROT[i],
              scale: () => scl[i],
              z: fanZ(i),
              autoAlpha: 0,
            },
            {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              z: 0,
              autoAlpha: 1,
              ease: "power3.inOut",
              duration: BLOOM_DUR,
              immediateRender: false,
            },
            BLOOM_START + i * BLOOM_STAGGER,
          );
        });

        // Beat 4 -- the title returns as the top-left section header.
        tl.to(
          header.current,
          { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.08 },
          HEADER_IN,
        );

        // Interactivity derived idempotently from progress (no fragile latch):
        // the grid is focusable/clickable only once bloomed and at identity.
        let interactive = false;
        const setInteractive = (on: boolean) => {
          deckEl.style.pointerEvents = on ? "auto" : "none";
          if (on) deckEl.removeAttribute("inert");
          else deckEl.setAttribute("inert", "");
        };
        const reconcile = (p: number) => {
          const want = p >= INTERACT_AT;
          if (want !== interactive) {
            interactive = want;
            setInteractive(want);
          }
        };
        setInteractive(false);

        const st = ScrollTrigger.create({
          trigger: rootEl,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            tl.progress(self.progress);
            reconcile(self.progress);
          },
          onRefresh: (self) => {
            measure();
            tl.invalidate();
            tl.progress(self.progress);
            reconcile(self.progress);
          },
          onToggle: (self) =>
            gsap.set([...grid, ...hcards], {
              willChange: self.isActive ? "transform" : "auto",
            }),
        });
        stRef.current = st;

        let raf = 0;
        const refresh = () => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => ScrollTrigger.refresh());
        };
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => ScrollTrigger.refresh());
        }
        const ro = new ResizeObserver(refresh);
        ro.observe(deckEl);

        return () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          st.kill();
          stRef.current = null;
          // The matchMedia revert clears GSAP's inline styles, so the stage
          // returns to CSS defaults: intro title + horizontal cards are
          // opacity-0 (hidden), the grid + header are visible at identity. Leave
          // the grid clickable for that reduced-motion fallback.
          deckEl.removeAttribute("inert");
          deckEl.style.pointerEvents = "auto";
        };
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
          Skip to work grid
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
          // the grid remains -- no leftover title or cards over the grid.
          // Padding on the outer, max-w on the inner -> same nesting as the other
          // sections, so the left edge lines up with the Positioning text above.
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

        {/* Beat 2 -- horizontal cards, full content width, stacking. Decorative. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 px-4 sm:px-8 lg:px-20"
        >
          <div className="mx-auto grid h-full max-w-[1400px] items-start">
            {projects.map((p, i) => (
              <div
                key={p.slug}
                ref={(el) => {
                  if (el) hcardRefs.current[i] = el;
                }}
                // opacity-0 default so a GSAP revert (reduced-motion) cleanly
                // hides the whole stack, leaving just the grid below. w-full
                // fills the section width.
                className="h-[clamp(340px,60vh,660px)] w-full opacity-0"
                style={{ gridArea: "1 / 1" }}
              >
                <HorizontalCard project={p} index={i} total={N} />
              </div>
            ))}
          </div>
        </div>

        {/* Beats 3/4 -- content column: top-left header (in flow, space reserved
            via autoAlpha) + the real grid that blooms in for the finale. Above
            the horizontal stack so the bloom appears over the fading cards. */}
        <div className="pointer-events-none absolute inset-0 z-20 px-4 pb-[6vh] pt-[7vh] sm:px-8 lg:px-20">
          <div className="mx-auto flex h-full max-w-[1400px] flex-col">
            <div ref={header} aria-hidden="true" className="shrink-0">
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
            style={{ transformStyle: "preserve-3d" }}
          >
            {projects.map((p, i) => (
              <div
                key={p.slug}
                ref={(el) => {
                  if (el) cardRefs.current[i] = el;
                }}
              >
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
