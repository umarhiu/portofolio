import { heroStates } from "@/lib/content";

/*
  The SSR, no-motion hero: five stacked full-height text states with
  byte-identical copy. This is the first paint and LCP source, and the
  reduced-motion fallback. When a capable client activates the scroll hero,
  the enhancer hides this subtree (it then contributes no height; the scroll
  hero provides its own track).
*/

const railLabels = heroStates.map((s) => s.index);

export function HeroStatic() {
  return (
    <div className="hero-static">
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-20 hidden h-0 lg:block"
      >
        <ol className="absolute left-8 top-[50dvh] -translate-y-1/2 space-y-3 font-mono text-xs tracking-widest text-graphite">
          {railLabels.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={
                  i === 0
                    ? "inline-block h-px w-6 bg-accent"
                    : "inline-block h-px w-3 bg-hairline"
                }
              />
              <span className={i === 0 ? "text-vellum" : ""}>{label}</span>
            </li>
          ))}
        </ol>
      </div>

      {heroStates.map((state, i) => {
        const isFirst = i === 0;
        const Heading = isFirst ? "h1" : "h2";
        return (
          <div
            key={state.index}
            id={`state-${state.index}`}
            className="flex min-h-[100dvh] items-center px-4 pt-24 pb-16 sm:px-8 lg:px-20"
          >
            <div className="mx-auto w-full max-w-[1400px]">
              <div>
                {state.eyebrow ? (
                  <div className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-graphite">
                    {state.eyebrow}
                  </div>
                ) : null}

                {state.lead ? (
                  <div
                    className="font-display font-bold uppercase text-vellum/70"
                    style={{ fontSize: "clamp(1.1rem, 2vw, 1.6rem)", lineHeight: 1.05 }}
                  >
                    {state.lead}
                  </div>
                ) : null}

                <Heading
                  className="font-display font-extrabold uppercase text-vellum"
                  style={{
                    fontSize: isFirst
                      ? "clamp(2.75rem, 6vw, 6.5rem)"
                      : "clamp(2.25rem, 4.5vw, 4.75rem)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {state.headline}
                </Heading>

                {state.sub ? (
                  <p className="mt-6 max-w-[46ch] font-mono text-xs uppercase tracking-[0.16em] text-graphite md:text-sm">
                    {state.sub}
                  </p>
                ) : null}

                {state.spec ? (
                  <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-graphite">
                    {state.spec}
                  </p>
                ) : null}

                {state.cta ? (
                  <a
                    href={state.cta.href}
                    className="cta mt-8 inline-flex items-center gap-2 bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-void"
                  >
                    {state.cta.label}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
