/** Runs in the document head, before any hero markup can paint. It owns the
 * fail-open deadlines independently of React, Motion and font loading.
 * A blocked inline script simply leaves the server-rendered page visible.
 */
export const heroIntroBootstrap = String.raw`(() => {
  if (window.__heroIntro) return;
  const navigation = performance.getEntriesByType('navigation')[0];
  const restartOnReload = location.pathname === '/' && navigation?.type === 'reload';
  if (restartOnReload) {
    // Run before paint/restoration, including reloads from an anchor section.
    history.scrollRestoration = 'manual';
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Restore native history behavior when leaving this document.
    window.addEventListener('pagehide', () => { history.scrollRestoration = 'auto'; }, { once: true });
  }
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  let cleanups = [];
  const intro = window.__heroIntro = {
    state: 'ready',
    reason: 'ineligible',
    cancel: null,
    pointer: null,
    finish(reason = 'complete') {
      if (intro.state === 'ready') return;
      intro.state = 'ready';
      intro.reason = reason;
      clearTimeout(timer);
      try { if (intro.cancel) intro.cancel(); } catch (_) {}
      intro.cancel = null;
      // Letters are included: a text group reveals its own [data-reveal-letter]
      // spans, so a bypassed intro must clear their inline styles too or the
      // words would stay invisible after the fail-open.
      const clearStyles = () => document.querySelectorAll('[data-hero-enter], [data-reveal-letter]').forEach(el => {
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
        el.style.removeProperty('clip-path');
        el.style.removeProperty('pointer-events');
      });
      clearStyles();
      // Drain any final style write already queued by Motion's renderer.
      requestAnimationFrame(clearStyles);
      root.removeAttribute('data-hero-intro');
      cleanups.forEach(fn => fn());
      cleanups = [];
      window.dispatchEvent(new Event('hero-intro-ready'));
    },
    start(durationMs = 3400) {
      if (intro.state !== 'preparing') return false;
      if (scrollY > 0 || document.hidden || media.matches) {
        intro.finish('ineligible');
        return false;
      }
      clearTimeout(timer);
      timer = setTimeout(() => intro.finish('completion-timeout'), durationMs + 800);
      intro.state = 'entering';
      root.setAttribute('data-hero-intro', 'entering');
      return true;
    }
  };
  if (location.pathname !== '/' || location.hash || scrollY > 0 ||
      document.hidden || media.matches || navigation?.type === 'back_forward') return;
  const listen = (target, name, callback, options) => {
    target.addEventListener(name, callback, options);
    cleanups.push(() => target.removeEventListener(name, callback, options));
  };
  // Establish recovery BEFORE adding any hidden state.
  timer = setTimeout(() => intro.finish('readiness-timeout'), 2500);
  intro.state = 'preparing';
  intro.reason = '';
  // Lock before the first paint. All exit paths drain this cleanup,
  // including resource failures, navigation and the independent watchdog.
  const overflow = root.style.overflow;
  const overscroll = root.style.overscrollBehavior;
  root.style.overflow = 'hidden';
  root.style.overscrollBehavior = 'none';
  cleanups.push(() => {
    root.style.overflow = overflow;
    root.style.overscrollBehavior = overscroll;
  });
  const blockScroll = e => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  listen(window, 'scroll', () => {
    if (scrollY !== 0) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, { passive: true });
  listen(window, 'wheel', blockScroll, { passive: false, capture: true });
  listen(window, 'touchmove', blockScroll, { passive: false, capture: true });
  listen(window, 'resize', () => {
    if (intro.state === 'entering') intro.finish('resize');
  }, { passive: true });
  listen(window, 'pointermove', e => {
    intro.pointer = { clientX: e.clientX, clientY: e.clientY, pointerType: e.pointerType };
  }, { passive: true });
  listen(document, 'keydown', e => {
    const editing = e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]');
    if (!editing && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) blockScroll(e);
  }, true);
  const activate = e => {
    if (e.target instanceof Element && e.target.closest('a, button, input, select, textarea, [tabindex]'))
      intro.finish('activation');
  };
  listen(document, 'pointerdown', activate, true);
  listen(document, 'click', activate, true);
  listen(document, 'visibilitychange', () => {
    if (document.hidden) intro.finish('hidden');
  });
  listen(window, 'pagehide', () => intro.finish('navigation'));
  listen(window, 'pageshow', e => { if (e.persisted) intro.finish('restored'); });
  listen(media, 'change', () => { if (media.matches) intro.finish('reduced-motion'); });
  root.setAttribute('data-hero-intro', 'preparing');
})();`;
