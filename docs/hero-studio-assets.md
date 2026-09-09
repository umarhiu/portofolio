# Hero studio collage

Generated with the built-in image-generation tool on 2026-09-08. These are
decorative material studies, not representations of client work.

Five 640 × 640 WebP assets live in `public/images/hero-studio/`.
Original generated PNGs remain in the image-generation output directory.

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
Two static small
cards remain below 1024px. The
existing entrance orchestrator reveals the cards with the controller, after
the identity docks. Entrance and pointer transforms have separate wrappers.
Fine-pointer proximity drives bounded spring translation and tilt; touch and
reduced-motion users retain the static composition. All cards are decorative,
have empty alt text, and cannot capture clicks or keyboard focus.

Research: supplied 21st.dev screenshot for overlapping composition;
https://motion.dev/docs/react-use-spring for spring-driven pointer values.
