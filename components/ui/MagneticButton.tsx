"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

/*
  A magnetic link/button: the element eases toward the cursor with spring
  physics, then settles back. Decorative, so it is fully gated. Mouse events
  only fire on real pointers, and reduced-motion disables the pull entirely.
  The spring (not a raw mouse->transform map) is what makes it feel alive
  rather than mechanical.
*/
export function MagneticButton({
  href,
  children,
  className,
  strength = 0.3,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(my, { stiffness: 150, damping: 15, mass: 0.1 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={reset}
      whileTap={{ scale: 0.97 }}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
