import type { Project } from "@/lib/content";

/*
  Wide card used ONLY during the cinematic's sticky-stacking phase: media on the
  left, text on the right. It is decorative (aria-hidden) and carries no link or
  viewTransitionName -- the interactive, navigable cards are the grid
  (ProjectCard) at the finale, so we avoid duplicate view-transition names and
  duplicate links. Opaque surface + shadow so stacked cards occlude cleanly.
*/
export function HorizontalCard({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const num = String(index + 1).padStart(2, "0");
  const tot = String(total).padStart(2, "0");
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full overflow-hidden border border-hairline"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-vellum) 6%, var(--color-void))",
        boxShadow: "0 30px 60px -30px rgba(0, 0, 0, 0.85)",
      }}
    >
      {/* Media (left) */}
      <div className="relative flex w-1/2 items-center justify-center border-r border-hairline bg-[rgba(236,231,221,0.02)]">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-graphite">
          {project.type}
        </span>
      </div>

      {/* Text (right) */}
      <div className="flex w-1/2 flex-col justify-center p-8 lg:p-12">
        <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.18em]">
          <span className="text-accent">
            {num} / {tot}
          </span>
          {/* One amber accent per card: the index. Depth stays graphite here
              (its DEEP DIVE / BRIEF wording carries the distinction). */}
          <span className="text-graphite">{project.depth}</span>
        </div>
        <div
          className="mt-5 font-display font-extrabold uppercase leading-[1] tracking-tight text-vellum"
          style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.9rem)" }}
        >
          {project.title}
        </div>
        <p
          className="mt-4 max-w-[42ch] text-vellum/70"
          style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.15rem)" }}
        >
          {project.outcome}.
        </p>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-graphite">
          {project.context}
        </p>
      </div>
    </div>
  );
}
