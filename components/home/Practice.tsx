import { practice } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

/*
  The page's one allowed three-column moment: the trio of claims the whole
  site exists to prove. Title in display, body in serif.
*/
export function Practice() {
  return (
    <section
      id="practice"
      aria-labelledby="practice-heading"
      className="scroll-mt-20 border-t border-hairline px-4 py-24 sm:px-8 lg:px-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <h2
          id="practice-heading"
          className="font-display font-extrabold uppercase tracking-tight text-vellum"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
        >
          Practice
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {practice.map((pillar, i) => (
            <Reveal
              key={pillar.key}
              delay={i * 0.07}
              className="border-t border-hairline pt-6"
            >
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-vellum">
                {pillar.title}
              </h3>
              <p className="mt-4 max-w-[40ch] leading-relaxed text-vellum/75">
                {pillar.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
