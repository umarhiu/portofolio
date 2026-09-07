/** Runs in the document head, before any hero markup can paint. It owns the
 * fail-open deadlines independently of React, Motion and font loading.
 * A blocked inline script simply leaves the server-rendered page visible.
 */
export const heroIntroBootstrap = String.raw`(() => {
  if (window.__heroIntro) return;
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
      const clearStyles = () => document.querySelectorAll('[data-hero-enter]').forEach(el => {
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
  const navigation = performance.getEntriesByType('navigation')[0];
  if (location.pathname !== '/' || location.hash || scrollY > 0 ||
      document.hidden || media.matches || navigation?.type === 'back_forward') return;
  const listen = (target, name, callback, options) => {
    target.addEventListener(name, callback, options);
    cleanups.push(() => target.removeEventListener(name, callback, options));
  };
  // Establish recovery BEFORE adding any hidden state.
  timer = setTimeout(() => intro.finish('readiness-timeout'), 600);
  intro.state = 'preparing';
  intro.reason = '';
  listen(window, 'scroll', () => intro.finish('scroll'), { passive: true });
  listen(window, 'wheel', () => intro.finish('scroll-input'), { passive: true });
  listen(window, 'resize', () => {
    if (intro.state === 'entering') intro.finish('resize');
  }, { passive: true });
  listen(window, 'touchstart', () => intro.finish('touch'), { passive: true });
  listen(window, 'pointermove', e => {
    intro.pointer = { clientX: e.clientX, clientY: e.clientY, pointerType: e.pointerType };
  }, { passive: true });
  listen(document, 'keydown', () => intro.finish('keyboard'), true);
  listen(document, 'focusin', () => intro.finish('focus'), true);
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
