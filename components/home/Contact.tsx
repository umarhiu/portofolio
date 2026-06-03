import { site } from "@/lib/content";
import { MagneticButton } from "@/components/ui/MagneticButton";

/*
  One contact intent only. The single amber primary action lives here; the
  hero State-05 CTA ("View the case files") is a portfolio intent, so the two
  do not collide.
*/
export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-20 border-t border-hairline px-4 py-28 sm:px-8 lg:px-20 lg:py-40"
    >
      <div className="mx-auto max-w-[1400px]">
        <h2
          id="contact-heading"
          className="max-w-[16ch] font-display font-extrabold uppercase leading-[0.98] tracking-tight text-vellum"
          style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
        >
          Have a system worth untangling?
        </h2>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
          <MagneticButton
            href={`mailto:${site.email}`}
            className="cta inline-flex w-fit items-center gap-2 bg-accent px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-void"
          >
            Start a conversation
          </MagneticButton>
          <a
            href={`mailto:${site.email}`}
            className="font-mono text-sm tracking-wide text-graphite transition-colors hover:text-vellum"
          >
            {site.email}
          </a>
        </div>

        <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-graphite">
          {site.availability}
        </p>
      </div>
    </section>
  );
}
