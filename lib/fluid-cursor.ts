/*
  Fluid interaction cursor: the engine.

  A two-part cursor. A precise dot sits exactly on the pointer, and a larger
  ring trails it on a spring, stretching along its own direction of travel so
  fast movement reads as a liquid drag rather than a rigid outline. Near an
  interactive element the ring becomes magnetic: it leaves the pointer and
  settles onto the element itself.

  Three states, chosen by the target's measured size, because one behavior does
  not suit both a nav link and a full-width card:

    free  no target. Ring trails the pointer and stretches with velocity.
    lock  target at most LOCK_MAX in both axes, such as a nav link. The ring
          morphs into the element's own box, padded and matching its corner
          radius, and locks to its center so it cannot drift with the
          element's padding. A small clamped pull toward the pointer keeps the
          lock elastic instead of dead. Stretch is faded out here: a tilted
          rectangle around a link looks broken.
    grow  a larger target, or anything inside a [data-cursor="soft"] subtree.
          Morphing into a project card would invert the whole card under the
          blend mode, so the ring just swells into a softer, slower disc that
          still follows the pointer.

  Legibility comes from `mix-blend-mode: exclusion` in globals.css rather than
  a fixed color, which is what lets one cursor cross this site's two regimes:
  it resolves near-white over the near-black page and near-black over the white
  hero, with no state to keep in sync. Exclusion alone washes out over mid
  greys, so the ring also carries a small backdrop contrast boost that pushes
  its own backdrop away from the middle before the blend happens.

  Cost control:
    - No React on the pointer path. This module owns its own DOM nodes and one
      rAF loop; nothing here re-renders anything.
    - The loop stops when everything has settled, so an idle pointer does not
      hold a frame callback open. Scroll, resize, and pointer events wake it.
      It deliberately keeps running while a lock is held, since the locked
      element can move under the cursor with no event to observe.
    - Every layout read (elementFromPoint, getBoundingClientRect) happens at
      the top of the frame, before any style write, so a frame costs at most
      one flush.

  The overlay is inert: aria-hidden, pointer-events: none. It never appears in
  the accessibility tree and never becomes an event target, so the hero's own
  window-level pointer tracking still sees the real element under the pointer.

  Callers own the capability gate. See components/site/FluidCursor.tsx: this
  runs only for a fine pointer with hover and motion allowed, so the native
  cursor is left completely alone for everyone else.
*/

/** Interactive things worth magnetizing to. */
const TARGETS =
  'a[href], button, [role="button"], summary, label[for], [data-cursor="magnetic"]';

/** Opt out of the custom cursor for a subtree. */
const OPT_OUT = '[data-cursor="none"]';

/*
  Opt a subtree out of BOX magnetism while keeping the swell: targets inside it
  always use `grow`. For the hero controller, where an axis-aligned rectangle
  drawn over a perspective-tilted 3D object reads as pasted on and collides
  with the faceplate's own outline. A disc sits on a tilted surface fine, and
  those buttons already have their own tactile press feedback.
*/
const SOFT = '[data-cursor="soft"]';

/*
  Text entry keeps the native caret: an I-beam communicates a text field, and a
  blob does not. The custom cursor hides over these and globals.css restores
  `cursor: text`. Nothing on the site uses them yet; this keeps the first form
  that arrives from regressing.
*/
const TEXT_FIELDS =
  'textarea, [contenteditable=""], [contenteditable="true"], ' +
  'input:not([type="button"]):not([type="submit"]):not([type="reset"])' +
  ':not([type="checkbox"]):not([type="radio"]):not([type="range"])' +
  ':not([type="color"]):not([type="file"])';

type Mode = "free" | "lock" | "grow" | "text";

/** Both axes must fit for the ring to morph into an element's box. */
const LOCK_MAX = 96;
const RING_FREE = 34;
const RING_GROW = 60;
const LOCK_PAD = 10;
/** Elastic give on a lock: a fraction of the pointer offset, hard-clamped. */
const LOCK_PULL = 0.14;
const LOCK_PULL_MAX = 8;

/*
  Position springs as acceleration = k*(target - current) - c*velocity.
  Critical damping is c = 2*sqrt(k); each of these sits just under it, so the
  ring overshoots slightly and settles. That small overshoot is the whole
  difference between "follows" and "alive".
*/
const SPRINGS: Record<Mode, { k: number; c: number }> = {
  free: { k: 420, c: 34 }, // critical 41
  lock: { k: 700, c: 46 }, // critical 53: snappier, it has somewhere to be
  grow: { k: 300, c: 30 }, // critical 35: heavier over large targets
  text: { k: 420, c: 34 },
};

/** Velocity-driven stretch, and how much of it each state allows. */
const STRETCH_MAX = 0.26;
const STRETCH_SPEED = 5200; // px/s mapping to STRETCH_MAX
const STRETCH_GAIN: Record<Mode, number> = { free: 1, grow: 0.55, lock: 0, text: 0 };
/** Below this speed the travel angle is stale noise, so it is held. */
const ANGLE_FLOOR = 60;

const PRESS_RING = 0.86;
const PRESS_DOT = 0.7;

/** Longest frame the springs are integrated over, so a stall cannot explode. */
const MAX_DT = 1 / 30;

const EASE = { size: 16, stretch: 14, angle: 20, alpha: 22, gain: 12 };

function ease(current: number, target: number, k: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-k * dt));
}

function integrate(
  current: number,
  target: number,
  velocity: number,
  spring: { k: number; c: number },
  dt: number,
): [number, number] {
  const acceleration = (target - current) * spring.k - velocity * spring.c;
  const v = velocity + acceleration * dt;
  return [current + v * dt, v];
}

function shortestArc(from: number, to: number): number {
  let delta = (to - from) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** A percentage radius (a circle) reads as a pill at any size. */
function radiusOf(element: Element): number {
  const raw = getComputedStyle(element).borderTopLeftRadius;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 8;
  return raw.trimEnd().endsWith("%") ? 999 : value;
}

export function mountFluidCursor(): { destroy: () => void } {
  // Three separate body children, deliberately not one wrapper: a blended
  // element blends only inside its nearest ancestor stacking context, and a
  // fixed z-indexed wrapper is one, which would leave these blending against
  // each other instead of the page. See the .fcur-* rules in globals.css.
  const layer = (name: string) => {
    const element = document.createElement("span");
    element.className = name;
    element.setAttribute("aria-hidden", "true");
    document.body.appendChild(element);
    return element;
  };
  const ring = layer("fcur-ring");
  const dot = layer("fcur-dot");
  const ripple = layer("fcur-ripple");

  // Pointer, in client coordinates. The pre-paint bootstrap already records
  // the last pointer position, so the ring can start where the pointer is
  // instead of flying in from the top-left corner.
  const seed = window.__heroIntro?.pointer;
  let px = seed?.clientX ?? window.innerWidth / 2;
  let py = seed?.clientY ?? window.innerHeight / 2;

  let mode: Mode = "free";
  let target: HTMLElement | null = null;
  let rect: DOMRect | null = null;

  // Ring: position, velocity, box, and the derived stretch.
  let rx = px;
  let ry = py;
  let vx = 0;
  let vy = 0;
  let w = RING_FREE;
  let h = RING_FREE;
  let radius = RING_FREE / 2;
  let stretch = 0;
  let gain = STRETCH_GAIN.free;
  let angle = 0;
  let alpha = 0;
  // On a target the ring carries the state, so the dot recedes to a precision
  // mark rather than competing with it.
  let dim = 1;

  // Last values written to the DOM, so a settled frame writes nothing.
  let wroteW = -1;
  let wroteH = -1;
  let wroteR = -1;
  let wroteAlpha = -1;
  let wroteDim = -1;

  let alphaTarget = 0;
  let pressed = false;
  let seen = false; // the pointer has actually moved at least once
  let dirty = false; // geometry changed under a still pointer
  let running = false;
  let disposed = false;
  let raf = 0;
  let last = 0;

  function wake(): void {
    if (running || disposed) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  function setTarget(next: HTMLElement | null, nextMode: Mode): void {
    target = next;
    rect = next ? next.getBoundingClientRect() : null;
    mode = nextMode;
    // Mirrored on <html> the way the nav theme and work mode already are:
    // a hook for CSS and something observable from the outside. Written only
    // on a change, so it never costs a per-frame style invalidation.
    document.documentElement.dataset.fluidCursorMode = nextMode;
  }

  /** Decide the state from whatever element is under the pointer. */
  function resolve(node: Element | null): void {
    if (!node || !node.isConnected) return setTarget(null, "free");
    if (node.closest(OPT_OUT)) return setTarget(null, "free");
    if (node.closest(TEXT_FIELDS)) return setTarget(null, "text");
    const found = node.closest<HTMLElement>(TARGETS);
    if (!found) return setTarget(null, "free");
    const box = found.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return setTarget(null, "free");
    const fits = box.width <= LOCK_MAX && box.height <= LOCK_MAX;
    const soft = node.closest(SOFT) !== null;
    setTarget(found, fits && !soft ? "lock" : "grow");
    rect = box;
  }

  function tick(now: number): void {
    if (disposed) return;
    const dt = Math.min(MAX_DT, last ? (now - last) / 1000 : 1 / 60);
    last = now;

    // ---- Reads. All layout queries happen here, before any write. ---------
    if (dirty) {
      dirty = false;
      if (seen) {
        const under = document.elementFromPoint(px, py);
        resolve(under);
        surface(under);
      }
    }
    if (target) {
      // A locked element can scroll, animate, or be swapped out from under a
      // still pointer, so its box is re-read while the lock is held.
      if (!target.isConnected) setTarget(null, "free");
      else rect = target.getBoundingClientRect();
    }

    // ---- Targets ----------------------------------------------------------
    let tx = px;
    let ty = py;
    let tw = RING_FREE;
    let th = RING_FREE;
    let tr = RING_FREE / 2;

    if (mode === "lock" && rect) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tx = cx + clamp((px - cx) * LOCK_PULL, -LOCK_PULL_MAX, LOCK_PULL_MAX);
      ty = cy + clamp((py - cy) * LOCK_PULL, -LOCK_PULL_MAX, LOCK_PULL_MAX);
      tw = Math.max(rect.width + LOCK_PAD * 2, RING_FREE);
      th = Math.max(rect.height + LOCK_PAD * 2, RING_FREE * 0.72);
      tr = Math.min(radiusOf(target!) + LOCK_PAD, Math.min(tw, th) / 2);
    } else if (mode === "grow") {
      tw = RING_GROW;
      th = RING_GROW;
      tr = RING_GROW / 2;
    }

    // ---- Integrate --------------------------------------------------------
    const spring = SPRINGS[mode];
    [rx, vx] = integrate(rx, tx, vx, spring, dt);
    [ry, vy] = integrate(ry, ty, vy, spring, dt);
    w = ease(w, tw, EASE.size, dt);
    h = ease(h, th, EASE.size, dt);
    radius = ease(radius, tr, EASE.size, dt);

    gain = ease(gain, STRETCH_GAIN[mode], EASE.gain, dt);
    const speed = Math.hypot(vx, vy);
    stretch = ease(
      stretch,
      Math.min(STRETCH_MAX, speed / STRETCH_SPEED) * gain,
      EASE.stretch,
      dt,
    );
    if (speed > ANGLE_FLOOR) {
      const heading = (Math.atan2(vy, vx) * 180) / Math.PI;
      angle += shortestArc(angle, heading) * (1 - Math.exp(-EASE.angle * dt));
    }

    const wantAlpha = mode === "text" || !seen ? 0 : alphaTarget;
    alpha = ease(alpha, wantAlpha, EASE.alpha, dt);
    const wantDim = mode === "lock" || mode === "grow" ? 0.5 : 1;
    dim = ease(dim, wantDim, EASE.alpha, dt);

    // ---- Writes -----------------------------------------------------------
    // Rightmost transform first: the box is centered on its own origin, then
    // scaled and rotated about that center, then moved to the ring position.
    // This depends on transform-origin: 0 0 (see the .fcur-* rules in
    // globals.css) for the chain to mean what it reads as.
    //
    // The heading is applied in proportion to how stretched the ring actually
    // is. A held angle with no stretch is invisible on the free-state circle
    // but would visibly tilt a locked rectangle, and the angle is deliberately
    // held rather than reset when travel is too slow to have a direction.
    const tilt = angle * Math.min(1, stretch / STRETCH_MAX);
    const press = pressed ? PRESS_RING : 1;
    const sx = (1 + stretch) * press;
    const sy = (1 - stretch * 0.72) * press;
    if (Math.abs(w - wroteW) > 0.25) {
      ring.style.width = `${(wroteW = w).toFixed(2)}px`;
    }
    if (Math.abs(h - wroteH) > 0.25) {
      ring.style.height = `${(wroteH = h).toFixed(2)}px`;
    }
    if (Math.abs(radius - wroteR) > 0.25) {
      ring.style.borderRadius = `${(wroteR = radius).toFixed(2)}px`;
    }
    ring.style.transform =
      `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) ` +
      `rotate(${tilt.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)}) ` +
      `translate(-50%, -50%)`;
    dot.style.transform =
      `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) ` +
      `scale(${pressed ? PRESS_DOT : 1}) translate(-50%, -50%)`;
    // Opacity is written per layer rather than inherited from a wrapper. A
    // wrapper below opacity 1 would be both a stacking context and a backdrop
    // root, which would break the blend and neutralize the ring's contrast
    // filter at once.
    if (Math.abs(alpha - wroteAlpha) > 0.004) {
      ring.style.opacity = (wroteAlpha = alpha).toFixed(3);
    }
    const dotAlpha = alpha * dim;
    if (Math.abs(dotAlpha - wroteDim) > 0.004) {
      dot.style.opacity = (wroteDim = dotAlpha).toFixed(3);
    }

    // ---- Stop when there is nothing left to move --------------------------
    const still =
      Math.abs(rx - tx) < 0.05 &&
      Math.abs(ry - ty) < 0.05 &&
      speed < 0.5 &&
      Math.abs(w - tw) < 0.2 &&
      Math.abs(h - th) < 0.2 &&
      Math.abs(radius - tr) < 0.2 &&
      Math.abs(alpha - wantAlpha) < 0.004 &&
      Math.abs(dim - wantDim) < 0.004 &&
      stretch < 0.002 &&
      !pressed &&
      !dirty;
    // A held lock keeps the loop alive so the ring rides its element; a hidden
    // cursor always stops, lock or not.
    const holding = target !== null && alpha > 0.01;
    if (still && !holding) {
      running = false;
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  // ---- Events -------------------------------------------------------------
  /*
    Which backdrop the cursor is over, so the blend mode can stand down.

    The cursor is white under mix-blend-mode: exclusion, which inverts its
    backdrop. Over the black page and the white hero that resolves to 21:1
    both ways, which is why one blend has always been enough. The violet
    chapter is the case the blend cannot serve: exclusion renders the ring
    #81c412 there, 2.63:1 against the field, under the 3:1 a pointer owes.
    On those surfaces the blend is switched off and the plain white cursor
    is used instead, which is 5.62:1 on violet.

    The cover images are the exception inside the exception. They sit on the
    field but they are not the field: they run from near-white to near-black,
    which is precisely the case an inverting blend handles and a fixed colour
    cannot. Standing the blend down over them measured 1.23:1 on a light
    cover. So the flag means "over the flat violet", not "inside the chapter".

    This rides the elementFromPoint the reads block already does, so it is
    the element genuinely under the cursor and costs no extra layout. It
    writes only on change, like the hero's nav theme.
  */
  const surface = (under: Element | null) => {
    const onField =
      under?.closest(".work-chapter, .statement-portal") &&
      !under.closest(".work-rail__media");
    const next = onField ? "violet" : "";
    const root = document.documentElement;
    if ((root.dataset.cursorSurface ?? "") === next) return;
    if (next) root.dataset.cursorSurface = next;
    else delete root.dataset.cursorSurface;
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") {
      // Touch and pen have no cursor to stand in for.
      alphaTarget = 0;
      wake();
      return;
    }
    px = event.clientX;
    py = event.clientY;
    if (!seen) {
      seen = true;
      rx = px;
      ry = py;
    }
    alphaTarget = 1;
    const under = event.target as Element | null;
    resolve(under);
    // Also here, not only in the dirty block: a pointer move does not set
    // dirty (it resolves straight off event.target), so without this the
    // flag would only ever update on scroll and would go stale the moment
    // the pointer crossed onto or off the field without one.
    surface(under);
    wake();
  };

  const onDown = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !seen) return;
    pressed = true;
    // One reusable node, so a fast clicker cannot pile up elements.
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    ripple.getAnimations().forEach((animation) => animation.cancel());
    // scale() outside the centering shift, so the ring grows about the press
    // point rather than drifting off it (see transform-origin in globals.css).
    ripple.animate(
      [
        { transform: "scale(0.3) translate(-50%, -50%)", opacity: 0.55 },
        { transform: "scale(1) translate(-50%, -50%)", opacity: 0 },
      ],
      { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    wake();
  };

  // On window, so a press that starts on a button and ends anywhere else
  // still releases.
  const onUp = () => {
    if (!pressed) return;
    pressed = false;
    // The press may have changed what is under the pointer.
    dirty = true;
    wake();
  };

  const onLeave = () => {
    alphaTarget = 0;
    wake();
  };
  const onEnter = () => {
    if (seen) alphaTarget = 1;
    wake();
  };
  const onBlur = () => {
    pressed = false;
    alphaTarget = 0;
    wake();
  };
  const onVisibility = () => {
    if (document.hidden) onBlur();
  };
  const onGeometry = () => {
    dirty = true;
    wake();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("pointercancel", onUp, { passive: true });
  window.addEventListener("blur", onBlur);
  window.addEventListener("scroll", onGeometry, { passive: true });
  window.addEventListener("resize", onGeometry, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  document.documentElement.addEventListener("pointerleave", onLeave);
  document.documentElement.addEventListener("pointerenter", onEnter);

  // Only now does the native cursor go away: if this module had failed to
  // load, the page would still have its own cursor.
  document.documentElement.dataset.fluidCursor = "on";
  document.documentElement.dataset.fluidCursorMode = "free";
  wake();

  return {
    destroy() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", onGeometry);
      window.removeEventListener("resize", onGeometry);
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      delete document.documentElement.dataset.fluidCursor;
      delete document.documentElement.dataset.fluidCursorMode;
      delete document.documentElement.dataset.cursorSurface;
      ring.remove();
      dot.remove();
      ripple.remove();
    },
  };
}
