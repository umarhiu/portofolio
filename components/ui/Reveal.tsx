"use client";

import { motion, useReducedMotion } from "motion/react";

/*
  Scroll-into-view reveal. Translate + opacity on a strong ease-out, once.
  Under reduced motion it degrades to a plain opacity fade (comprehension
  kept, movement removed), per the accessibility rule.
*/
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
