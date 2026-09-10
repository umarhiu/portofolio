"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { Link } from "next-view-transitions";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { projects, type Project } from "@/lib/content";

/*
  The horizontal rail of case files, shown once the portal has flooded the
  screen amber. Big image-first cards (cover, title, one-line outcome, two
  badges), one centred with its neighbours peeking at both edges. Scrolling the
  page drives the rail sideways one card per viewport of scroll, snapping card
  to card on a spring, and the eyebrow counts the centred card.

  Built on Motion, which is already in the home bundle, so this adds no GSAP
  and no code-split island. Pinning is CSS position: sticky on a tall track,
  never ScrollTrigger pin, matching the rest of the site.

  Enhancement is gated exactly like SmoothScroll and the old cinematic: a fine
  pointer, a desktop width and motion allowed. Everyone else, and the server
  render, gets the same cards in a plain horizontally scrollable row with
  native snap points, so the content is byte-identical and reachable without
  JavaScript. The gate is a mount effect, never the SSR output, so it cannot
  cause a hydration mismatch.

  The scroll-driven variant is its own component. Motion's useScroll throws
  ("Target ref is defined but not hydrated") if the target ref is not attached
  when its effect runs, which is exactly what happened when one component held
  the ref but only rendered the track in one of two branches. Keeping the hook
  inside the component that always renders the track is what makes it safe.

  Every card carries view-transition-name: title-{slug}, which is why this rail
  and the other Selected Work implementations are never in the tree together
  (see lib/flags.ts).
*/

const N = projects.length;
const CAPABLE_QUERY =
  "(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 1024px)";

const pad = (n: number) => String(n).padStart(2, "0");

function Card({
  project,
  index,
  onFocus,
}: {
  project: Project;
  index: number;
  onFocus?: (event: FocusEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <li className="work-rail__card">
      <Link
        href={`/work/${project.slug}`}
        className="group block"
        onFocus={onFocus}
        data-rail-card={index}
      >
        <div className="work-rail__media">
          {project.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover}
              alt=""
              aria-hidden="true"
              loading={index < 2 ? "eager" : "lazy"}
              className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                {project.type}
              </span>
            </div>
          )}
        </div>
        <h3
          className="mt-7 font-display font-extrabold uppercase leading-[1.02] tracking-tight"
          style={{
            fontSize: "clamp(1.6rem, 2.6vw, 2.75rem)",
            viewTransitionName: `title-${project.slug}`,
          }}
        >
          {project.title}
        </h3>
        <p
          className="mt-4 max-w-[52ch] text-void/80"
          style={{ fontSize: "1.1rem", lineHeight: 1.55 }}
        >
          {project.outcome}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
          <li className="work-rail__badge">{project.type}</li>
          <li className="work-rail__badge">{project.depth}</li>
        </ul>
      </Link>
    </li>
  );
}

function Heading({ current }: { current: number }) {
  return (
    <div className="px-4 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em]">
          <span className="tabular" aria-live="polite" aria-atomic="true">
            {pad(current)} / {pad(N)}
          </span>
          <span aria-hidden="true">&nbsp;&nbsp;&nbsp;</span>
          case files
        </p>
        <h2
          className="font-display font-extrabold uppercase leading-[1] tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5.25rem)" }}
        >
          Selected work
        </h2>
      </div>
    </div>
  );
}

/** Server render, touch, narrow, reduced motion: a native snap scroller. */
function RailStatic() {
  return (
    <div className="work-rail work-rail--static py-24 lg:py-32" data-rail-mode="static">
      <Heading current={1} />
      <ul className="work-rail__list mt-12 flex items-start">
        {projects.map((project, i) => (
          <Card key={project.slug} project={project} index={i} />
        ))}
      </ul>
    </div>
  );
}

/** Capable desktop: the page scroll drives the rail, one card per viewport. */
function RailScroll() {
  const track = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  // One viewport of scroll per card: the track is N viewports tall and the
  // stage is one, so progress 0..1 spans exactly N-1 card steps.
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  // Slot = card width + gap, measured from the DOM so the CSS owns the sizes.
  const slot = useRef(0);
  useEffect(() => {
    const ul = list.current;
    const first = ul?.firstElementChild as HTMLElement | null;
    if (!ul || !first) return;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(ul).columnGap) || 0;
      slot.current = first.getBoundingClientRect().width + gap;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(first);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const snapped = useTransform(scrollYProgress, (p) =>
    Math.min(N - 1, Math.max(0, Math.round(p * (N - 1)))),
  );
  const xTarget = useTransform(snapped, (i) => -i * slot.current);
  // The snap glide. Underdamped enough to feel like a carousel settling.
  const x = useSpring(xTarget, { stiffness: 150, damping: 26, mass: 0.9 });
  useMotionValueEvent(snapped, "change", (i) => setIndex(i));

  // Keyboard reach: focusing a card that is not centred scrolls the page so it
  // is. Guarded on :focus-visible so a pointer click never yanks the scroll.
  const focusCard = (i: number) => (event: FocusEvent<HTMLAnchorElement>) => {
    if (!track.current) return;
    if (!event.currentTarget.matches(":focus-visible")) return;
    const top = window.scrollY + track.current.getBoundingClientRect().top;
    window.scrollTo({ top: top + i * window.innerHeight, behavior: "auto" });
  };

  return (
    <div
      ref={track}
      className="work-rail"
      style={{ height: `${N * 100}dvh` }}
      data-rail-mode="scroll"
      data-rail-index={index}
    >
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden pt-16">
        <Heading current={index + 1} />
        <motion.ul
          ref={list}
          style={{ x }}
          className="work-rail__list mt-10 flex items-start will-change-transform"
        >
          {projects.map((project, i) => (
            <Card key={project.slug} project={project} index={i} onFocus={focusCard(i)} />
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

export function WorkRail() {
  const [enhanced, setEnhanced] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const mql = window.matchMedia(CAPABLE_QUERY);
    const apply = () => setEnhanced(mql.matches && !reduce);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [reduce]);

  return enhanced ? <RailScroll /> : <RailStatic />;
}
