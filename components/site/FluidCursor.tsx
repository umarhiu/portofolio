"use client";

import { useEffect } from "react";

/*
  Fluid interaction cursor, as a progressive enhancement.

  This file is only the gate. All of the physics, DOM, and the rAF loop live in
  lib/fluid-cursor.ts, which is dynamically imported the first time the gate
  passes, exactly as SmoothScroll defers Lenis. So the engine never enters the
  initial First Load JS, and a phone or a reduced-motion visitor never
  downloads it at all.

  The gate is the same capable-desktop cut line the rest of the site uses, plus
  `hover: hover` because a cursor is meaningless without one:

    - prefers-reduced-motion: no-preference. A spring-lagged cursor is exactly
      the kind of continuous non-essential motion the preference exists to
      suppress, so this is not softened to a shorter duration. The native
      cursor is left completely untouched.
    - pointer: fine and hover: hover. Touch has no cursor to replace.
    - min-width: 1024px. Below that the site is a touch layout.

  It is reactive, like SmoothScroll: mounted once in the root layout and never
  unmounted, it listens for the query flipping (reduced motion toggled, a
  window dragged to a smaller size, a tablet docked to a mouse) and mounts or
  tears down accordingly, so the reduced-motion contract stays live rather than
  being a mount-time snapshot.

  The engine hides the native cursor by setting html[data-fluid-cursor="on"]
  once its own nodes exist. That ordering matters: if the chunk fails to load,
  nothing sets the attribute and the page keeps its ordinary cursor rather than
  having none at all.
*/
const CAPABLE_QUERY =
  "(prefers-reduced-motion: no-preference) and (pointer: fine) and (hover: hover) and (min-width: 1024px)";

export function FluidCursor() {
  useEffect(() => {
    const mql = window.matchMedia(CAPABLE_QUERY);

    let instance: { destroy: () => void } | null = null;
    let starting = false;
    let disposed = false;

    async function start() {
      if (instance || starting) return;
      starting = true;
      try {
        const { mountFluidCursor } = await import("@/lib/fluid-cursor");
        // The gate may have flipped, or the effect torn down, while the chunk
        // was in flight.
        if (disposed || !mql.matches || instance) return;
        instance = mountFluidCursor();
      } catch {
        // Offline, a stale chunk after a redeploy (ChunkLoadError), or CSP.
        // The native cursor is still there, so there is nothing to recover.
      } finally {
        starting = false;
      }
    }

    function stop() {
      instance?.destroy();
      instance = null;
    }

    function evaluate() {
      if (mql.matches) void start();
      else stop();
    }

    evaluate();
    mql.addEventListener("change", evaluate);

    return () => {
      disposed = true;
      mql.removeEventListener("change", evaluate);
      stop();
    };
  }, []);

  return null;
}
