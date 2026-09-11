# Portfolio palette

Four colours. Nothing else is a hue: every other value in the system is one of
these four at some alpha.

| | Hex | Role |
|---|---|---|
| Black | `#000000` | The page, and every dark object on a light surface. |
| White | `#FFFFFF` | Ink on black and on violet, and the hero canvas. |
| Violet | `#7E3BED` | Surface and structure. The controller shell, the work chapter field. Never a highlight. |
| Lime | `#C6FF34` | The one signal colour. Accents, the active state, focus on dark. Never on white. |

`app/globals.css` (`@theme`) is the browser source of truth. `lib/tokens.ts`
mirrors the values for non-browser consumers, which today means only the
build-time OG image; it is not reactive, so a CSS change reaches the OG image
only after a rebuild.

## Contrast, measured

Computed from WCAG relative luminance: black 0, violet 0.1368, lime 0.8377,
white 1.0.

| Pair | Ratio | Verdict |
|---|---|---|
| white on black | 21.00 | maximum possible; halates over paragraphs |
| lime on black | 17.75 | body text, borders, focus |
| black on lime | 17.75 | body text |
| violet-deep `#5829A6` on white | 9.20 | body text |
| white on violet | 5.62 | body text |
| violet on white | 5.62 | body text |
| lime on violet | 4.75 | passes, but two saturated hues vibrate |
| black on violet | 3.74 | large text and non-text only |
| **lime on white** | **1.18** | **invisible** |

Two rules follow, and they are arithmetic rather than taste:

- **Lime never lands on paper.** At 1.18:1 it disappears. This is why the hero
  controller has a near-black faceplate instead of the ivory one it used to
  have: lime on that face is 13.94:1.
- **Violet is never the accent, and never a small object on black.** At 3.74:1
  it is under the body floor, and violet tints get *worse* as they darken
  toward the page (85% is 2.92:1, 40% is 1.43:1). It works full bleed and
  nowhere else.

## The ink ladder

Pure white on pure black is the highest contrast two colours can have, and it
halates over long text. So body copy is not pure white.

| Token | Value | On black | Use |
|---|---|---|---|
| `--color-vellum` | `#ffffff` | 21.00 | display headings only |
| `--color-ink-body` | `white / 87%` | 15.61 | all body copy |
| `--color-graphite` | `white / 60%` | 7.84 | eyebrows, captions, meta |
| (floor) | `white / 50%` | 5.32 | nothing dimmer may carry text |
| `--color-hairline` | `white / 24%` | 1.93 | decorative rules only |

`white / 45%` is 4.43:1 and fails, so 50% is a hard floor. A border that means
something (a boundary, a focus ring) owes 3:1, which the hairline does not
meet, so any meaningful boundary is lime or white at 40% and above.

## The violet chapter

The work chapter is a full-bleed violet field, and its ink budget is far
tighter than the black page: white is 5.62:1 here against 21:1 there, and
white/85 is already 4.51:1. So **nothing on the field is dimmed.** Opacity
tiers exist to stop halation at 21:1, and 5.62:1 has no halation to stop; the
hierarchy is carried by size and weight instead.

The field darkens toward `--color-chapter-deep` at its base, where white
reaches 9.20:1, so the top of the gradient is always the binding case. Badge
outlines are white/70 (3.53:1), not white/35 (1.90:1), because an outline is a
boundary and owes 3:1.

The covers keep a black mat. All six were authored for a dark surround and
several are saturated blue, which sits a short way round the wheel from violet
and vibrates against it.

## Focus

Focus is lime by default (17.75:1 on the page). On the white hero it flips to
black ink (21:1), and on the controller, a dark object sitting on that white
canvas, it flips again to lime (13.94:1 on the faceplate; black would be
invisible there and violet only 2.90:1).

## The cursor

The fluid cursor is white under `mix-blend-mode: exclusion`, which inverts its
backdrop and so resolves to 21:1 over both the black page and the white hero.
The violet chapter is the case the blend cannot serve: exclusion renders the
ring `#81C412` there, 2.63:1 against the field. The engine flags those surfaces
as `html[data-cursor-surface="violet"]` and the blend stands down, leaving a
plain white cursor at 5.62:1.

## Imagery

Project screenshots keep their own colours; they are the work. Props are not:
the hero mockups' orange cases and the laptop sticker were drained to neutral
when orange left the palette, and the two covers carrying a near-miss lime
(`#B8E818` and `#C4DC04`, 35 and 37 RGB units off) were pinned to `#C6FF34`,
because a near-miss reads as a mistake rather than as a second colour.
