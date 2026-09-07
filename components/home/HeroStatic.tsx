import { hero } from "@/lib/content";
import { HeroPlay } from "@/components/hero/HeroPlay";

/*
  "A little play, serious craft": one centered editorial composition on a
  white canvas (see docs/portfolio-hero-brief.md). Identity line, the headline with
  the embedded controller (HeroPlay, a small client island that still SSRs its
  default state), a readable support line, and the two real links. The default
  frame is complete without JS or motion: headline "I design things worth
  using.", role, copy, and working navigation render immediately.

  The section's white background lives on #hero in globals.css.
*/
export function HeroStatic() {
  return (
    // One-viewport intro shell (nav height included via pt; .hero-shell owns
    // the svh/dvh min-height). Content-safe: it grows at short heights or
    // zoom instead of clipping.
    <div className="hero-play hero-shell relative flex flex-col items-center justify-center px-6 pb-8 pt-20 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[1200px] text-center">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-void/60 sm:mb-8">
          <span data-hero-enter="identity" className="inline-block">{hero.identity}</span>
        </p>

        <HeroPlay />

        <p
          data-hero-enter="description"
          className="mx-auto mt-7 max-w-[52ch] text-void/75 sm:mt-8"
          style={{ fontSize: "1.15rem", lineHeight: 1.6 }}
        >
          {hero.support}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:mt-8">
          {/* Equal widths when the pair stacks on narrow screens; natural
              widths side by side from sm up. */}
          <a
            data-hero-enter="primary"
            href={hero.ctas.primary.href}
            className="inline-flex min-h-11 w-full max-w-[280px] items-center justify-center bg-void px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-vellum transition-opacity duration-200 hover:opacity-85 sm:w-auto sm:max-w-none"
          >
            {hero.ctas.primary.label}
          </a>
          <a
            data-hero-enter="secondary"
            href={hero.ctas.secondary.href}
            // border-void/50 = 3.6:1 on white, clearing the 3:1 non-text
            // minimum for the outline that identifies this button.
            className="inline-flex min-h-11 w-full max-w-[280px] items-center justify-center border border-void/50 px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-void transition-colors duration-200 hover:border-void sm:w-auto sm:max-w-none"
          >
            {hero.ctas.secondary.label}
          </a>
        </div>
      </div>
    </div>
  );
}
