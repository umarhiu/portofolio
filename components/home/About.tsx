import { about, site } from "@/lib/content";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-20 border-t border-hairline px-4 py-24 sm:px-8 lg:px-20 lg:py-32"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
        <div>
          <h2
            id="about-heading"
            className="font-display font-extrabold uppercase tracking-tight text-vellum"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
          >
            About
          </h2>
          <p
            className="mt-8 max-w-[58ch] leading-relaxed text-vellum/85"
            style={{ fontSize: "1.18rem", lineHeight: 1.65 }}
          >
            {about.body}
          </p>
        </div>

        {/* Portrait placeholder, treated as a layered panel (Z-parallax in a later phase). */}
        <div className="lg:pt-2">
          <div className="aspect-[4/5] w-full border border-hairline bg-[rgba(236,231,221,0.02)]">
            <div className="flex h-full items-end p-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
                Portrait. {site.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
