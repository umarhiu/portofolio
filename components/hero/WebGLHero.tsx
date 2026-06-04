"use client";

import { Fragment, useCallback, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { heroStates } from "@/lib/content";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroBackgroundFoundation } from "@/components/hero/HeroBackgroundFoundation";
import { HeroBackgroundData } from "@/components/hero/HeroBackgroundData";

gsap.registerPlugin(ScrollTrigger);

/*
  Text-only scroll hero. Five distinct typographic compositions on the void,
  snapped per state. Each state plays a staggered "pop" entrance (eyebrow, then
  each headline word, then sub/CTA, each rising with a scale overshoot) on first
  load and whenever you land on it. The layer crossfade keeps the scrub smooth.
*/

const PLACEMENT: Record<
  string,
  { wrap: string; size: string; lead?: string; max?: string }
> = {
  "bottom-left": {
    wrap: "absolute bottom-[14vh] left-0 w-full max-w-[900px] text-left",
    size: "clamp(2.25rem, 5vw, 4.5rem)",
  },
  "top-left": {
    wrap: "absolute top-[19vh] left-0 w-full max-w-[680px] text-left",
    size: "clamp(3rem, 8vw, 7rem)",
    lead: "clamp(1.1rem, 2.2vw, 1.7rem)",
  },
  right: {
    wrap: "absolute right-0 top-1/2 w-full max-w-[620px] -translate-y-1/2 text-right",
    size: "clamp(1.85rem, 3.6vw, 3.25rem)",
    max: "20ch",
  },
  "bottom-wide": {
    wrap: "absolute bottom-[13vh] left-0 w-full text-left",
    size: "clamp(1.8rem, 3.4vw, 3.1rem)",
  },
  center: {
    wrap: "absolute inset-0 flex flex-col items-center justify-center text-center",
    size: "clamp(2.2rem, 5vw, 4.5rem)",
    max: "20ch",
  },
};

// Split a headline into per-word spans so each word can animate in sequence.
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="hero-anim inline-block">{w}</span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

export default function ScrollHero() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<HTMLDivElement[]>([]);
  const railRefs = useRef<HTMLButtonElement[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(-1);

  // Crossfade the five layers by distance from the active snap point, and
  // highlight the rail number in view.
  const paintOverlay = useCallback((p: number) => {
    layerRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = String(Math.max(0, 1 - Math.abs(p * 4 - i) * 1.9));
    });
    const active = Math.max(0, Math.min(4, Math.round(p * 4)));
    railRefs.current.forEach((el, i) => {
      if (!el) return;
      const on = i === active;
      el.dataset.active = on ? "true" : "false";
      if (on) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
  }, []);

  // Staggered pop-in for one state's text (eyebrow, words, sub, CTA in DOM order).
  const playEntrance = useCallback((i: number) => {
    const layer = layerRefs.current[i];
    if (!layer) return;
    const els = layer.querySelectorAll<HTMLElement>(".hero-anim");
    gsap.fromTo(
      els,
      { opacity: 0, y: 32, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "back.out(1.5)",
        stagger: 0.06,
        overwrite: true,
      },
    );
  }, []);

  const setActive = useCallback(
    (active: number) => {
      if (active === activeRef.current) return;
      activeRef.current = active;
      layerRefs.current.forEach((l, idx) => {
        if (l) l.style.pointerEvents = idx === active ? "auto" : "none";
      });
      playEntrance(active);
    },
    [playEntrance],
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Hide animatable elements before first paint, then play state 01.
        layerRefs.current.forEach((l) => {
          if (l)
            gsap.set(l.querySelectorAll(".hero-anim"), {
              opacity: 0,
              y: 32,
              scale: 0.9,
            });
        });
        const st = ScrollTrigger.create({
          trigger: root.current!,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          snap: {
            snapTo: [0, 0.25, 0.5, 0.75, 1],
            duration: { min: 0.2, max: 0.5 },
            ease: "power1.inOut",
          },
          onUpdate: (self) => {
            paintOverlay(self.progress);
            setActive(Math.max(0, Math.min(4, Math.round(self.progress * 4))));
          },
          onRefresh: (self) => paintOverlay(self.progress),
        });
        stRef.current = st;
        paintOverlay(0);
        activeRef.current = -1;
        setActive(0);
        return () => {
          gsap.killTweensOf(window);
          st.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const jumpTo = (i: number) => {
    const st = stRef.current;
    if (!st || st.end <= st.start) return;
    gsap.killTweensOf(window);
    window.scrollTo({ top: st.start + (i / 4) * (st.end - st.start), behavior: "smooth" });
  };

  return (
    <div ref={root} className="hero-webgl relative h-[500dvh]">
      <div ref={stage} className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        {heroStates.map((s, i) => {
          const place = PLACEMENT[s.placement];
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <div
              key={s.index}
              ref={(el) => {
                if (el) layerRefs.current[i] = el;
              }}
              className="pointer-events-none absolute inset-0 z-10"
              style={{ opacity: 0 }}
            >
              {s.index === "01" ? <HeroBackground /> : null}
              {s.index === "02" ? <HeroBackgroundFoundation /> : null}
              {s.index === "03" ? <HeroBackgroundData /> : null}
              <div className="absolute inset-0 px-4 sm:px-8 lg:px-20">
                <div className="relative mx-auto h-full w-full max-w-[1400px]">
                  <div className={place.wrap}>
                    {s.placement === "bottom-wide" ? (
                      <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <Heading
                          className="font-display font-extrabold uppercase text-vellum"
                          style={{
                            fontSize: place.size,
                            lineHeight: 0.98,
                            letterSpacing: "-0.02em",
                            maxWidth: "22ch",
                          }}
                        >
                          <Words text={s.headline} />
                        </Heading>
                        {s.spec ? (
                          <p className="hero-anim shrink-0 font-mono text-xs uppercase tracking-[0.16em] text-graphite sm:text-right">
                            {s.spec}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <>
                        {s.eyebrow ? (
                          <div className="hero-anim mb-5 font-mono text-xs uppercase tracking-[0.18em] text-graphite">
                            {s.eyebrow}
                          </div>
                        ) : null}
                        {s.lead ? (
                          <div
                            className="hero-anim font-display font-bold uppercase text-vellum/70"
                            style={{ fontSize: place.lead, lineHeight: 1.05 }}
                          >
                            {s.lead}
                          </div>
                        ) : null}
                        <Heading
                          className="font-display font-extrabold uppercase"
                          style={{
                            fontSize: place.size,
                            lineHeight: 0.98,
                            letterSpacing: "-0.02em",
                            maxWidth: place.max,
                            color: s.ghost
                              ? "rgba(236,231,221,0.10)"
                              : "var(--color-vellum)",
                            WebkitTextStroke: s.ghost
                              ? "1.5px var(--color-vellum)"
                              : undefined,
                            marginLeft: s.placement === "center" ? "auto" : undefined,
                            marginRight: s.placement === "center" ? "auto" : undefined,
                          }}
                        >
                          <Words text={s.headline} />
                        </Heading>
                        {s.sub ? (
                          <p
                            className="hero-anim mt-6 font-mono text-xs uppercase tracking-[0.16em] text-graphite md:text-sm"
                            style={{
                              maxWidth: "42ch",
                              marginLeft:
                                s.placement === "right" || s.placement === "center"
                                  ? "auto"
                                  : undefined,
                            }}
                          >
                            {s.sub}
                          </p>
                        ) : null}
                        {s.cta ? (
                          <span className="hero-anim mt-8 inline-block">
                            <MagneticButton
                              href={s.cta.href}
                              className="cta inline-flex items-center gap-2 bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-void"
                            >
                              {s.cta.label}
                            </MagneticButton>
                          </span>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Keyboard-operable state rail. Each control jumps to a snap point. */}
        <nav
          aria-label="Hero states"
          className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 lg:block"
        >
          <ol className="space-y-3">
            {heroStates.map((s, i) => (
              <li key={s.index}>
                <button
                  ref={(el) => {
                    if (el) railRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-label={`Go to state ${s.index}`}
                  className="hero-rail__btn flex cursor-pointer items-center gap-2 font-mono text-xs tracking-widest"
                >
                  <span className="hero-rail__tick" aria-hidden="true" />
                  {s.index}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
