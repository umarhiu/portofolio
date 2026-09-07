"use client";

import { useEffect } from "react";

/*
  Lenis smooth scroll, as a progressive enhancement. Same gate philosophy as the
  WebGL hero and the Selected Work cinematic: it only runs on a capable desktop
  with a fine pointer and motion allowed. Touch devices keep their native
  momentum scroll; reduced-motion users keep native scroll untouched.

  Lenis is chosen over GSAP ScrollSmoother on purpose: ScrollSmoother transforms
  a content wrapper, which breaks the CSS `position: sticky` pinning this whole
  site is built on (hero, statement, cinematic) and re-anchors the fixed nav.
  Lenis keeps the real native scroll position and only interpolates it, so sticky
  and fixed keep working.

  lenis, gsap, and ScrollTrigger are dynamically imported the first time the gate
  passes, so they never enter the initial First Load JS and never load at all on
  non-capable devices. The scroll is synced to ScrollTrigger so the scrubbed
  timelines stay in lockstep with the smoothed scroll.

  The gate is REACTIVE: this component is mounted once in the root layout and
  never unmounts, so it listens for the capability query flipping (reduced-motion
  toggled, window resized past the desktop breakpoint) and starts or tears Lenis
  down accordingly, keeping the hard reduced-motion contract live rather than a
  mount-time snapshot.
*/

// Motion allowed, fine pointer, desktop width. The same capable-desktop cut
// line the hero X-ray and Selected Work cinematic use.
const CAPABLE_QUERY =
  "(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 1024px)";

// getElementById (not querySelector) so a hash that is a valid HTML id but an
// invalid CSS selector (e.g. #2024-recap) can never throw a SyntaxError.
function selectTarget(hash: string): HTMLElement | null {
  if (!hash || hash === "#") return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

// Native fragment navigation moves focus to the target; preventDefault suppresses
// that, so restore it (WCAG 2.4.1). preventScroll leaves Lenis in charge of the
// actual scroll animation.
function moveFocus(el: HTMLElement) {
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

export function SmoothScroll() {
  useEffect(() => {
    const mql = window.matchMedia(CAPABLE_QUERY);

    let lenis: import("lenis").default | null = null;
    let teardown: (() => void) | null = null;
    let starting = false;
    let disposed = false;

    // Smooth same-page anchor navigation (skip link, in-page nav) and restore
    // focus. Cross-page hash links fall through to the Next router.
    const onClick = (e: MouseEvent) => {
      if (!lenis || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.includes("#")) return;
      const url = new URL((anchor as HTMLAnchorElement).href, window.location.href);
      if (
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search
      ) {
        return; // different page: let the router handle it
      }
      const target = selectTarget(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target);
      moveFocus(target);
      history.pushState(null, "", url.hash);
    };

    async function start() {
      if (lenis || starting) return;
      starting = true;
      try {
        const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] =
          await Promise.all([
            import("lenis"),
            import("gsap"),
            import("gsap/ScrollTrigger"),
          ]);
        // The gate may have flipped false (or the effect torn down) while the
        // chunks were loading. Bail before creating anything.
        if (disposed || !mql.matches || lenis) return;

        gsap.registerPlugin(ScrollTrigger);

        const instance = new Lenis({
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        const onLenisScroll = () => ScrollTrigger.update();
        instance.on("scroll", onLenisScroll);

        const raf = (time: number) => instance.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        document.addEventListener("click", onClick);
        ScrollTrigger.refresh();

        // Honor a deep-linked hash. Scroll now, then re-issue on the next
        // ScrollTrigger refresh, because the Selected Work cinematic grows its
        // scroll track when its island mounts (after this runs), which would
        // otherwise leave a below-work anchor landing short.
        let onRefresh: (() => void) | null = null;
        const target = selectTarget(window.location.hash);
        if (target) {
          instance.scrollTo(target, { immediate: true });
          moveFocus(target);
          onRefresh = () => {
            instance.scrollTo(target, { immediate: true });
            if (onRefresh) ScrollTrigger.removeEventListener("refresh", onRefresh);
            onRefresh = null;
          };
          ScrollTrigger.addEventListener("refresh", onRefresh);
        }

        lenis = instance;
        teardown = () => {
          document.removeEventListener("click", onClick);
          if (onRefresh) ScrollTrigger.removeEventListener("refresh", onRefresh);
          instance.off("scroll", onLenisScroll);
          gsap.ticker.remove(raf);
          gsap.ticker.lagSmoothing(500, 33); // restore gsap's default
          instance.destroy();
        };
      } catch {
        // Offline, a stale chunk after a redeploy (ChunkLoadError), or CSP: leave
        // native scroll as the fallback rather than throwing an unhandled rejection.
      } finally {
        starting = false;
      }
    }

    function stop() {
      teardown?.();
      teardown = null;
      lenis = null;
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
