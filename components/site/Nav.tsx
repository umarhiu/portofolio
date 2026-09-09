"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { Menu } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { nav, site } from "@/lib/content";

/*
  Single-line nav, height under 72px. Wordmark plus four anchors and nothing
  else (no availability pill, no status dot) so the first viewport keeps its
  one-accent discipline for later hero work.

  The bar is near-solid (void/95) rather than /80: over the white hero an 80%
  scrim composited to a washed #3c3d40, mismatching the ink-black sections
  above and below it. Over the dark rest of the site this is identical.
*/
export function Nav({ initialTheme = "dark" }: { initialTheme?: "light" | "dark" }) {
  const [mode, setMode] = useState<"full" | "compact" | "hidden">("full");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const openedAt = useRef<number | null>(null);
  const collapsedAfterOpen = useRef<number | null>(null);
  useEffect(() => {
    let last = Math.max(0, window.scrollY);
    let pivot = last;
    let direction = 0;
    const update = () => {
      const y = Math.max(0, window.scrollY);
      const delta = y - last;
      const next = Math.sign(delta);
      if (next && next !== direction) { pivot = last; direction = next; }
      last = y;
      if (openedAt.current !== null && y - openedAt.current >= 12) {
        openedAt.current = null;
        setOpen(false);
        setMode("compact");
        collapsedAfterOpen.current = y;
        // Scrolling ends menu interaction, including any retained focus.
        if (header.current?.contains(document.activeElement)) {
          (document.activeElement as HTMLElement).blur();
        }
        setFocused(false);
        pivot = y;
        return;
      }
      if (y <= 8) { openedAt.current = null; collapsedAfterOpen.current = null; setMode("full"); setOpen(false); return; }
      if (collapsedAfterOpen.current !== null) {
        if (direction < 0 && Math.abs(y - pivot) >= 12) {
          collapsedAfterOpen.current = null;
          setMode("compact");
        } else if (direction > 0 && y - collapsedAfterOpen.current >= 180) {
          setMode("hidden");
        }
        return;
      }
      const hero = document.querySelector(".hero-shell");
      if (!hero) { setMode("full"); return; }
      if (y < 64) return;
      if (Math.abs(y - pivot) < 12 && delta !== 0) return;
      setMode(direction < 0 || hero.getBoundingClientRect().bottom > 64 ? "compact" : "hidden");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  const expanded = mode === "full" || open;
  const visible = mode !== "hidden" || open || focused;
  const close = () => { openedAt.current = null; setOpen(false); toggle.current?.focus({ preventScroll: true }); };
  return (
    <motion.header ref={header} initial={false}
      animate={{ width: expanded ? "100vw" : "48px", height: expanded ? 64 : 48, borderRadius: expanded ? 0 : 24, y: visible ? (expanded ? 0 : 12) : -80, opacity: visible ? 1 : 0 }}
      transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 20, stiffness: 300, width: { type: "spring", damping: 20, stiffness: 300, delay: expanded ? 0 : 0.35 }, opacity: { duration: 0.3 } }}
      data-mode={expanded ? "full" : "compact"} data-visible={visible} data-initial-theme={initialTheme}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => { if (event.key === "Escape" && open) { event.preventDefault(); close(); } }}
      className="site-nav fixed inset-x-0 top-0 z-40 border-b border-hairline/60 bg-void/95 backdrop-blur-sm transition-colors duration-200">
      <motion.button ref={toggle} initial={false}
        animate={{ opacity: expanded ? 0 : 1, scale: expanded ? 0.8 : 1 }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 15, stiffness: 300, delay: expanded ? 0 : 0.35 }}
        type="button" className="site-nav__toggle" aria-label="Open navigation"
        aria-expanded={expanded} aria-controls="primary-navigation" tabIndex={expanded ? -1 : 0} aria-hidden={expanded}
        onClick={event => {
          // Pointer focus must not pin the header visible during later scrolls.
          // Keyboard activation keeps focus and its visibility protection.
          if (event.detail > 0) event.currentTarget.blur();
          openedAt.current = window.scrollY;
          collapsedAfterOpen.current = null;
          setOpen(true);
        }}>
        <Menu aria-hidden="true" size={22} strokeWidth={1.6} />
      </motion.button>
      <nav
        id="primary-navigation"
        inert={!expanded}
        data-hero-enter={initialTheme === "light" ? "nav" : undefined}
        aria-label="Primary"
        className="site-nav__links mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-8"
        onClick={event => {
          if ((event.target as HTMLElement).closest("a")) {
            openedAt.current = null;
            setOpen(false);
          }
        }}
      >
        {/* Tightened below sm so all four links + wordmark clear a 360px
            viewport without colliding (same content, smaller type/gaps). */}
        <a
          href="#main"
          className="site-nav__mark font-display text-base font-extrabold uppercase tracking-tight text-vellum sm:text-lg"
        >
          {site.name}
        </a>
        <ul className="flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-graphite sm:gap-8 sm:text-xs sm:tracking-widest">
          {nav.map((item, index) => (
            <motion.li key={item.href} initial={false}
              animate={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : -20, scale: expanded ? 1 : 0.95 }}
              transition={reducedMotion ? { duration: 0 } : expanded
                ? { type: "spring", damping: 15, delay: 0.2 + index * 0.07 }
                : { duration: 0.2, delay: (nav.length - 1 - index) * 0.05 }}>
              <Link
                href={item.href}
                className="nav-flip transition-colors duration-200 hover:text-vellum"
              >
                <span className="nav-flip__inner">
                  <span className="nav-flip__face nav-flip__face--front">
                    {item.label}
                  </span>
                  <span aria-hidden className="nav-flip__face nav-flip__face--back">
                    {item.label}
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </motion.header>
  );
}
