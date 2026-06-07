import { SelectedWork } from "@/components/home/SelectedWork";
import { WorkEnhancer } from "@/components/home/WorkEnhancer";

/*
  Server wrapper for the work index. Owns the #selected-work anchor (targeted by
  Nav, the layout skip-link, and the hero CTA) and the section chrome, so the
  static fallback and the cinematic never carry duplicate ids. The static grid
  renders for first paint and every fallback path; WorkEnhancer mounts the
  desktop cinematic on top and hides the static one (same pattern as Hero).
*/
export function WorkSection() {
  return (
    <section
      id="selected-work"
      aria-label="Selected work"
      className="relative scroll-mt-20 border-t border-hairline"
    >
      <SelectedWork />
      <WorkEnhancer />
    </section>
  );
}
