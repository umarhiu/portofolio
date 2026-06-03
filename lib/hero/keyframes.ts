/**
 * The delamination model. Five snap states, five physical layers. Each state
 * defines every layer's transform; the scene interpolates between adjacent
 * states by scroll progress.
 *
 * Plane order (back to front when assembled):
 *   0 foundation, 1 data, 2 components, 3 overlay, 4 cursor
 *
 * States map 1:1 to the hero headlines:
 *   0 assembled, 1 foundation, 2 data, 3 components, 4 reconverge
 *
 * Angles are radians. 12deg ~= 0.209, 18deg ~= 0.314.
 */
export interface PlaneTransform {
  z: number;
  rx: number;
  ry: number;
  scale: number;
  opacity: number;
}

const DEG12 = 0.209;
const DEG18 = 0.314;

// Assembled: a clean composed UI. Grid is a faint substrate, the modal overlay
// is hidden (it only appears during the components state), cursor hidden.
const ASSEMBLED: PlaneTransform[] = [
  { z: -0.3, rx: 0, ry: 0, scale: 1, opacity: 0.3 }, // foundation (faint grid)
  { z: -0.15, rx: 0, ry: 0, scale: 1, opacity: 1 }, // data
  { z: 0.0, rx: 0, ry: 0, scale: 1, opacity: 1 }, // components
  { z: 0.15, rx: 0, ry: 0, scale: 1, opacity: 0 }, // overlay (modal hidden here)
  { z: 0.3, rx: 0, ry: 0, scale: 1, opacity: 0 }, // cursor hidden at start
];

const FOUNDATION: PlaneTransform[] = [
  { z: 1.0, rx: 0, ry: DEG12, scale: 1.05, opacity: 1 }, // foundation forward, tilt
  { z: -1.3, rx: 0, ry: 0, scale: 0.96, opacity: 0.26 },
  { z: -1.9, rx: 0, ry: 0, scale: 0.94, opacity: 0.2 },
  { z: -2.5, rx: 0, ry: 0, scale: 0.92, opacity: 0 }, // overlay hidden
  { z: -2.7, rx: 0, ry: 0, scale: 0.9, opacity: 0 },
];

const DATA: PlaneTransform[] = [
  { z: -1.4, rx: 0, ry: 0, scale: 0.95, opacity: 0.26 },
  { z: 1.0, rx: 0, ry: DEG18, scale: 1.05, opacity: 1 }, // data forward, stronger tilt
  { z: -0.9, rx: 0, ry: 0, scale: 0.97, opacity: 0.38 }, // components visible behind for the wiring
  { z: -2.2, rx: 0, ry: 0, scale: 0.92, opacity: 0 }, // overlay hidden
  { z: -2.6, rx: 0, ry: 0, scale: 0.9, opacity: 0 },
];

const COMPONENTS: PlaneTransform[] = [
  { z: -2.0, rx: 0, ry: 0, scale: 0.92, opacity: 0.16 },
  { z: -1.4, rx: 0, ry: 0, scale: 0.95, opacity: 0.22 },
  { z: 1.0, rx: 0, ry: DEG12 * 0.5, scale: 1.12, opacity: 1 }, // components fill focus
  { z: 0.4, rx: 0, ry: 0, scale: 1.04, opacity: 0.7 }, // overlay (modal) slides in only here
  { z: -2.4, rx: 0, ry: 0, scale: 0.9, opacity: 0 },
];

// Reconverge: the finished product. Faint grid, data + components composed,
// modal gone, cursor on top.
const RECONVERGE: PlaneTransform[] = [
  { z: -0.3, rx: 0, ry: 0, scale: 1, opacity: 0.35 },
  { z: -0.15, rx: 0, ry: 0, scale: 1, opacity: 1 },
  { z: 0.0, rx: 0, ry: 0, scale: 1, opacity: 1 },
  { z: 0.15, rx: 0, ry: 0, scale: 1, opacity: 0 }, // overlay hidden
  { z: 0.34, rx: 0, ry: 0, scale: 1, opacity: 1 }, // cursor lands on top
];

export const KEYFRAMES: PlaneTransform[][] = [
  ASSEMBLED,
  FOUNDATION,
  DATA,
  COMPONENTS,
  RECONVERGE,
];

export const PLANE_COUNT = 5;
export const STATE_COUNT = 5;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Smoothstep so each segment settles rather than moving linearly.
const ease = (t: number) => t * t * (3 - 2 * t);

/** Interpolated transform for one plane at a given global progress (0..1). */
export function keyframeAt(planeIndex: number, progress: number): PlaneTransform {
  const seg = clamp(progress * (STATE_COUNT - 1), 0, STATE_COUNT - 1);
  const i = Math.min(Math.floor(seg), STATE_COUNT - 2);
  const t = ease(seg - i);
  const a = KEYFRAMES[i][planeIndex];
  const b = KEYFRAMES[i + 1][planeIndex];
  return {
    z: lerp(a.z, b.z, t),
    rx: lerp(a.rx, b.rx, t),
    ry: lerp(a.ry, b.ry, t),
    scale: lerp(a.scale, b.scale, t),
    opacity: lerp(a.opacity, b.opacity, t),
  };
}
