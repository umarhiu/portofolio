"use client";

import { useEffect, useRef, useState } from "react";
import {
  LayoutGroup,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { hero } from "@/lib/content";
import { TextRotate, type TextRotateRef } from "@/components/ui/text-rotate";
import { TextReveal } from "@/components/ui/text-reveal-animation";
import { useHeroEntrance } from "./useHeroEntrance";

/*
  The headline and its embedded retro controller, v2
  (docs/portfolio-hero-brief-v2.md).

  Layout: the wrapper is the grid; the h1 uses display:contents so the grid
  places its spans, keeping ONE coherent h1 whose text reads "I design things
  worth using." in order. The controller is the h1's SIBLING in an explicit
  grid slot, so the heading's accessible name never includes the buttons.

  Word rotation: the vendored components/ui/text-rotate.tsx (the shadcn
  TextRotate) owns the animation and the active index. Characters spring up
  into an overflow mask, staggered from the last character, and exit upward;
  its `layout` prop animates the slot width so "I" and "things" slide with a
  spring instead of the short words sitting in a reserved hole. It rotates
  automatically with no on-screen instruction, and mirrors its index back
  through onNext so our diamond buttons' selection rim always agrees with the
  word on screen.

  Taking control: pressing the D-pad or a diamond drives TextRotate through
  its ref AND switches autoplay off for the session. That press is the pause
  mechanism auto-updating content needs (WCAG 2.2.2) without any microcopy:
  the moment a visitor steers, the hero stops rotating on its own.

  Before hydration and under reduced motion the plain word renders instead of
  TextRotate, so the SSR / no-JS frame stays readable and motion-averse
  visitors never get automatic movement. TextRotate keeps one sr-only copy of
  the word and marks the split characters aria-hidden, so the heading is never
  spelled out letter by letter.

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
const REST = { x: 10, y: -10 }; // resting rotateX/rotateY (deg); rotateZ fixed -5
const RANGE = { x: 8, y: 14 }; // pointer-driven swing around rest

// TextRotate tuning. The spring is the demo's (damping 30 / stiffness 400):
// quick and firm rather than floaty, which suits display type at this size.
// It also drives the layout spring, so the line's width settles on the same
// curve as the characters.
const ROTATE_SPRING = { type: "spring", damping: 30, stiffness: 400 } as const;
const ROTATION_MS = 3000;
const CHAR_STAGGER = 0.025;

const DIAMOND: { pos: "top" | "right" | "bottom" | "left"; index: number }[] = [
  { pos: "top", index: 0 },
  { pos: "right", index: 1 },
  { pos: "bottom", index: 2 },
  { pos: "left", index: 3 },
];

export function HeroPlay() {
  const verbs = hero.verbs;
  const [index, setIndex] = useState(0);
  const [announce, setAnnounce] = useState("");
  const [ready, setReady] = useState(false);
  const verb = verbs[index];
  const prefersReduced = useReducedMotion();
  // Animate only once hydrated and only when motion is welcome. Until then the
  // plain word renders, which is exactly what SSR and no-JS visitors keep.
  const animated = ready && !prefersReduced;

  const headRef = useRef<HTMLDivElement>(null);
  const ctrlWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setReady(true), []);

  // ---- Hero-wide pointer orientation (motion values, no re-renders) --------
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const pointerInfluence = useMotionValue(0);
  const rx = useSpring(
    useTransform(() => REST.x - ny.get() * RANGE.x * pointerInfluence.get()),
    { stiffness: 130, damping: 19 },
  );
  const ry = useSpring(
    useTransform(() => REST.y + nx.get() * RANGE.y * pointerInfluence.get()),
    { stiffness: 130, damping: 19 },
  );
  const ctrlTransform = useMotionTemplate`rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(-5deg)`;
  const trackingRef = useRef({
    ok: false,
    inView: true,
    frozen: false,
    kbRest: false,
  });

  // ---- Rotation + selection ------------------------------------------------
  const rotateRef = useRef<TextRotateRef>(null);
  // Rotation waits for the entrance to finish, then runs until the visitor
  // steers. Two separate facts, because the letter-reveal entrance is longer
  // than one rotation interval: without the gate the verb would swap while the
  // headline was still revealing and leave an empty slot mid-intro.
  const [introDone, setIntroDone] = useState(false);
  const [userSteered, setUserSteered] = useState(false);
  // That first press is the pause mechanism auto-updating content needs
  // (WCAG 2.2.2), with no instruction on screen.
  const autoRotate = introDone && !userSteered;

  // TextRotate owns the index; mirror it so the selection rim always matches
  // the word on screen, including during autoplay. Autoplay must stay silent,
  // so only deliberate presses announce (see takeControl).
  const onRotate = (i: number) => setIndex(i);

  const takeControl = () => {
    if (!userSteered) setUserSteered(true);
  };
  const select = (i: number) => {
    takeControl();
    if (animated) rotateRef.current?.jumpTo(i);
    else setIndex(i); // reduced motion / pre-hydration: no TextRotate mounted
    setIndex(i);
    // Announced only after deliberate user activation, politely, without
    // duplicating the heading. Setting the same string is a no-op re-render,
    // so re-pressing the already-active button stays silent.
    setAnnounce(`Headline verb: ${verbs[i]}`);
  };
  const next = () => select((index + 1) % verbs.length);

  // Hold the controller's orientation while a control is physically pressed,
  // then resume tracking. The release listener lives on window so a press that
  // starts on a button and ends outside it (drag-off) still unfreezes.
  const onCtrlPointerDown = () => {
    trackingRef.current.frozen = true;
  };
  useEffect(() => {
    const release = () => {
      trackingRef.current.frozen = false;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  // Keyboard focus visibly inside the controller settles it into a predictable
  // resting pose and holds it there. Pointer-induced focus does not match
  // :focus-visible, so clicking a button never freezes the tracking.
  const isFocusVisible = (el: EventTarget | null) => {
    try {
      return el instanceof HTMLElement && el.matches(":focus-visible");
    } catch {
      return false;
    }
  };
  const onCtrlFocus = (e: React.FocusEvent) => {
    if (isFocusVisible(e.target)) {
      trackingRef.current.kbRest = true;
      nx.set(0);
      ny.set(0);
    }
  };
  const onCtrlBlur = (e: React.FocusEvent) => {
    if (ctrlWrapRef.current?.contains(e.relatedTarget as Node)) return;
    trackingRef.current.kbRest = false;
  };

  // Pointer tilt and word rotation both wait for the entrance to finish, so
  // the controller never lurches and the verb never blanks mid-intro.
  useEffect(() => {
    const release = () => {
      pointerInfluence.set(1);
      setIntroDone(true);
    };
    window.addEventListener("hero-intro-ready", release);
    if (!window.__heroIntro || window.__heroIntro.state === "ready") release();
    return () => window.removeEventListener("hero-intro-ready", release);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Viewport presence: tracking only runs while the opening screen is on screen.
  useEffect(() => {
    const shell = headRef.current?.closest<HTMLElement>(".hero-shell");
    if (!shell || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        trackingRef.current.inView = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(shell);
    return () => io.disconnect();
  }, []);

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
      if (!t.ok || !t.inView || t.frozen || t.kbRest || document.hidden) return;
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

  return (
    <div className="hp-head" ref={headRef}>
      <h1 className="hp-h1">
        <span className="hp-l1" data-hero-enter="line-one" data-hero-reveal="letters">
          {animated ? (
            // LayoutGroup + layout on the neighbouring words is the demo's
            // pattern: when the rotating word's width changes, "I" and
            // "things" slide on the same spring instead of jumping.
            <LayoutGroup>
              <motion.span className="hp-l1__flow" layout transition={ROTATE_SPRING}>
                <motion.span layout transition={ROTATE_SPRING}>
                  <TextReveal text={hero.headline.prefix} />
                </motion.span>
                <span data-reveal-letter="">
                <TextRotate
                  ref={rotateRef}
                  texts={verbs as unknown as string[]}
                  auto={autoRotate}
                  rotationInterval={ROTATION_MS}
                  staggerDuration={CHAR_STAGGER}
                  staggerFrom="last"
                  transition={ROTATE_SPRING}
                  onNext={onRotate}
                  mainClassName="hp-verb__rotate"
                />
                </span>
                <motion.span layout transition={ROTATE_SPRING}>
                  <TextReveal text={hero.headline.afterVerb} />
                </motion.span>
              </motion.span>
            </LayoutGroup>
          ) : (
            // SSR, pre-hydration and reduced motion: the plain sentence, with
            // no automatic movement and nothing to hydrate around.
            //
            // It still emits the same reveal units as the branch above. That
            // is load-bearing: the entrance hides a text group's LETTERS and
            // keeps its container visible, so a fallback without letters had
            // nothing to hide and this line sat fully visible on screen for
            // the whole pre-hydration window while the identity line, line two
            // and the description were correctly hidden. Matching the
            // structure means first paint hides uniformly and hydration
            // cannot flash the line in.
            <span className="hp-l1__flow">
              <TextReveal text={hero.headline.prefix} />
              <span data-reveal-letter="">
                <span className="hp-verb__static">{verb}</span>
              </span>
              <TextReveal text={hero.headline.afterVerb} />
            </span>
          )}
        </span>
        <span className="hp-w" data-hero-enter="line-two" data-hero-reveal="letters">
          <TextReveal text={hero.headline.line2[0]} />
        </span>
        <span className="hp-u" data-hero-enter="line-two" data-hero-reveal="letters">
          <TextReveal text={hero.headline.line2[1]} />
        </span>
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
              // The fluid cursor swells into a disc over these buttons instead
              // of drawing its usual box: an axis-aligned rectangle over a
              // perspective-tilted object reads as pasted on, and these caps
              // already have their own press feedback.
              data-cursor="soft"
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

        <p role="status" aria-live="polite" className="sr-only">
          {announce}
        </p>
      </div>
    </div>
  );
}
