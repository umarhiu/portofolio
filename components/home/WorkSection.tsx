import { SelectedWork } from "@/components/home/SelectedWork";
import { WorkEnhancer } from "@/components/home/WorkEnhancer";
import { WorkChapter } from "@/components/work/WorkChapter";
import { WORK_CHAPTER } from "@/lib/flags";

/*
  Server wrapper for the work index. Owns the #selected-work anchor (targeted by
  Nav, the hero CTA, and both case-study back-links) and the section chrome, so
  no implementation carries a duplicate id.

  WORK_CHAPTER (lib/flags.ts) picks the implementation, and this is a real
  branch rather than a CSS hide: every implementation renders each project with
  the same view-transition-name (title-{slug}), and duplicate active names break
  the page transition. Only one may be in the tree.

  Flipping the flag does not move GSAP: the cinematic is already behind
  next/dynamic inside WorkEnhancer, and a module-scope dynamic() only creates
  the lazy wrapper. The static grid's own code does stay in the bundle either
  way, which is a few kB and buys a one-line flag flip.

  z-index 1 is load-bearing. .statement (Positioning) is also z-index 1 and
  comes earlier in the DOM, so an equal index lets this section paint above it
  where the two overlap at the handoff. Without it this section is z-index auto
  and the releasing statement covers the top of the chapter.
*/
export function WorkSection() {
  return (
    <section
      id="selected-work"
      aria-label="Selected work"
      data-work-mode={WORK_CHAPTER}
      className="relative z-[1] scroll-mt-20 border-t border-hairline"
    >
      {WORK_CHAPTER === "chapter" ? (
        <WorkChapter />
      ) : (
        <>
          <SelectedWork />
          <WorkEnhancer />
        </>
      )}
    </section>
  );
}
