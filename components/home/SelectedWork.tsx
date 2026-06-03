"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import {
  projects,
  projectTypes,
  type Project,
  type ProjectType,
} from "@/lib/content";

type Filter = "All" | ProjectType;
const FILTERS: Filter[] = ["All", ...projectTypes];

function DepthBadge({ depth }: { depth: Project["depth"] }) {
  const isDeep = depth === "DEEP DIVE";
  return (
    <span
      className={
        "font-mono text-[10px] uppercase tracking-[0.18em] " +
        (isDeep ? "text-accent" : "text-graphite")
      }
    >
      {depth}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="work-card group block border border-hairline bg-[rgba(236,231,221,0.02)] p-6"
    >
      <div className="mb-6 flex aspect-[16/10] items-center justify-center border border-hairline bg-[rgba(236,231,221,0.02)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
          {project.type}
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between gap-4">
        <DepthBadge depth={project.depth} />
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          className="text-graphite transition-colors duration-200 group-hover:text-vellum"
          aria-hidden="true"
        />
      </div>

      <h3
        className="font-display font-bold uppercase leading-tight tracking-tight text-vellum"
        style={{
          fontSize: "clamp(1.25rem, 2vw, 1.6rem)",
          viewTransitionName: `title-${project.slug}`,
        }}
      >
        {project.title}
      </h3>
      <span className="work-card__rule mt-3 block h-px w-12 bg-accent" aria-hidden="true" />
      <p className="mt-3 font-mono text-xs uppercase tracking-wider text-graphite">
        {project.context}
      </p>
      <p className="mt-4 text-vellum/80">{project.outcome}</p>
    </Link>
  );
}

export function SelectedWork() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("All");

  const matches = (p: Project) => filter === "All" || p.type === filter;
  // Matches first (advance), non-matches after (recede). Motion `layout`
  // animates the reposition, echoing the hero's layer re-sort.
  const ordered = [...projects].sort(
    (a, b) => Number(matches(b)) - Number(matches(a)),
  );

  return (
    <section
      id="selected-work"
      aria-labelledby="work-heading"
      className="scroll-mt-20 border-t border-hairline px-4 py-24 sm:px-8 lg:px-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            id="work-heading"
            className="font-display font-extrabold uppercase tracking-tight text-vellum"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
          >
            Selected work
          </h2>
          <div
            role="group"
            aria-label="Filter work by type"
            className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.16em]"
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={
                  "relative cursor-pointer pb-1 transition-colors duration-200 " +
                  (filter === f ? "text-vellum" : "text-graphite hover:text-vellum")
                }
              >
                {f}
                {filter === f ? (
                  <motion.span
                    layoutId="filter-underline"
                    className="absolute inset-x-0 bottom-0 h-px bg-accent"
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-graphite">
          Placeholder projects. Real case studies in progress.
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ordered.map((project) => {
            const on = matches(project);
            return (
              <motion.li
                key={project.slug}
                layout={!reduce}
                inert={!on}
                animate={{ opacity: on ? 1 : 0.25, scale: on ? 1 : 0.97 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <ProjectCard project={project} />
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
