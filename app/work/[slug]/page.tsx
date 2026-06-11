import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/lib/content";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-static";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };
  return {
    title: project.title,
    description: `${project.context}. ${project.outcome}.`,
  };
}

const deepSpine = [
  "Context and constraints",
  "The problem, framed as a systems problem",
  "Decisions and tradeoffs",
  "Craft",
  "Outcome",
  "What I would change",
];

const briefSpine = ["Context", "One key decision", "Outcome"];

// Mock decision log shown on deep studies. Replaced with real decisions.
const decisionLog = [
  {
    decision: "Collapse three dashboards into one surface",
    why: "Users were tab-hopping to correlate signals",
    tradeoff: "Heavier first render, mitigated with progressive loading",
  },
  {
    decision: "One source of truth for the data model",
    why: "Conflicting counts eroded trust in the numbers",
    tradeoff: "A migration quarter before any visible UI win",
  },
  {
    decision: "Design every component state up front",
    why: "Empty and error states were where users got stuck",
    tradeoff: "Slower component delivery, far fewer support tickets",
  },
];

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const isDeep = project.depth === "DEEP DIVE";
  const spine = isDeep ? deepSpine : briefSpine;

  return (
    <>
      <Nav />
      <main id="main" className="px-4 pb-24 pt-28 sm:px-8 lg:px-20">
        <article className="mx-auto max-w-[760px]">
          <Link
            href="/#selected-work"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-graphite transition-colors duration-200 hover:text-vellum"
          >
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            All work
          </Link>

          <div className="mt-10 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className={isDeep ? "text-accent" : "text-graphite"}>
              {project.depth}
            </span>
            <span className="text-graphite">{project.type}</span>
          </div>

          <h1
            className="mt-5 font-display font-extrabold uppercase leading-[0.98] tracking-tight text-vellum"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              viewTransitionName: `title-${project.slug}`,
            }}
          >
            {project.title}
          </h1>

          <p className="mt-4 font-mono text-sm uppercase tracking-wider text-graphite">
            {project.context}
          </p>

          {project.study ? (
            <>
              <p
                className="mt-6 text-vellum/80"
                style={{ fontSize: "1.18rem", lineHeight: 1.65 }}
              >
                {project.study.lede}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 border-y border-hairline py-6 font-mono text-xs text-graphite">
                {[
                  ["Role", project.study.role],
                  ["Duration", project.study.duration],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="uppercase tracking-wider">{label}</dt>
                    <dd className="mt-1 text-vellum/80">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10">
                <div
                  className="tabular font-display font-extrabold leading-none text-vellum"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
                >
                  {project.study.metric.value}
                </div>
                <p className="mt-3 text-vellum/70">
                  {project.study.metric.label}
                </p>
                {project.mock ? (
                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-graphite">
                    Draft copy. The real flow and numbers (marked PLACEHOLDER)
                    land before launch.
                  </p>
                ) : null}
              </div>

              {project.study.loop ? (
                <section className="mt-14">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">
                    The loop
                  </p>
                  <p className="mt-2 text-vellum/70">
                    Four stages, my judgment gating each handoff. The tools are
                    leverage, not the designer.
                  </p>
                  <ol className="mt-8 divide-y divide-hairline border-y border-hairline">
                    {project.study.loop.map((stage, i) => (
                      <li
                        key={stage.step}
                        className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8"
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-sm text-accent">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-display text-lg font-bold uppercase tracking-tight text-vellum">
                            {stage.step}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-xs uppercase tracking-[0.18em] text-graphite">
                            {stage.tool}
                          </span>
                          <p className="mt-1 text-vellum/75">{stage.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              {project.study.comparison ? (
                <section className="mt-14">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">
                    The example
                  </p>
                  <p className="mt-2 text-vellum/70">
                    {project.study.comparison.flow}
                  </p>
                  <div className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
                    {[
                      project.study.comparison.conventional,
                      project.study.comparison.mine,
                    ].map((col, idx) => (
                      <div key={col.label} className="bg-void p-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={
                              "inline-block h-px w-8 " +
                              (idx === 1 ? "bg-accent" : "bg-graphite")
                            }
                            aria-hidden="true"
                          />
                          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-vellum">
                            {col.label}
                          </h2>
                        </div>
                        <ul className="mt-5 space-y-3 text-vellum/75">
                          {col.points.map((point) => (
                            <li key={point} className="leading-relaxed">
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {project.study.before && project.study.after ? (
                <section className="mt-14">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">
                    Before and after
                  </p>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {[
                      { label: "Before", src: project.study.before },
                      { label: "After", src: project.study.after },
                    ].map((shot) => (
                      <figure key={shot.label}>
                        <div
                          className="overflow-hidden border border-hairline bg-[rgba(236,231,221,0.02)]"
                          style={{ aspectRatio: "16 / 10" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={shot.src}
                            alt={`The widget ${shot.label.toLowerCase()} the redesign`}
                            className="h-full w-full object-cover object-top"
                            loading="lazy"
                          />
                        </div>
                        <figcaption className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-graphite">
                          {shot.label}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              ) : null}

              {project.study.prototypeUrl ? (
                <section className="mt-14">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">
                    The prototype
                  </p>
                  <p className="mt-2 text-vellum/70">
                    The widget built in Claude Code: clickable, running the real
                    logic. Open it live.
                  </p>
                  <a
                    href={project.study.prototypeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 border border-vellum/30 px-5 py-3 font-mono text-xs uppercase tracking-widest text-vellum transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-void"
                  >
                    Open the live prototype
                    <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                  </a>
                </section>
              ) : null}

              {project.study.gallery ? (
                <section className="mt-14 space-y-8">
                  {project.study.gallery.map((shot) => (
                    <figure key={shot.src}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={shot.src}
                        alt={shot.caption}
                        className="w-full border border-hairline bg-[rgba(236,231,221,0.02)]"
                        loading="lazy"
                      />
                      <figcaption className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-graphite">
                        {shot.caption}
                      </figcaption>
                    </figure>
                  ))}
                </section>
              ) : null}

              <div className="mt-14 space-y-12">
                {project.study.sections.map((section, i) => (
                  <Reveal key={section.heading} delay={Math.min(i * 0.05, 0.2)}>
                    <section>
                      <h2 className="font-display text-xl font-bold uppercase tracking-tight text-vellum">
                        {section.heading}
                      </h2>
                      {section.body.map((para) => (
                        <p
                          key={para}
                          className="mt-3 text-vellum/70"
                          style={{ fontSize: "1.18rem", lineHeight: 1.65 }}
                        >
                          {para}
                        </p>
                      ))}
                    </section>
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <>
              <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 border-y border-hairline py-6 font-mono text-xs text-graphite sm:grid-cols-4">
                {[
                  ["Role", "Lead product designer"],
                  ["Team", "Sample"],
                  ["Duration", "Sample"],
                  ["Outcome", project.outcome],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="uppercase tracking-wider">{label}</dt>
                    <dd className="mt-1 text-vellum/80">{value}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-10 font-mono text-xs uppercase tracking-[0.16em] text-graphite">
                Case study in progress. The reading structure is below; real
                narrative and artwork land before launch.
              </p>

              <div className="mt-10 space-y-12">
                {spine.map((heading, i) => (
                  <Reveal key={heading} delay={Math.min(i * 0.05, 0.2)}>
                    <section>
                      <h2 className="font-display text-xl font-bold uppercase tracking-tight text-vellum">
                        {heading}
                      </h2>
                      <p
                        className="mt-3 text-vellum/60"
                        style={{ fontSize: "1.18rem", lineHeight: 1.65 }}
                      >
                        Placeholder. This section will hold the real account of
                        the work, written to show the systems decision and the
                        craft that followed it.
                      </p>

                      {isDeep && heading === "Decisions and tradeoffs" ? (
                        <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
                          {decisionLog.map((d) => (
                            <li
                              key={d.decision}
                              className="grid gap-1 py-4 sm:grid-cols-[1.2fr_1fr] sm:gap-6"
                            >
                              <p className="text-vellum/85">{d.decision}</p>
                              <p className="font-mono text-xs leading-relaxed tracking-wide text-graphite">
                                {d.why}. Tradeoff: {d.tradeoff}.
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  </Reveal>
                ))}
              </div>
            </>
          )}

          <div className="mt-16 border-t border-hairline pt-8">
            <Link
              href="/#selected-work"
              className="font-mono text-xs uppercase tracking-widest text-graphite transition-colors duration-200 hover:text-vellum"
            >
              Next, back to all work
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
