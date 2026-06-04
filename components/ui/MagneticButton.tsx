import { ArrowRight } from "lucide-react";

/*
  Primary CTA. A periodic light glint (see .cta-sheen in globals.css) and an
  arrow that slides right on hover. Press feedback comes from the shared .cta
  class on the caller. No cursor-following (magnetic) behavior.
*/
export function MagneticButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group relative overflow-hidden ${className ?? ""}`}
    >
      {/* periodic light glint */}
      <span aria-hidden className="cta-sheen pointer-events-none absolute inset-0" />
      <span className="relative z-[1] inline-flex items-center gap-2">
        <span className="nav-flip">
          <span className="nav-flip__inner">
            <span className="nav-flip__face nav-flip__face--front">{children}</span>
            <span aria-hidden className="nav-flip__face nav-flip__face--back">
              {children}
            </span>
          </span>
        </span>
        <ArrowRight
          aria-hidden
          size={16}
          strokeWidth={2.25}
          className="transition-transform duration-200 ease-out group-hover:translate-x-1"
        />
      </span>
    </a>
  );
}
