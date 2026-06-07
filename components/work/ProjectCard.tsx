import { Link } from "next-view-transitions";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/content";

/*
  Single source of truth for a work-index card. Imported by BOTH the static
  SelectedWork grid (the SSR / mobile / reduced-motion fallback) and the
  desktop GSAP cinematic, so content, the view-transition name (title-{slug}),
  and the .work-card hover behaviour can never drift between the two.

  `compact` is the cinematic variant: a shorter, viewport-relative media box
  and tighter type so a 3x2 grid of six cards fits inside one 100dvh stage on
  laptop-height screens.
*/

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

export function ProjectCard({
  project,
  compact = false,
  className = "",
}: {
  project: Project;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      // Compact (cinematic) cards need an OPAQUE surface so that, stacked into
      // the deck, each card occludes the ones beneath instead of letting their
      // text bleed through. A faint vellum-on-void elevation + soft shadow give
      // the pile depth. The static grid keeps its near-transparent minimalism.
      style={
        compact
          ? {
              backgroundColor:
                "color-mix(in srgb, var(--color-vellum) 6%, var(--color-void))",
              boxShadow: "0 24px 50px -28px rgba(0, 0, 0, 0.8)",
            }
          : undefined
      }
      className={
        "work-card group block border border-hairline " +
        (compact ? "p-5 " : "bg-[rgba(236,231,221,0.02)] p-6 ") +
        className
      }
    >
      <div
        className={
          "flex items-center justify-center border border-hairline bg-[rgba(236,231,221,0.02)] " +
          (compact ? "mb-4 h-[clamp(72px,11vh,140px)]" : "mb-6 aspect-[16/10]")
        }
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
          {project.type}
        </span>
      </div>

      <div className={(compact ? "mb-2 " : "mb-3 ") + "flex items-center justify-between gap-4"}>
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
          fontSize: compact
            ? "clamp(1rem, 1.3vw, 1.25rem)"
            : "clamp(1.25rem, 2vw, 1.6rem)",
          viewTransitionName: `title-${project.slug}`,
        }}
      >
        {project.title}
      </h3>
      <span
        className={(compact ? "mt-2 " : "mt-3 ") + "work-card__rule block h-px w-12 bg-accent"}
        aria-hidden="true"
      />
      <p className={(compact ? "mt-2 " : "mt-3 ") + "font-mono text-xs uppercase tracking-wider text-graphite"}>
        {project.context}
      </p>
      <p
        className={
          (compact ? "mt-2 line-clamp-2 text-sm " : "mt-4 ") + "text-vellum/80"
        }
      >
        {project.outcome}
      </p>
    </Link>
  );
}
