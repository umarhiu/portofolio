import { Link } from "next-view-transitions";
import { nav, site } from "@/lib/content";

/*
  Single-line nav, height under 72px. Wordmark plus four anchors and nothing
  else (no availability pill, no status dot) so the first viewport keeps its
  one-accent discipline for later hero work.
*/
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-hairline/60 bg-void/80 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-8"
      >
        <a
          href="#main"
          className="font-display text-lg font-extrabold uppercase tracking-tight text-vellum"
        >
          {site.name}
        </a>
        <ul className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-graphite sm:gap-8">
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
