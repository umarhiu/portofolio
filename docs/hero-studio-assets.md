# Hero studio collage

Generated with the built-in image-generation tool on 2026-09-08. These are
decorative material studies, not representations of client work.

The five assets the hero actually renders live in `public/images/hero-studio/`:
four 640 × 640 WebP plus `volunteer-mobile-mockup.webp` at 640 × 960, which is
the one portrait card. That directory also holds eleven earlier studies that
nothing references. Original generated PNGs remain in the image-generation
output directory.

## Prompts

### metal.webp

Photorealistic editorial material study for a product designer portfolio image card. Square edge-to-edge photograph: two interlocking machined brushed aluminum arcs on warm ivory studio surface, close crop, sculptural but precisely engineered, subtle fine metal grain, soft directional daylight, deep charcoal reflections, tactile premium industrial design, restrained silver and cream palette. No words, logos, border, collage or UI. One image.

### acrylic.webp

Photorealistic editorial material study for a product designer portfolio image card. Square edge-to-edge photograph: thick translucent burnt-orange acrylic folded into a simple architectural arch on a warm cream surface, glowing amber edge refraction, beautiful long soft shadow, macro industrial design photography, restrained terracotta and ivory palette, tactile realistic imperfections, confident minimal composition. No words, logos, border, collage or UI. One image.

### architecture.webp

Black and white fine art architectural photograph for a product designer portfolio image card. Square edge-to-edge crop: sculptural concrete staircase and curved wall, strong diagonal geometry, bright daylight against deep charcoal shadow, subtle analog grain, close abstract framing, no people, rigorous modernist composition, physically realistic. No text, logo, border, collage or UI. One image.

### paper.webp

Photorealistic editorial material study for a product designer portfolio image card. Square edge-to-edge macro photograph: layered thick ivory paper sheets folded into broad stepped planes, tactile fibers and precise edges, warm cream monochrome palette, raking natural light reveals delicate shadow gradients, quiet sculptural composition, elevated design studio aesthetic. No text, logo, border, collage or UI. One image.

### ceramic.webp

Photorealistic editorial material study for a product designer portfolio image card. Square edge-to-edge studio photograph: sculptural matte charcoal ceramic ribbon folded into an elegant continuous loop, resting on a warm ivory surface. Close composition, tactile fine ceramic grain, soft raking daylight, generous sculptural negative spaces, grounded soft shadow, refined industrial design. Restrained charcoal and cream palette to complement brushed aluminum and amber acrylic photographs. No text, logo, border, collage or UI. One image.

## Integration

Five unevenly sized cards frame all four desktop corners, with a smaller
architecture card behind the large upper-left metal card. The lower-right
card uses the charcoal ceramic study in a portrait crop. Foreground cards extend beyond
the hero bounds and move more than the background cards. Desktop cards have
been reduced roughly 25% from the initial large composition. The entire image
layer is its own z-index 0 stacking context below the z-index 1 hero content.
Below 1024px the image layer is not rendered at all: the hero keeps only
the type and the controller. A phone has 124px of free height under the CTA
row at 844 tall and 15px at 640, which is not enough for five device mockups
to read as work rather than as a strip of thumbnails. The five sources are
also not requested at that width, saving 410 kB: `display:none` does not
cancel an eager `<img>` fetch, so each card is wrapped in a `<picture>` whose
`<source>` gates on `(min-width: 1024px)`. The CSS hides the layer by default
and shows it with that same query, so the two gates cannot drift apart. The
existing entrance orchestrator reveals the cards with the controller, after
the identity docks. Entrance and pointer transforms have separate wrappers.
Fine-pointer proximity drives bounded spring translation and tilt. The pointer
effect was already gated to fine pointers at 1024px and up with no
reduced-motion preference, and below that width there is now no layer to move
at all. All cards are decorative,
have empty alt text, and cannot capture clicks or keyboard focus.

Research: supplied 21st.dev screenshot for overlapping composition;
https://motion.dev/docs/react-use-spring for spring-driven pointer values.
