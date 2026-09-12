# Selected Work gallery

Six non-clickable project cards in a horizontal gallery, built from device
mockups in `public/images/featured-work/`. Each card is a white frame holding a
cover, a title and category chips. No arrow or link affordance is shown, and
the old `/work/[slug]` route is gone along with its sitemap entries. Historical
case-study content stays in Git and in `lib/content.ts` but nothing renders it.

## Behaviour

Native page scrolling drives horizontal translation continuously while the
stage is pinned. The centred card is full size and its neighbours sit at 91
percent; the scale is tied to the same scroll progress and is read off layout
values, so it never changes a measurement. The first and last cards each finish
centred.

The pinned stage needs `(min-width: 1024px)`, `(min-height: 700px)`, a fine
pointer and no reduced-motion preference. Anything else gets a native
horizontal scroller, which is also what a short laptop window falls back to.
Reduced motion disables the scaling.

## How a card is sized

The frame takes its proportion from its own cover rather than imposing one.
The media height comes from the row, the width follows from the cover's ratio,
and the frame padding is even on all four sides. Cards therefore share a height
and differ in width, which a horizontal row can carry; differing in height is
what the viewport cannot.

This is why `WorkRail` measures scroll travel between the first and last card
CENTRES instead of `slot * (n - 1)`. The old formula took the first card's
width as every card's width, which is only true while every cover is the same
shape. It also writes the list's two centring pads separately, because with
different widths the two ends need different values and CSS cannot know either.

`--gallery-media` in `app/globals.css` caps the media height. It is currently
**627px**, which is half of 1254, the natural height of four of the six covers,
so those draw exactly native on a 2x screen.

## Cover specification

The covers today are three different shapes and five different file sizes,
which is why the frames are all different widths:

| cover | pixels | ratio | file |
| --- | --- | --- | --- |
| banding-laptop-mockup | 1536 x 1024 | 3:2 | 236 kB |
| dashboard-laptop-mockup | 1254 x 1254 | 1:1 | 136 kB |
| hospital-handheld-mockup | 1254 x 1254 | 1:1 | 195 kB |
| reusely-studio-mockup | 1254 x 1254 | 1:1 | 103 kB |
| reusely-tablet-mockup | 1254 x 1254 | 1:1 | 597 kB |
| volunteer-mobile-mockup | 1024 x 1536 | 2:3 | 512 kB |

When these are re-rendered, export every one to the same spec:

**2400 x 1600 px, 3:2 landscape, WebP.**

Why these numbers:

- **3:2, landscape, all six.** One orientation is the point: it makes every
  frame the same width, so the row reads as a series rather than a shelf of
  odd shapes. 3:2 is the standard photographic ratio, it suits a staged device
  scene, and `banding-laptop-mockup` is already shot that way.
- **1600px tall** is exactly 2x an 800px CSS media height, so the covers draw
  native on a 2x display and downscale cleanly on a 1x one. They are never
  upscaled, which is the failure this replaced: the covers used to be blown up
  1.42x to 1.55x because a square source was being stretched to fill a 3:2
  frame.
- **2400px wide** is 1600 x 1.5.
- The measured media height available is `100dvh` less 96px of stage padding,
  76px of caption, 40px of breathing room and the frame's own padding, which
  comes to about 654px on a 1440x900 laptop, 834px at 1080p and 1069px on a
  1440p screen. 800px covers the first two outright and is a deliberate ceiling
  on the third: past it the card starts crowding the viewport and the file
  weight stops being worth it.
- At an 800px media height a card is 1200px wide plus its frame, which is
  roughly 70 percent of a 1440px viewport and 64 percent of a 1920px one. That
  leaves the neighbouring cards visibly peeking, which is what makes the
  gallery read as a gallery instead of a slideshow.

Also hold to:

- **Under 250 kB per file.** Dimensions are not the problem here: encoder
  settings are. `reusely-tablet-mockup` is 597 kB at 1254 x 1254 while
  `reusely-studio-mockup` is 103 kB at exactly the same size.
- **Palette.** Grounds stay inside black, violet, white and lime plus
  neutrals. The Trade-in and Volunteer covers are currently shot on orange,
  which left the palette, and the frame no longer crops any of it away.
- **Safe area.** Keep the device and any readable UI inside the central 85
  percent. The active card scales, and a future layout may crop.
- **One series.** Same ground, same light direction, same relative device
  scale across all six, so the row looks shot in one session.

### Code to update at the same time

1. `--gallery-media` in `app/globals.css`: raise the cap from `627px` to
   `800px`. It is low today only because the current sources are 1254px tall.
2. The `w` and `h` fields in the `studies` array in
   `components/work/WorkRail.tsx`: set every entry to `w: 2400, h: 1600`. They
   are declared on each `<img>` so the browser reserves the right box before a
   cover decodes; without them each arriving cover resized the row, and the
   row's width is what the scroll travel is measured from.

### Hero studio covers are a different set

`public/images/hero-studio/` feeds the hero collage, not this gallery, and its
sizing is already correct: the desktop composition caps a card at 320 CSS px,
so a 640px square source is exactly 2x and should stay 640 x 640. The one
exception is `volunteer-mobile-mockup.webp` at 640 x 960, which the hero draws
inside an `aspect-ratio: 0.78` card, so it is cropped there by design. That
folder also holds eleven earlier studies that nothing references.
