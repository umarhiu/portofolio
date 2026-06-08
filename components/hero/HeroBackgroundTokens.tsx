"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
  Background for hero state 02 ("It starts at the Foundation. The grid, the
  spacing scale, the rules everything inherits."). The design system's own
  foundation tokens float as small vellum cards scattered around the headline:
  color swatches (the brand palette), spacing values, a column grid, type tiers.

  Three nested transforms, each owning distinct properties so none fight:
  - OUTER  (.tok-card)     : scroll parallax (translate, cached quickSetter)
  - MID    (.tok-magnetic) : magnetic 3D tilt + pull toward the cursor (quickTo)
  - INNER  (.tok-float)    : idle drift orbiting the authored position (yoyo)

  All GSAP (matches the hero). Reduced-motion paints the cards static.
  pointer-events:none, so it never blocks anything; the headline renders on top.
*/

type Card =
  | { kind: "swatch"; top: string; left: string; w: number; swatch: string; name: string; hex: string; border?: boolean; speed: number; speedX?: number }
  | { kind: "pill"; top: string; left: string; label: string; sub: string; speed: number; speedX?: number }
  | { kind: "type"; top: string; left: string; name: string; size: string; speed: number; speedX?: number }
  | { kind: "grid"; top: string; left: string; speed: number; speedX?: number }
  | { kind: "figma"; top: string; left: string; src: string; w: number; speed: number; speedX?: number };

// Hand-placed for composition: clear of the top-left "Foundation." headline / sub
// / rail, the center anchored by the Grid + Display cards, a few near the edges.
const CARDS: Card[] = [
  { kind: "swatch", top: "11%", left: "70%", w: 124, swatch: "#ff6a1a", name: "Signal Amber", hex: "FF6A1A", speed: 230, speedX: -50 },
  { kind: "pill", top: "27%", left: "86%", label: "16px", sub: "space.md", speed: -190 },
  { kind: "figma", top: "46%", left: "61%", src: "/asset/hero/figma/AddVariant.svg", w: 38, speed: 150, speedX: -40 },
  { kind: "grid", top: "50%", left: "42%", speed: -120, speedX: 30 },
  { kind: "pill", top: "62%", left: "30%", label: "8px", sub: "space.sm", speed: 300 },
  { kind: "swatch", top: "62%", left: "78%", w: 124, swatch: "#3a5a78", name: "Drafting Blue", hex: "3A5A78", speed: -280, speedX: 40 },
  { kind: "swatch", top: "66%", left: "11%", w: 124, swatch: "#7e848f", name: "Graphite", hex: "7E848F", speed: 210, speedX: 70 },
  // Pinned a fixed clearance below the text anchor (the headline block sits at
  // top-[19vh] with a near-fixed px height), not a raw % of the viewport. A raw
  // % shrinks to fewer px on short laptop heights and rode up into the "rules
  // everything inherits." sub line; the calc keeps it the same gap below the
  // text at every height, so it never collides.
  { kind: "pill", top: "calc(19vh + 260px)", left: "8%", label: "24px", sub: "space.lg", speed: -230 },
  { kind: "pill", top: "52%", left: "89%", label: "1px", sub: "hairline", speed: 250 },
  { kind: "figma", top: "80%", left: "46%", src: "/asset/hero/figma/ready-dev.svg", w: 40, speed: -150 },
  // Figma annotation chips scattered among the tokens.
  { kind: "figma", top: "55%", left: "22%", src: "/asset/hero/figma/Dimension.svg", w: 58, speed: -170, speedX: 30 },
  { kind: "figma", top: "72%", left: "63%", src: "/asset/hero/figma/Label-atom.svg", w: 76, speed: 180, speedX: -30 },
];

function CardContent({ card }: { card: Card }) {
  if (card.kind === "swatch") {
    return (
      <div
        className="rounded-[12px] bg-vellum p-2 shadow-[0_22px_50px_-18px_rgba(0,0,0,0.75)]"
        style={{ width: card.w }}
      >
        <div
          className="h-[58px] w-full rounded-[7px]"
          style={{
            backgroundColor: card.swatch,
            border: card.border ? "1px solid rgba(42,46,52,0.5)" : undefined,
          }}
        />
        <div className="mt-1.5 px-0.5">
          <div className="text-[10px] font-semibold leading-tight text-void">{card.name}</div>
          <div className="font-mono text-[9px] tracking-wide text-void/70">{card.hex}</div>
        </div>
      </div>
    );
  }
  if (card.kind === "pill") {
    return (
      <div className="flex items-baseline gap-1.5 rounded-full bg-vellum px-3 py-1.5 shadow-[0_18px_44px_-16px_rgba(0,0,0,0.7)]">
        <span className="font-display text-[12px] font-bold text-void">{card.label}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-void/70">{card.sub}</span>
      </div>
    );
  }
  if (card.kind === "figma") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={card.src}
        alt=""
        width={card.w}
        className="block select-none [filter:drop-shadow(0_10px_20px_rgba(0,0,0,0.45))]"
      />
    );
  }
  if (card.kind === "grid") {
    return (
      <div className="rounded-[12px] bg-vellum p-2.5 shadow-[0_20px_48px_-16px_rgba(0,0,0,0.72)]" style={{ width: 112 }}>
        <div className="flex h-[36px] items-stretch gap-[3px]">
          {Array.from({ length: 6 }).map((_, k) => (
            <div key={k} className="flex-1 rounded-[2px]" style={{ backgroundColor: "rgba(58,90,120,0.5)" }} />
          ))}
        </div>
        <div className="mt-1.5 px-0.5">
          <span className="text-[10px] font-semibold text-void">Grid</span>{" "}
          <span className="font-mono text-[9px] text-void/70">12 col</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-vellum px-3.5 py-3 shadow-[0_20px_48px_-16px_rgba(0,0,0,0.72)]">
      <span className="font-display text-[26px] font-extrabold leading-none text-void">Aa</span>
      <span className="leading-tight">
        <span className="block text-[11px] font-semibold text-void">{card.name}</span>
        <span className="font-mono text-[11px] text-void/70">{card.size}px</span>
      </span>
    </div>
  );
}

export function HeroBackgroundTokens({ active = false }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !active) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      const outers = q(".tok-card");
      const mids = q(".tok-magnetic");
      const inners = q(".tok-float");
      const rand = gsap.utils.random;

      if (reduce) {
        gsap.set(inners, { opacity: 1 });
        return;
      }

      const cursor = q(".tok-cursor")[0];

      // Promote only the continuously-animating layers, only while active.
      const promoted = [...mids, ...inners, ...(cursor ? [cursor] : [])];
      promoted.forEach((el) => (el.style.willChange = "transform"));

      // Entrance: cards pop in, staggered.
      gsap.fromTo(
        inners,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.05 },
      );

      // Idle drift: each inner orbits gently AROUND its authored position.
      inners.forEach((el) => {
        const dx = rand(8, 16);
        const dy = rand(10, 20);
        const dr = rand(1.5, 3.5);
        gsap.fromTo(
          el,
          { x: -dx, y: -dy, rotation: -dr },
          { x: dx, y: dy, rotation: dr, duration: rand(4, 7), ease: "sine.inOut", repeat: -1, yoyo: true, delay: rand(0, 1.2) },
        );
      });

      // Scroll parallax on the OUTER wrappers, centered on state 02 (progress
      // ~0.25). Cached quickSetters => no tween allocation per scroll frame.
      const heroRoot = root.closest(".hero-webgl");
      let st: ScrollTrigger | undefined;
      if (heroRoot) {
        const setters = outers.map((el) => ({
          x: gsap.quickSetter(el, "x", "px"),
          y: gsap.quickSetter(el, "y", "px"),
        }));
        const apply = (p: number) => {
          const dp = p - 0.25;
          setters.forEach((s, i) => {
            s.y(dp * CARDS[i].speed);
            s.x(dp * (CARDS[i].speedX ?? 0));
          });
        };
        st = ScrollTrigger.create({
          trigger: heroRoot,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => apply(self.progress),
        });
        apply(st.progress);
      }

      // Magnetic 3D follow on the MID wrappers: nearby cards tilt toward and pull
      // toward the cursor, easing back when it leaves. quickTo reuses one tween
      // per property (no per-move allocation).
      const RADIUS = 360;
      const PULL = 0.22;
      const TILT = 20;
      gsap.set(mids, { transformPerspective: 800 });
      const setters = mids.map((el) => ({
        x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" }),
        rx: gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" }),
        ry: gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" }),
      }));
      let centers = mids.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      const onMove = (e: PointerEvent) => {
        const px = e.clientX;
        const py = e.clientY;
        for (let i = 0; i < mids.length; i++) {
          const c = centers[i];
          const dx = px - c.x;
          const dy = py - c.y;
          let t = 1 - Math.hypot(dx, dy) / RADIUS;
          if (t < 0) t = 0;
          else t *= t;
          setters[i].x(dx * t * PULL);
          setters[i].y(dy * t * PULL);
          setters[i].ry((dx / RADIUS) * TILT * t);
          setters[i].rx(-(dy / RADIUS) * TILT * t);
        }
      };
      const reset = () => setters.forEach((s) => { s.x(0); s.y(0); s.rx(0); s.ry(0); });
      const onResize = () => {
        centers = mids.map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("blur", reset);
      window.addEventListener("resize", onResize);

      // Friend cursor: a collaborator that wanders card to card on a loop.
      if (cursor) {
        const order = [0, 1, 8, 5, 9, 6, 7, 4, 3, 2];
        const targets = order.map((idx) => {
          const el = outers[idx] as HTMLElement;
          return { x: el.offsetLeft + 10, y: el.offsetTop + 8 };
        });
        gsap.set(cursor, { x: targets[0].x, y: targets[0].y, opacity: 0 });
        const tl = gsap.timeline({ repeat: -1, delay: 0.7 });
        tl.to(cursor, { opacity: 1, duration: 0.4 });
        for (let k = 1; k < targets.length; k++) {
          tl.to(cursor, { x: targets[k].x, y: targets[k].y, duration: 0.9, ease: "power2.inOut" }, "+=0.55");
        }
        tl.to(cursor, { x: targets[0].x, y: targets[0].y, duration: 0.9, ease: "power2.inOut" }, "+=0.55");
      }

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("blur", reset);
        window.removeEventListener("resize", onResize);
        promoted.forEach((el) => (el.style.willChange = "auto"));
      };
    },
    { scope: ref, dependencies: [active], revertOnUpdate: true },
  );

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="relative mx-auto h-full w-full max-w-[1500px]">
        {CARDS.map((card, i) => (
          <div key={i} className="tok-card absolute" style={{ top: card.top, left: card.left }}>
            <div className="tok-magnetic">
              <div className="tok-float">
                <CardContent card={card} />
              </div>
            </div>
          </div>
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/asset/hero/figma/friend.svg"
          alt=""
          width={88}
          className="tok-cursor absolute left-0 top-0"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
}
