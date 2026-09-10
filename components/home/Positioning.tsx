"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { positioning } from "@/lib/content";

/*
  The statement holds in view while its scroll-linked sequence completes,
  then releases into Selected Work. The hero owns the background handoff.
  Progress tracks scroll directly so even a fast scroll finishes before release.

  Built on Motion (already in the home bundle) so the heavy libs stay code-split
  on the WebGL hero chunk. SSR / no-JS / reduced-motion render the full sentence
  at full opacity; the effect is a motion-only enhancement.
*/

/*
  The headline only. site.tagline is the meta description and is deliberately
  not reused here.

  The accented tail sits in a nowrap span so it can never split across a line
  break, which is what orphaned the word RUN on a fourth line. It still reveals
  word by word inside that span, and its indices continue from the lead, so the
  scroll reveal runs straight through.
*/
const leadWords = positioning.headline.lead.split(" ");
const accentWords = positioning.headline.accent.split(" ");
const wordCount = leadWords.length + accentWords.length;

/*
  Word highlighting follows the section from entering to leaving the viewport.
  The section itself stays visible throughout the handoff, with no entrance fade.
*/
const WORDS_START = 0.3;
const WORDS_END = 0.92;
const STEP = (WORDS_END - WORDS_START) / wordCount;

function Word({
  progress,
  index,
  active,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  active: boolean;
  children: React.ReactNode;
}) {
  const start = WORDS_START + index * STEP;
  const opacity = useTransform(progress, [start, start + STEP * 1.5], [0.18, 1]);
  return (
    <motion.span
      style={{ opacity: active ? opacity : 1 }}
      className="will-change-[opacity]"
    >
      {children}{" "}
    </motion.span>
  );
}

export function Positioning() {
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [started, setStarted] = useState(false);
  const animationStart = useMotionValue(Infinity);
  const animationEnd = useMotionValue(Infinity);

  useEffect(() => {
    setActive(!reduce);
  }, [reduce]);

  const { scrollY } = useScroll();
  useEffect(() => {
    const hero = document.getElementById("hero");
    const section = root.current;
    if (!hero || !section) return;
    const measure = () => {
      const bounds = hero.getBoundingClientRect();
      // Match HeroTransition's [start start, 55% start] exactly, including
      // content-expanded hero heights and restored scroll positions.
      const start = window.scrollY + bounds.top + bounds.height * 0.55;
      const inner = section.querySelector<HTMLElement>(".statement__inner");
      if (!inner) return;
      const stickyTop = parseFloat(getComputedStyle(inner).top) || 0;
      const release = window.scrollY + section.getBoundingClientRect().bottom
        - inner.getBoundingClientRect().height - stickyTop;
      // Complete before the sticky constraint releases, with a short reading
      // hold. The end is tied to actual layout, not the section leaving view.
      animationEnd.set(Math.max(start + 1, release - window.innerHeight * 0.12));
      animationStart.set(start);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    observer.observe(section);
    const inner = section.querySelector(".statement__inner");
    if (inner) observer.observe(inner);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [animationStart, animationEnd, active]);
  const scrollYProgress = useTransform(() => {
    const start = animationStart.get();
    const end = animationEnd.get();
    if (!Number.isFinite(start) || end <= start) return 0;
    return Math.max(0, Math.min(1, (scrollY.get() - start) / (end - start)));
  });
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setStarted(progress > 0);
  });

  const smooth = scrollYProgress;

  const domainOpacity = useTransform(smooth, [WORDS_END, 1], [0, 1]);

  // Laptop visual: scroll-linked parallax + a gentle turn + a scale-in as the
  // statement reveals. Composed with an idle float on the inner wrapper.
  const laptopY = useTransform(smooth, [0, 1], [40, -48]);
  const laptopRotate = useTransform(smooth, [0, 1], [-4, 4]);
  const laptopScale = useTransform(smooth, [0.04, 0.42], [0.86, 1]);

  return (
    <section
      ref={root}
      aria-label="Positioning"
      className={"statement relative bg-void" + (active ? " is-sticky" : "")}
    >
      <div className="statement__inner px-4 py-28 sm:px-8 lg:px-20 lg:py-40">
        <motion.div
          className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 will-change-[transform,opacity] lg:grid-cols-2 lg:gap-12"
        >
          <div>
            <p
              // text-balance evens the rag inside each line span, so a segment
              // that has to wrap does it gracefully instead of leaving a stub.
              className="max-w-[20ch] text-balance font-display font-bold uppercase leading-[0.98] tracking-tight text-vellum"
              style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}
            >
              {leadWords.map((word, i) => (
                <Word key={`${word}-${i}`} progress={smooth} index={i} active={active}>
                  {word}
                </Word>
              ))}
              <span className="whitespace-nowrap text-accent">
                {accentWords.map((word, i) => (
                  <Word
                    key={`${word}-${i}`}
                    progress={smooth}
                    index={leadWords.length + i}
                    active={active}
                  >
                    {word}
                  </Word>
                ))}
              </span>
            </p>
            {/* Bio and capability line ride the same fade, so both arrive once
                the headline has finished revealing. The bio matches the About
                treatment so the two sections read as one voice. */}
            <motion.p
              style={{
                opacity: active ? domainOpacity : 1,
                fontSize: "1.18rem",
                lineHeight: 1.65,
              }}
              className="mt-8 max-w-[58ch] leading-relaxed text-vellum/85"
            >
              {positioning.bio}
            </motion.p>
            <motion.p
              style={{ opacity: active ? domainOpacity : 1 }}
              className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-graphite"
            >
              {positioning.capabilities.join("  /  ")}
            </motion.p>
          </div>

          {/* Laptop visual: scroll parallax + gentle turn + idle float. */}
          <motion.div
            style={
              active
                ? { y: laptopY, rotate: laptopRotate, scale: laptopScale }
                : undefined
            }
            className="relative hidden items-center justify-center lg:flex"
          >
            <motion.div
              animate={active && started ? { y: [0, -12, 0] } : { y: 0 }}
              transition={active && started
                ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/asset/laptop.webp"
                alt=""
                aria-hidden="true"
                className="w-full max-w-[540px] select-none"
                style={{ filter: "drop-shadow(0 36px 60px rgba(0,0,0,0.55))" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
