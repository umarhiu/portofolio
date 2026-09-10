import { WorkPortal } from "@/components/work/WorkPortal";
import { WorkRail } from "@/components/work/WorkRail";

/*
  The amber chapter: Selected Work entered through a portal.

  Composition only. WorkPortal is the vendored Glyph Portal configured for the
  site palette: the word WORK in the display face on the dark page, the amber
  field visible through the letters, and a scroll-driven camera into one
  letter's ink until the amber fills the viewport. WorkRail is what the flood
  reveals: the eyebrow with a live counter, the Selected work heading, and the
  six case files as big image-first cards on a horizontal rail that the page
  scroll drives sideways, one card per viewport, snapping card to card.

  Two written rules are knowingly suspended inside this chapter, both scoped
  to it and both recorded in docs/design.md: the accent is spread across a
  whole surface, and that surface carries a gradient. On the amber field only
  void ink is legible (vellum 2.33:1, graphite 1.31:1, void 6.79:1), which is
  why everything that lands on the amber here is void, and why
  --gp-foreground is void in WorkPortal.

  Selected by WORK_CHAPTER in lib/flags.ts. The original cinematic stays behind
  the other branch.
*/
export function WorkChapter() {
  return (
    <div className="work-chapter">
      <WorkPortal>
        <WorkRail />
      </WorkPortal>
    </div>
  );
}
