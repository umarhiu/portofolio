"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
  Scroll-into-view reveal. Translate + opacity on a strong ease-out, once.
  Under reduced motion it degrades to a plain opacity fade (comprehension
  kept, movement removed), per the accessibility rule.

  The reduce flag is deferred to after mount: useReducedMotion() resolves
  synchronously on the client but is null during SSR, so branching the
  `initial` prop on it directly makes the server markup (translateY variant)
  disagree with a reduced-motion client's first render, a hydration error.
  First render always matches the SSR output; the reduced variant applies
  right after mount, before any whileInView animation has fired.
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
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduce = mounted && prefersReduced;

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
