import { proofMetrics } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

/*
  Outcomes as breathing data in plain layout, no card boxes, no filled
  progress tracks. Numbers are sample placeholders and are labeled as such
  so nothing fake-precise reads as a verified result.
*/
export function ProofStrip() {
  return (
    <section aria-label="Outcomes" className="border-t border-hairline px-4 py-20 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-10 font-mono text-xs uppercase tracking-[0.18em] text-graphite">
          Sample outcomes, replaced with verified results
        </p>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {proofMetrics.map((metric, i) => (
            <Reveal key={metric.label} delay={i * 0.07}>
              <dt
                className="tabular font-display font-extrabold leading-none text-vellum"
                style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
              >
                {metric.value}
              </dt>
              <dd className="mt-3 max-w-[22ch] text-sm leading-snug text-vellum/70">
                {metric.label}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
