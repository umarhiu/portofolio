"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { hero } from "@/lib/content";
import { useHeroEntrance } from "./useHeroEntrance";

/*
  The headline and its embedded retro controller, v2
  (docs/portfolio-hero-brief-v2.md).

  Layout: the wrapper is the grid; the h1 uses display:contents so the grid
  places its spans, keeping ONE coherent h1 whose text reads "I design things
  worth using." in order. The controller is the h1's SIBLING in an explicit
  grid slot, so the heading's accessible name never includes the buttons.

  State: one shared active index drives the verb, the diamond buttons'
  selection rim, and the announcements. Autoplay advances every 3.5s; a manual
  choice applies immediately, cancels the pending advance, holds 5s, then the
  cycle resumes. Rotation suspends while the tab is hidden, the hero is
  offscreen, a button is physically pressed, or keyboard focus is visibly
  inside the controller (pointer-induced focus does not suspend). The pause
  control is the persistent user override (WCAG 2.2.2): once paused, nothing
  but the user resumes it. Reduced motion defaults to paused (manual mode).

  Orientation: nx/ny motion values fed by a window pointermove handler mapped
  through the UNTRANSFORMED shell rect, clamped to [-1,1], spring-smoothed into
  rotateX/rotateY around a dimensional resting pose (10, -10, -5). No React
  state on the pointer path. The slot never moves; only orientation does.
  Tracking is gated to fine pointers with motion allowed, pauses while the
  hero is offscreen or the page hidden, freezes during a press, and settles to
  rest while keyboard focus is visibly inside the controller or the pointer
  leaves the shell.

  The island also owns the nav theme: while the white shell overlaps the fixed
  bar, html[data-nav-theme="light"] turns the bar white with dark links.
*/

const TRACK_OK =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const AUTO_MS = 3500;
const HOLD_MS = 5000;
const REST = { x: 10, y: -10 }; // resting rotateX/rotateY (deg); rotateZ fixed -5
const RANGE = { x: 8, y: 14 }; // pointer-driven swing around rest

const DIAMOND: { pos: "top" | "right" | "bottom" | "left"; index: number }[] = [
  { pos: "top", index: 0 },
  { pos: "right", index: 1 },
  { pos: "bottom", index: 2 },
  { pos: "left", index: 3 },
];

export function HeroPlay() {
  const verbs = hero.verbs;
  const [index, setIndex] = useState(0);
  const [dirty, setDirty] = useState(false); // gates the verb animation to post-load changes
  const [paused, setPaused] = useState(false); // the user's explicit, persistent pause
  const [announce, setAnnounce] = useState("");
  const [ready, setReady] = useState(false);
  const verb = verbs[index];

  const headRef = useRef<HTMLDivElement>(null);
  const ctrlWrapRef = useRef<HTMLDivElement>(null);

  // ---- Autoplay machine (single timer, ref-mirrored state) -----------------
  const timer = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const suspend = useRef({ hidden: false, offscreen: false, press: false, kbFocus: false });
  const pendingHold = useRef(false); // a manual pick happened while suspended
  const introReady = useRef(false);
  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  const canRun = () => {
    const s = suspend.current;
    return introReady.current && !pausedRef.current && !s.hidden && !s.offscreen && !s.press && !s.kbFocus;
  };
  const schedule = (delay: number) => {
    clearTimer();
    if (!canRun()) return;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      // The timer callback re-checks: a press/hide in the same tick must not
      // race a click into a double advance (one state change per activation).
      if (!canRun()) return;
      setIndex((i) => (i + 1) % verbs.length);
      setDirty(true);
      schedule(AUTO_MS);
    }, delay);
  };
  const onSuspendChange = () => {
    if (!canRun()) {
      clearTimer();
      return;
    }
    if (timer.current === null) {
      schedule(pendingHold.current ? HOLD_MS : AUTO_MS);
      pendingHold.current = false;
    }
  };

  const select = (i: number) => {
    setIndex(i);
    setDirty(true);
    // Announced only after deliberate user activation, politely, without
    // duplicating the heading. Automatic advances never announce.
    setAnnounce(`Headline verb: ${verbs[i]}`);
    clearTimer();
    if (canRun()) {
      schedule(HOLD_MS); // hold the manual choice 5s, then resume the cycle
    } else {
      pendingHold.current = true; // resume with the 5s hold once unsuspended
    }
  };
  const next = () => select((index + 1) % verbs.length);

  const togglePaused = () => {
    setPaused((p) => {
      const nowPaused = !p;
      pausedRef.current = nowPaused;
      pendingHold.current = false; // an explicit toggle starts a fresh cycle
      if (nowPaused) clearTimer();
      else schedule(AUTO_MS);
      return nowPaused;
    });
  };

  // Reduced motion defaults to manual (paused) once known on the client; the
  // flag is deferred so SSR markup never branches on it (hydration safety).
  const prefersReduced = useReducedMotion();
  const rmInit = useRef(false);
  useEffect(() => {
    setReady(true);
    if (!rmInit.current && prefersReduced) {
      rmInit.current = true;
      pausedRef.current = true;
      setPaused(true);
      clearTimer();
    }
  }, [prefersReduced]);

  useEffect(() => {
    const release = () => {
      introReady.current = true;
      pointerInfluence.set(1);
      onSuspendChange();
    };
    window.addEventListener("hero-intro-ready", release);
    if (!window.__heroIntro || window.__heroIntro.state === "ready") release();
    return () => window.removeEventListener("hero-intro-ready", release);
    // The existing ref-based autoplay machine owns its one schedule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start/stop the cycle with mount + visibility + viewport presence.
  useEffect(() => {
    pausedRef.current = paused;
    const shell = headRef.current?.closest<HTMLElement>(".hero-shell");

    const onVis = () => {
      suspend.current.hidden = document.hidden;
      onSuspendChange();
    };
    document.addEventListener("visibilitychange", onVis);
    suspend.current.hidden = document.hidden;

    let io: IntersectionObserver | null = null;
    if (shell && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          suspend.current.offscreen = !entry.isIntersecting;
          trackingRef.current.inView = entry.isIntersecting;
          onSuspendChange();
        },
        { threshold: 0 },
      );
      io.observe(shell);
    }

    // Release must be caught wherever it happens, including outside the
    // controller after a drag-off, or press suspension would stick.
    const onAnyPointerUp = () => {
      if (!suspend.current.press) return;
      suspend.current.press = false;
      trackingRef.current.frozen = false;
      onSuspendChange();
    };
    window.addEventListener("pointerup", onAnyPointerUp);
    window.addEventListener("pointercancel", onAnyPointerUp);

    // Initial kick (unless reduced motion already paused it in the effect above).
    if (timer.current === null) schedule(AUTO_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerup", onAnyPointerUp);
      window.removeEventListener("pointercancel", onAnyPointerUp);
      io?.disconnect();
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Press suspension (visual freeze + autoplay hold while a button is down).
  // The RELEASE listener lives on window (see the [paused] effect): a press
  // that starts on a button but ends outside the controller (drag-off) must
  // still restore autoplay and tracking, or both would stay latched forever.
  const onCtrlPointerDown = () => {
    suspend.current.press = true;
    trackingRef.current.frozen = true;
    clearTimer();
  };
  // Keyboard focus visibly inside the controller: suspend + settle the pose.
  // Pointer-induced focus does not match :focus-visible, so clicks never
  // block the intended 5s resumption. matches() is guarded for engines that
  // reject the pseudo-class.
  const isFocusVisible = (el: EventTarget | null) => {
    try {
      return el instanceof HTMLElement && el.matches(":focus-visible");
    } catch {
      return false;
    }
  };
  const onCtrlFocus = (e: React.FocusEvent) => {
    if (isFocusVisible(e.target)) {
      suspend.current.kbFocus = true;
      nx.set(0);
      ny.set(0);
      clearTimer();
    }
  };
  const onCtrlBlur = (e: React.FocusEvent) => {
    if (ctrlWrapRef.current?.contains(e.relatedTarget as Node)) return;
    suspend.current.kbFocus = false;
    onSuspendChange();
  };

  // ---- Hero-wide pointer orientation (motion values, no re-renders) --------
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const pointerInfluence = useMotionValue(0);
  const rx = useSpring(useTransform(() => REST.x - ny.get() * RANGE.x * pointerInfluence.get()), {
    stiffness: 130,
    damping: 19,
  });
  const ry = useSpring(useTransform(() => REST.y + nx.get() * RANGE.y * pointerInfluence.get()), {
    stiffness: 130,
    damping: 19,
  });
  const ctrlTransform = useMotionTemplate`rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(-5deg)`;
  const trackingRef = useRef({ ok: false, inView: true, frozen: false });

  useEffect(() => {
    const shell = headRef.current?.closest<HTMLElement>(".hero-shell");
    if (!shell) return;

    const mql = window.matchMedia(TRACK_OK);
    const setOk = () => {
      trackingRef.current.ok = mql.matches;
      if (!mql.matches) {
        nx.set(0);
        ny.set(0);
      }
    };
    setOk();
    mql.addEventListener("change", setOk);

    // The UNTRANSFORMED shell rect, cached and refreshed on resize/scroll.
    let rect = shell.getBoundingClientRect();
    let rafGeo = 0;
    const refresh = () => {
      cancelAnimationFrame(rafGeo);
      rafGeo = requestAnimationFrame(() => {
        rect = shell.getBoundingClientRect();
      });
    };
    window.addEventListener("resize", refresh, { passive: true });
    window.addEventListener("scroll", refresh, { passive: true });

    const onMove = (e: Pick<PointerEvent, "clientX" | "clientY" | "pointerType">) => {
      const t = trackingRef.current;
      if (!t.ok || !t.inView || t.frozen || document.hidden) return;
      if (e.pointerType !== "mouse") return;
      if (rect.width <= 0 || rect.height <= 0) return; // zero-size guard
      const inX = e.clientX >= rect.left && e.clientX <= rect.right;
      const inY = e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inX || !inY) {
        // Outside the shell: ease back to the resting pose (not flat).
        nx.set(0);
        ny.set(0);
        return;
      }
      nx.set(Math.max(-1, Math.min(1, (2 * (e.clientX - rect.left)) / rect.width - 1)));
      ny.set(Math.max(-1, Math.min(1, (2 * (e.clientY - rect.top)) / rect.height - 1)));
    };
    const onLeaveDoc = () => {
      nx.set(0);
      ny.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    if (window.__heroIntro?.pointer) onMove(window.__heroIntro.pointer);
    document.documentElement.addEventListener("pointerleave", onLeaveDoc);

    // Nav theme: white bar while the shell still overlaps the fixed nav.
    // Writes only on change so scroll ticks never dirty the style tree.
    const navTheme = () => {
      const light = shell.getBoundingClientRect().bottom > 64;
      const theme = light ? "light" : "dark";
      if (document.documentElement.dataset.navTheme === theme) return;
      document.documentElement.dataset.navTheme = theme;
    };
    navTheme();
    window.addEventListener("scroll", navTheme, { passive: true });
    window.addEventListener("resize", navTheme, { passive: true });

    return () => {
      mql.removeEventListener("change", setOk);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
      window.removeEventListener("scroll", navTheme);
      window.removeEventListener("resize", navTheme);
      cancelAnimationFrame(rafGeo);
      delete document.documentElement.dataset.navTheme;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useHeroEntrance();

  const caption = paused ? hero.captionPaused : hero.caption;

  return (
    <div className="hp-head" ref={headRef}>
      <h1 className="hp-h1">
        <span className="hp-l1" data-hero-enter="line-one">
          {hero.headline.prefix}{" "}
          <span className="hp-verb">
            {verbs.map((v) => (
              <span key={v} className="hp-verb__sizer" aria-hidden="true">
                {v}
              </span>
            ))}
            <span key={verb} className="hp-verb__word" data-animate={dirty}>
              {verb}
            </span>
          </span>{" "}
          {hero.headline.afterVerb}
        </span>
        <span className="hp-w" data-hero-enter="line-two">{hero.headline.line2[0]}</span>
        <span className="hp-u" data-hero-enter="line-two">{hero.headline.line2[1]}</span>
      </h1>

      {/* The controller: sibling of the h1, placed into the slot. Decorative
          layers are aria-hidden; the native buttons are not. */}
      <div className="hp-ctrl-slot">
        <div data-hero-enter="gamepad">
        <div className="hp-stage">
          <span className="hp-ground" aria-hidden="true" />
          <motion.div
            ref={ctrlWrapRef}
            className="hp-ctrl"
            style={ready ? { transform: ctrlTransform } : undefined}
            onPointerDown={onCtrlPointerDown}
            onFocus={onCtrlFocus}
            onBlur={onCtrlBlur}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="hp-ctrl__slice" aria-hidden="true" />
            ))}
            <span className="hp-ctrl__body" aria-hidden="true" />
            <span className="hp-ctrl__face" aria-hidden="true" />
            <button
              type="button"
              className="hp-dpad"
              aria-label="Change headline verb"
              aria-describedby="hp-caption"
              onClick={next}
              disabled={!ready}
            >
              <span className="hp-cross" aria-hidden="true">
                <i className="hp-cross-h" />
                <i className="hp-cross-v" />
                <i className="hp-cross-dot" />
              </span>
            </button>
            <div className="hp-cluster">
              {DIAMOND.map(({ pos, index: i }) =>
                i < verbs.length ? (
                  <button
                    key={pos}
                    type="button"
                    className="hp-act"
                    data-pos={pos}
                    data-active={i === index}
                    aria-label={`Show ${verbs[i]} headline`}
                    onClick={() => select(i)}
                    disabled={!ready}
                  >
                    <span className="hp-act__cap" aria-hidden="true" />
                  </button>
                ) : null,
              )}
            </div>
          </motion.div>
        </div>
        </div>

        <div className="hp-caption-row" data-hero-enter="hint">
          <p id="hp-caption" className="hp-caption">
            {caption}
          </p>
          <button
            type="button"
            className="hp-pause"
            aria-label={paused ? hero.resumeLabel : hero.pauseLabel}
            onClick={togglePaused}
            disabled={!ready}
          >
            {paused ? (
              <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
                <path d="M1 1 L10 6 L1 11 Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
                <rect x="0.5" y="0.5" width="3" height="11" fill="currentColor" />
                <rect x="6.5" y="0.5" width="3" height="11" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {announce}
        </p>
      </div>
    </div>
  );
}
