"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Five bottom-anchored reveal strips cut away the white hero, exposing the
 * actual section underneath. One progress value, no pin, spacer or clock.
 */
export function HeroTransition({ children }: { children: ReactNode }) {
  const layer = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: layer,
    // Layer spans the hero; finish while its bottom is still on screen.
    offset: ["start start", "55% start"],
  });
  const clipPath = useTransform(scrollYProgress, (progress) => {
    const rise = (start: number) =>
      `calc(100% - ${35 * Math.max(0, Math.min(1, (progress - start) / (1 - start)))}dvh)`;
    const center = rise(0);
    const adjacent = rise(0.18);
    const outer = rise(0.36);
    return `polygon(0 0, 100% 0, 100% ${outer}, 80% ${outer}, 80% ${adjacent}, 60% ${adjacent}, 60% ${center}, 40% ${center}, 40% ${adjacent}, 20% ${adjacent}, 20% ${outer}, 0 ${outer})`;
  });

  return (
    <motion.section
      ref={layer}
      id="hero"
      aria-label="Introduction"
      className="relative hero-reveal"
      style={{ clipPath: reduce ? "none" : clipPath }}
    >
      {children}
    </motion.section>
  );
}
