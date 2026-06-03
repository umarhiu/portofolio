import type { LayerKind } from "@/lib/content";

/*
  PLACEHOLDER layer art for Phase 2.

  In Phase 3 each of these is replaced by a real React interface component that
  gets screenshotted at build time and baked into a CanvasTexture. For now they
  are tasteful SVG stand-ins that establish the palette and composition and
  serve as the static fallback stills. All are decorative (aria-hidden); the
  hero headline copy carries the meaning. Colors come from the CSS tokens via
  inline vars so there is zero palette drift.
*/

const VOID = "var(--color-void)";
const VELLUM = "var(--color-vellum)";
const GRAPHITE = "var(--color-graphite)";
const HAIRLINE = "var(--color-hairline)";
const ACCENT = "var(--color-accent)";
const DRAFTING = "var(--color-drafting)";
const GLASS = "rgba(236, 231, 221, 0.04)";

type ArtProps = { className?: string };

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 480 300"
      width="100%"
      height="100%"
      role="presentation"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <rect
        x="0.5"
        y="0.5"
        width="479"
        height="299"
        fill={GLASS}
        stroke={HAIRLINE}
        strokeWidth="1"
      />
      {children}
    </svg>
  );
}

export function AssembledStill({ className }: ArtProps) {
  return (
    <div className={className}>
      <Frame>
        {/* top bar */}
        <line x1="0" y1="40" x2="480" y2="40" stroke={HAIRLINE} />
        <rect x="20" y="18" width="92" height="8" fill={VELLUM} opacity="0.8" />
        <rect x="392" y="16" width="68" height="12" fill={GLASS} stroke={HAIRLINE} />
        {/* sidebar */}
        <line x1="120" y1="40" x2="120" y2="300" stroke={HAIRLINE} />
        {[64, 88, 112, 136].map((y) => (
          <rect key={y} x="20" y={y} width="78" height="6" fill={GRAPHITE} opacity="0.7" />
        ))}
        {/* chart block */}
        <rect x="140" y="60" width="200" height="92" fill={GLASS} stroke={HAIRLINE} />
        <polyline
          points="150,140 180,120 210,128 240,96 270,108 300,80 330,92"
          fill="none"
          stroke={VELLUM}
          strokeWidth="1.5"
          opacity="0.85"
        />
        {/* metric tile with the one accent */}
        <rect x="356" y="60" width="104" height="92" fill={GLASS} stroke={HAIRLINE} />
        <rect x="368" y="78" width="40" height="14" fill={ACCENT} />
        <rect x="368" y="104" width="78" height="6" fill={GRAPHITE} opacity="0.7" />
        {/* data rows */}
        {[176, 200, 224, 248, 272].map((y) => (
          <line key={y} x1="140" y1={y} x2="460" y2={y} stroke={HAIRLINE} />
        ))}
      </Frame>
    </div>
  );
}

export function FoundationLayer({ className }: ArtProps) {
  const cols = Array.from({ length: 11 }, (_, i) => 20 + i * 44);
  const rows = Array.from({ length: 7 }, (_, i) => 28 + i * 40);
  return (
    <div className={className}>
      <Frame>
        {cols.map((x) => (
          <line key={`c${x}`} x1={x} y1="16" x2={x} y2="284" stroke={DRAFTING} strokeWidth="1" opacity="0.5" />
        ))}
        {rows.map((y) => (
          <line key={`r${y}`} x1="16" y1={y} x2="464" y2={y} stroke={DRAFTING} strokeWidth="1" opacity="0.35" />
        ))}
        {/* 8px column emphasis */}
        <rect x="20" y="16" width="44" height="268" fill={DRAFTING} opacity="0.12" />
        <rect x="416" y="16" width="44" height="268" fill={DRAFTING} opacity="0.12" />
      </Frame>
    </div>
  );
}

export function DataLayer({ className }: ArtProps) {
  const rows = [56, 88, 120, 152, 184, 216, 248];
  return (
    <div className={className}>
      <Frame>
        <rect x="20" y="20" width="120" height="8" fill={VELLUM} opacity="0.8" />
        {rows.map((y, i) => {
          const live = i === 1 || i === 4;
          return (
            <g key={y}>
              <rect x="20" y={y} width="440" height="22" fill={GLASS} stroke={HAIRLINE} />
              <rect x="32" y={y + 8} width="120" height="6" fill={GRAPHITE} opacity="0.75" />
              <rect x="200" y={y + 8} width="80" height="6" fill={GRAPHITE} opacity="0.55" />
              {live ? <rect x="436" y={y + 6} width="10" height="10" fill={ACCENT} /> : null}
            </g>
          );
        })}
      </Frame>
    </div>
  );
}

export function ComponentsLayer({ className }: ArtProps) {
  const tiles = [
    { x: 20, label: "default", active: false },
    { x: 132, label: "hover", active: false },
    { x: 244, label: "loading", active: true },
    { x: 356, label: "error", active: false },
  ];
  return (
    <div className={className}>
      <Frame>
        {tiles.map((t) => (
          <g key={t.x}>
            <rect
              x={t.x}
              y="60"
              width="92"
              height="64"
              fill={GLASS}
              stroke={t.active ? ACCENT : HAIRLINE}
              strokeWidth={t.active ? "2" : "1"}
            />
            <rect x={t.x + 14} y="80" width="52" height="16" fill={t.active ? ACCENT : VELLUM} opacity={t.active ? "1" : "0.85"} />
            <rect x={t.x + 14} y="104" width="40" height="6" fill={GRAPHITE} opacity="0.7" />
          </g>
        ))}
        {/* a second row of state chips */}
        {[20, 132, 244, 356].map((x) => (
          <rect key={`b${x}`} x={x} y="156" width="92" height="64" fill={GLASS} stroke={HAIRLINE} />
        ))}
      </Frame>
    </div>
  );
}

export function ReconvergeStill({ className }: ArtProps) {
  return (
    <div className={className}>
      <Frame>
        {/* same composed product as Assembled, now with a live focus ring + cursor */}
        <line x1="0" y1="40" x2="480" y2="40" stroke={HAIRLINE} />
        <rect x="20" y="18" width="92" height="8" fill={VELLUM} opacity="0.8" />
        <line x1="120" y1="40" x2="120" y2="300" stroke={HAIRLINE} />
        <rect x="140" y="60" width="200" height="92" fill={GLASS} stroke={HAIRLINE} />
        <polyline
          points="150,140 180,120 210,128 240,96 270,108 300,80 330,92"
          fill="none"
          stroke={VELLUM}
          strokeWidth="1.5"
          opacity="0.85"
        />
        {/* primary button with amber focus ring */}
        <rect x="356" y="96" width="104" height="32" fill={GLASS} stroke={ACCENT} strokeWidth="2" />
        <rect x="372" y="108" width="56" height="8" fill={VELLUM} opacity="0.9" />
        {/* cursor */}
        <path d="M392 120 L392 146 L399 139 L405 151 L410 149 L404 137 L413 137 Z" fill={VELLUM} stroke={VOID} strokeWidth="1" />
      </Frame>
    </div>
  );
}

export function LayerArt({ kind, className }: { kind: LayerKind; className?: string }) {
  switch (kind) {
    case "foundation":
      return <FoundationLayer className={className} />;
    case "data":
      return <DataLayer className={className} />;
    case "components":
      return <ComponentsLayer className={className} />;
    case "reconverge":
      return <ReconvergeStill className={className} />;
    case "assembled":
    default:
      return <AssembledStill className={className} />;
  }
}
