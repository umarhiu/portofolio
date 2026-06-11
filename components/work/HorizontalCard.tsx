import { type FocusEvent } from "react";
import { Link } from "next-view-transitions";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/content";

/*
  Wide card for the cinematic's sticky scroll-stack: media on the left, text on
  the right. Each card is a real link to its case file (/work/[slug]); the
  cinematic flags the front card data-active on its wrapper, and globals.css
  reveals the "View case file" CTA + the hover lift only on that active card.

  Carries the title-{slug} view-transition name. No duplicate-name clash with the
  fallback grids because the stack and the grids are never display-rendered at the
  same time (the cinematic display:none-toggles per reduced-motion mode, and the
  static grid is display:none whenever data-work=cinematic).
*/
export function HorizontalCard({
  project,
  index,
  total,
  href,
  onFocus,
}: {
  project: Project;
  index: number;
  total: number;
  href: string;
  onFocus?: (e: FocusEvent<HTMLAnchorElement>) => void;
}) {
  const num = String(index + 1).padStart(2, "0");
  const tot = String(total).padStart(2, "0");
  return (
    <Link
      href={href}
      onFocus={onFocus}
      className="hcard__link flex h-full w-full overflow-hidden border border-hairline"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-vellum) 6%, var(--color-void))",
        boxShadow: "0 30px 60px -30px rgba(0, 0, 0, 0.85)",
      }}
    >
      {/* Media (left): the cover image if set, else the type label. */}
      <div className="relative w-1/2 overflow-hidden border-r border-hairline bg-[rgba(236,231,221,0.02)]">
        {project.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-graphite">
              {project.type}
            </span>
          </div>
        )}
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
          style={{
            fontSize: "clamp(1.6rem, 2.8vw, 2.9rem)",
            viewTransitionName: `title-${project.slug}`,
          }}
        >
          {project.title}
        </div>
        <p
          className="mt-4 max-w-[42ch] text-vellum/70"
          style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.15rem)" }}
        >
          {project.outcome}.
        </p>
        {project.stack ? (
          <div className="mt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-graphite">
              {project.stackLabel ?? "Stack"}
            </span>
            <p className="mt-1 font-mono text-[13px] uppercase tracking-[0.16em] text-vellum/85">
              {project.stack.join("  /  ")}
            </p>
          </div>
        ) : null}
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-graphite">
          {project.context}
        </p>
        {/* Click cue: revealed by globals.css only on the active (front) card,
            fills amber on hover. The whole card is the link; this is the prompt. */}
        <span className="hcard__cta mt-7 inline-flex w-fit items-center gap-2 border border-vellum/30 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-vellum">
          View case file
          <ArrowUpRight className="hcard__arrow" size={14} strokeWidth={1.5} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
