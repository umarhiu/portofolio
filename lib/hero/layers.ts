import { readToken } from "@/lib/cssvar";

/**
 * Draws each of the five physical hero layers onto a 2D canvas. Those canvases
 * become CanvasTextures on the planes. Content is drawn here in code for the
 * prototype; the spec's build-time Playwright export of real React layer
 * components is a fidelity upgrade that swaps in later behind this same
 * interface (the planes do not care how the canvas was painted).
 *
 * Backgrounds are transparent so the void shows between layers. Colors are
 * read from the live CSS tokens, so the scene never drifts from the DOM.
 */
export type PlaneLayer =
  | "foundation"
  | "data"
  | "components"
  | "overlay"
  | "cursor";

export const PLANE_LAYERS: PlaneLayer[] = [
  "foundation",
  "data",
  "components",
  "overlay",
  "cursor",
];

const W = 1024;
const H = 576;

function palette() {
  return {
    vellum: readToken("vellum"),
    graphite: readToken("graphite"),
    hairline: readToken("hairline"),
    accent: readToken("accent"),
    drafting: readToken("drafting"),
    glass: "rgba(236, 231, 221, 0.04)",
  };
}

function panel(ctx: CanvasRenderingContext2D, c: ReturnType<typeof palette>) {
  ctx.fillStyle = c.glass;
  ctx.fillRect(3, 3, W - 6, H - 6);
  ctx.strokeStyle = c.hairline;
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, W - 6, H - 6);
}

function drawFoundation(ctx: CanvasRenderingContext2D, c: ReturnType<typeof palette>) {
  panel(ctx, c);
  ctx.strokeStyle = c.drafting;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  for (let x = 48; x < W; x += 88) {
    ctx.beginPath();
    ctx.moveTo(x, 24);
    ctx.lineTo(x, H - 24);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.32;
  for (let y = 56; y < H; y += 80) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(W - 24, y);
    ctx.stroke();
  }
  // emphasis columns
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = c.drafting;
  ctx.fillRect(48, 24, 88, H - 48);
  ctx.fillRect(W - 136, 24, 88, H - 48);
  ctx.globalAlpha = 1;
}

function drawData(ctx: CanvasRenderingContext2D, c: ReturnType<typeof palette>) {
  panel(ctx, c);
  ctx.fillStyle = c.vellum;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(40, 40, 240, 16);
  ctx.globalAlpha = 1;

  const rows = [96, 156, 216, 276, 336, 396, 456];
  rows.forEach((y, i) => {
    const live = i === 1 || i === 4;
    ctx.fillStyle = c.glass;
    ctx.fillRect(40, y, W - 80, 44);
    ctx.strokeStyle = c.hairline;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, y, W - 80, 44);
    ctx.fillStyle = c.graphite;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(64, y + 18, 240, 10);
    ctx.globalAlpha = 0.55;
    ctx.fillRect(420, y + 18, 160, 10);
    ctx.globalAlpha = 1;
    if (live) {
      ctx.fillStyle = c.accent;
      ctx.fillRect(W - 78, y + 14, 18, 18);
    }
  });
}

function drawComponents(ctx: CanvasRenderingContext2D, c: ReturnType<typeof palette>) {
  panel(ctx, c);
  const tiles = [
    { x: 48, active: false },
    { x: 296, active: false },
    { x: 544, active: true },
    { x: 792, active: false },
  ];
  tiles.forEach((t) => {
    ctx.fillStyle = c.glass;
    ctx.fillRect(t.x, 120, 184, 128);
    ctx.strokeStyle = t.active ? c.accent : c.hairline;
    ctx.lineWidth = t.active ? 4 : 2;
    ctx.strokeRect(t.x, 120, 184, 128);
    ctx.fillStyle = t.active ? c.accent : c.vellum;
    ctx.globalAlpha = t.active ? 1 : 0.85;
    ctx.fillRect(t.x + 28, 160, 104, 30);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = c.graphite;
    ctx.fillRect(t.x + 28, 208, 80, 12);
    ctx.globalAlpha = 1;
  });
  // second row, empty state tiles
  [48, 296, 544, 792].forEach((x) => {
    ctx.fillStyle = c.glass;
    ctx.fillRect(x, 312, 184, 128);
    ctx.strokeStyle = c.hairline;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 312, 184, 128);
  });
}

function drawOverlay(ctx: CanvasRenderingContext2D, c: ReturnType<typeof palette>) {
  // mostly empty: a modal centered, a toast top-right
  const mw = 460;
  const mh = 280;
  const mx = (W - mw) / 2;
  const my = (H - mh) / 2;
  ctx.fillStyle = "rgba(11, 13, 16, 0.86)";
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = c.hairline;
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, mw, mh);
  ctx.fillStyle = c.vellum;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(mx + 32, my + 36, 200, 16);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = c.graphite;
  ctx.fillRect(mx + 32, my + 76, mw - 64, 10);
  ctx.fillRect(mx + 32, my + 100, mw - 120, 10);
  ctx.globalAlpha = 1;
  // primary + secondary buttons
  ctx.fillStyle = c.accent;
  ctx.fillRect(mx + mw - 168, my + mh - 64, 136, 40);
  ctx.strokeStyle = c.hairline;
  ctx.strokeRect(mx + 32, my + mh - 64, 120, 40);

  // toast
  ctx.fillStyle = "rgba(11, 13, 16, 0.9)";
  ctx.fillRect(W - 360, 40, 320, 72);
  ctx.strokeStyle = c.hairline;
  ctx.strokeRect(W - 360, 40, 320, 72);
  ctx.fillStyle = c.vellum;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(W - 332, 66, 180, 12);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = c.graphite;
  ctx.fillRect(W - 332, 88, 240, 8);
  ctx.globalAlpha = 1;
}

function drawCursor(ctx: CanvasRenderingContext2D, c: ReturnType<typeof palette>) {
  // transparent layer: a focus ring around a button area, plus a cursor glyph
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(W / 2 + 62, H / 2 + 56, 140, 44);

  const cx = W / 2 + 120;
  const cy = H / 2 + 96;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy + 34);
  ctx.lineTo(cx + 9, cy + 25);
  ctx.lineTo(cx + 17, cy + 41);
  ctx.lineTo(cx + 24, cy + 38);
  ctx.lineTo(cx + 16, cy + 22);
  ctx.lineTo(cx + 28, cy + 22);
  ctx.closePath();
  ctx.fillStyle = c.vellum;
  ctx.fill();
  ctx.strokeStyle = "rgba(11, 13, 16, 0.9)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

const DRAWERS: Record<PlaneLayer, (ctx: CanvasRenderingContext2D, c: ReturnType<typeof palette>) => void> = {
  foundation: drawFoundation,
  data: drawData,
  components: drawComponents,
  overlay: drawOverlay,
  cursor: drawCursor,
};

export function drawPlaneLayer(kind: PlaneLayer): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    DRAWERS[kind](ctx, palette());
  }
  return canvas;
}
