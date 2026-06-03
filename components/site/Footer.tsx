import { Link } from "next-view-transitions";
import { nav, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-hairline px-4 py-14 sm:px-8 lg:px-20">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <a
            href="#main"
            className="font-display text-lg font-extrabold uppercase tracking-tight text-vellum"
          >
            {site.name}
          </a>
          <p className="mt-4 max-w-[44ch] font-mono text-[11px] leading-relaxed tracking-wide text-graphite">
            {site.colophon}
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-16">
          <ul className="space-y-2 font-mono text-xs uppercase tracking-widest text-graphite">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors duration-200 hover:text-vellum"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="space-y-2 font-mono text-xs uppercase tracking-widest text-graphite">
            <a
              href={`mailto:${site.email}`}
              className="block transition-colors hover:text-vellum"
            >
              {site.email}
            </a>
            <p>Last updated {site.lastUpdated}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
