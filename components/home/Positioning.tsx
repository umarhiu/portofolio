"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { site } from "@/lib/content";

/*
  Sticky scroll-reveal (inspired by the Codrops Sticky Grid Scroll idea). As you
  leave the hero, this statement pins and its words brighten one by one, then it
  releases into the work index.

  Smoothness: the scroll progress is spring-smoothed so the fill glides rather
  than tracking raw scroll. Reversible: scrolling back up dims the words in the
  same order, so the motion plays in both directions.

  Built on Motion (already in the home bundle) so the heavy libs stay code-split
  on the WebGL hero chunk. SSR / no-JS / reduced-motion render the full sentence
  at full opacity with no sticky track; the effect is a motion-only enhancement.
*/

const words = site.tagline.split(" ");

/*
  Track budget (fractions of the spring-smoothed scroll progress):
  - 0.00 to REVEAL_END is the reveal: the hero lifts off and uncovers the
    pinned statement, while the fade-in (opacity + small rise) lands inside it
    so the text is fully present and steady by the time it clears the hero.
  - WORDS_START to WORDS_END is the word-by-word brighten. The reveal finishes
    around 0.5; set WORDS_START below that and the brighten begins while the
    statement is still being uncovered (the two overlap), at/after it waits
    until the text is fully visible.
*/
const WORDS_START = 0.3;
const WORDS_END = 0.92;
const STEP = (WORDS_END - WORDS_START) / words.length;

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

  useEffect(() => {
    setActive(!reduce);
  }, [reduce]);

  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end end"],
  });

  // Spring-smooth the scroll progress so the reveal glides in both directions.
  // No latch: scrolling back up reverses the highlight in the same order.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    restDelta: 0.0005,
  });

  // Fade-in as the statement emerges from behind the hero. A small upward
  // drift (transform only) gives it a settle without fighting legibility.
  // Both finish before the words start to brighten.
  const revealOpacity = useTransform(smooth, [0.06, 0.34], [0, 1]);
  const revealY = useTransform(smooth, [0.06, 0.34], [28, 0]);
  const domainOpacity = useTransform(smooth, [WORDS_END, 1], [0, 1]);

  return (
    <section
      ref={root}
      aria-label="Positioning"
      className={
        "statement relative border-t border-hairline" + (active ? " is-sticky" : "")
      }
    >
      <div className="statement__inner px-4 py-28 sm:px-8 lg:px-20 lg:py-40">
        <motion.div
          style={
            active
              ? { opacity: revealOpacity, y: revealY }
              : undefined
          }
          className="mx-auto w-full max-w-[1400px] will-change-[transform,opacity]"
        >
          <p
            className="max-w-[20ch] font-display font-bold uppercase leading-[0.98] tracking-tight text-vellum"
            style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}
          >
            {words.map((w, i) => (
              <Word key={`${w}-${i}`} progress={smooth} index={i} active={active}>
                {w}
              </Word>
            ))}
          </p>
          <motion.p
            style={{ opacity: active ? domainOpacity : 1 }}
            className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-graphite"
          >
            {site.domains.join("  /  ")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
