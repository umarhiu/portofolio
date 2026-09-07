import { Link } from "next-view-transitions";
import { nav, site } from "@/lib/content";

/*
  Single-line nav, height under 72px. Wordmark plus four anchors and nothing
  else (no availability pill, no status dot) so the first viewport keeps its
  one-accent discipline for later hero work.

  The bar is near-solid (void/95) rather than /80: over the white hero an 80%
  scrim composited to a washed #3c3d40, mismatching the ink-black sections
  above and below it. Over the dark rest of the site this is identical.
*/
export function Nav({ initialTheme = "dark" }: { initialTheme?: "light" | "dark" }) {
  return (
    <header data-initial-theme={initialTheme} className="site-nav fixed inset-x-0 top-0 z-40 border-b border-hairline/60 bg-void/95 backdrop-blur-sm transition-colors duration-200">
      <nav
        data-hero-enter={initialTheme === "light" ? "nav" : undefined}
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-8"
      >
        {/* Tightened below sm so all four links + wordmark clear a 360px
            viewport without colliding (same content, smaller type/gaps). */}
        <a
          href="#main"
          className="site-nav__mark font-display text-base font-extrabold uppercase tracking-tight text-vellum sm:text-lg"
        >
          {site.name}
        </a>
        <ul className="flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-graphite sm:gap-8 sm:text-xs sm:tracking-widest">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="nav-flip transition-colors duration-200 hover:text-vellum"
              >
                <span className="nav-flip__inner">
                  <span className="nav-flip__face nav-flip__face--front">
                    {item.label}
                  </span>
                  <span aria-hidden className="nav-flip__face nav-flip__face--back">
                    {item.label}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
