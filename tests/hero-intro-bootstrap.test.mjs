import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../lib/hero-intro-bootstrap.ts", import.meta.url), "utf8");
const bootstrap = vm.runInNewContext(source.replace("export const", "const") + "\nheroIntroBootstrap;");

class Target {
  listeners = new Map();
  addEventListener(name, callback) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name).add(callback);
  }
  removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); }
  dispatchEvent(event) { for (const callback of this.listeners.get(event.type) || []) callback(event); }
}
function fixture(options = {}) {
  const window = new Target();
  const document = new Target();
  const media = new Target();
  const attrs = new Map();
  const timers = new Map();
  const frames = [];
  let now = 0, timerId = 0, events = 0;
  const styles = new Map([["opacity", "0"], ["transform", "translateY(18px)"],
    ["clip-path", "inset(0 0 100% 0)"], ["pointer-events", "none"]]);
  document.hidden = options.hidden || false;
  document.documentElement = {
    setAttribute: (key, value) => attrs.set(key, value),
    removeAttribute: key => attrs.delete(key),
  };
  document.querySelectorAll = () => [{ style: { removeProperty: key => styles.delete(key) } }];
  media.matches = options.reduced || false;
  window.matchMedia = () => media;
  window.addEventListener("hero-intro-ready", () => events++);
  class Element { closest() { return options.actionable ?? true; } }
  const context = vm.createContext({
    window, document, Element, Event: class { constructor(type) { this.type = type; } },
    location: { pathname: options.path || "/", hash: options.hash || "" },
    scrollY: options.scroll || 0,
    performance: { getEntriesByType: () => [{ type: options.navigation || "navigate" }] },
    setTimeout: (fn, delay) => { timers.set(++timerId, { fn, at: now + delay }); return timerId; },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: fn => frames.push(fn),
  });
  vm.runInContext(bootstrap, context);
  return {
    window, document, media, attrs, timers, styles, context, Element,
    get intro() { return window.__heroIntro; },
    get readyEvents() { return events; },
    tick(ms) {
      now += ms;
      for (const [id, timer] of timers) if (timer.at <= now) { timers.delete(id); timer.fn(); }
      frames.splice(0).forEach(fn => fn());
    },
  };
}

test("slow/missing bundle or unresolved font preparation fails open at 600ms", () => {
  const f = fixture();
  assert.equal(f.attrs.get("data-hero-intro"), "preparing");
  f.tick(599);
  assert.equal(f.intro.state, "preparing");
  f.tick(1);
  assert.equal(f.intro.state, "ready");
  assert.equal(f.intro.reason, "readiness-timeout");
  assert.equal(f.attrs.size, 0);
  assert.equal(f.styles.size, 0);
  assert.equal(f.intro.start(), false, "late hydration cannot hide again");
});

test("longer staging survives the old deadline and fails open at 4200ms", () => {
  const f = fixture();
  f.tick(300);
  assert.equal(f.intro.start(), true);
  let cancelled = 0;
  f.intro.cancel = () => { cancelled++; throw Error("animation failed"); };
  f.tick(1800);
  assert.equal(f.intro.state, "entering", "old watchdog must not truncate staging");
  f.tick(2399);
  assert.equal(f.intro.state, "entering");
  f.tick(1);
  assert.equal(f.intro.state, "ready");
  assert.equal(f.styles.size, 0);
  assert.equal(cancelled, 1);
  f.intro.finish();
  assert.equal(f.readyEvents, 1);
  assert.equal(f.timers.size, 0);
});

test("watchdog follows the orchestrator duration, and preparing resize is harmless", () => {
  const f = fixture();
  f.window.dispatchEvent({ type: "resize" });
  assert.equal(f.intro.state, "preparing");
  f.intro.start(5000);
  f.tick(5799);
  assert.equal(f.intro.state, "entering");
  f.tick(1);
  assert.equal(f.intro.state, "ready");
  assert.equal(f.styles.size, 0);
});

for (const options of [{ reduced: true }, { hidden: true }, { hash: "#selected-work" },
  { scroll: 250 }, { navigation: "back_forward" }, { path: "/work/case-study" }]) {
  test(`ineligible entry stays visible: ${JSON.stringify(options)}`, () => {
    const f = fixture(options);
    assert.equal(f.intro.state, "ready");
    assert.equal(f.attrs.size, 0);
    assert.equal(f.timers.size, 0);
  });
}

for (const name of ["scroll", "wheel", "resize", "touchstart", "keydown", "focusin", "pointerdown", "click", "pagehide"]) {
  test(`${name} settles synchronously without consuming the action`, () => {
    const f = fixture();
    f.intro.start();
    const target = ["keydown", "focusin", "pointerdown", "click"].includes(name) ? f.document : f.window;
    target.dispatchEvent({ type: name, target: new f.Element() });
    assert.equal(f.intro.state, "ready");
    assert.equal(f.styles.size, 0);
    assert.equal(f.readyEvents, 1);
  });
}

test("late restoration, reduced motion change and hidden tab settle; no replay", () => {
  for (const trigger of [
    f => { f.context.scrollY = 100; f.window.dispatchEvent({ type: "scroll" }); },
    f => { f.media.matches = true; f.media.dispatchEvent({ type: "change" }); },
    f => { f.document.hidden = true; f.document.dispatchEvent({ type: "visibilitychange" }); },
    f => f.window.dispatchEvent({ type: "pageshow", persisted: true }),
  ]) {
    const f = fixture();
    f.intro.start();
    trigger(f);
    assert.equal(f.intro.state, "ready");
    vm.runInContext(bootstrap, f.context);
    assert.equal(f.intro.start(), false);
    assert.equal(f.readyEvents, 1);
  }
});
