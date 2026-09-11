import { WorkRail } from "@/components/work/WorkRail";
import { WorkScrollCue } from "@/components/work/WorkScrollCue";

/*
  The violet chapter: Selected Work entered through a portal.

  Composition only. Positioning's inline StatementPortal now owns the doorway:
  the actual Mine run. letterforms open until violet fills the viewport.
  There is no second WORK opening. WorkRail is what the flood
  reveals: the eyebrow with a live counter, the Selected work heading, and the
  six case files as big image-first cards on a horizontal rail that the page
  scroll drives sideways, one card per viewport, snapping card to card.

  Two written rules are knowingly suspended inside this chapter, both scoped
  to it and both recorded in docs/design.md: the accent is spread across a
  whole surface, and that surface carries a gradient. The ink runs the other
  way from the old amber field: on violet, white is 5.62:1 and black only
  3.74:1, under the body floor, so everything that lands on this field is
  white, and --gp-foreground is on-violet in WorkPortal. The field darkens
  toward violet-deep at its base (white 9.20:1), so the top of the gradient
  is the binding case. Nothing here is dimmed: opacity tiers exist to stop
  halation at 21:1 on the black page, and 5.62:1 has no halation to stop.

  Selected by WORK_CHAPTER in lib/flags.ts. The original cinematic stays behind
  the other branch.
*/
export function WorkChapter() {
  return (
    <div className="work-chapter">
      <WorkScrollCue />
      <WorkRail />
    </div>
  );
}
