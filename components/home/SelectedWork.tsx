"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { projects, projectTypes, type Project, type ProjectType } from "@/lib/content";
import { ProjectCard } from "@/components/work/ProjectCard";

/*
  The static, fully-accessible work index. This is the SSR / mobile / no-JS /
  reduced-motion experience and the fallback the desktop cinematic replaces.
  When the capable-desktop island mounts, WorkEnhancer sets data-work and CSS
  hides this subtree (.work-static), exactly as the WebGL hero hides
  .hero-static. The owning <section id="selected-work"> lives in WorkSection.
*/

type Filter = "All" | ProjectType;
const FILTERS: Filter[] = ["All", ...projectTypes];

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
    <div className="work-static px-4 py-24 sm:px-8 lg:px-20 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
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
    </div>
  );
}
