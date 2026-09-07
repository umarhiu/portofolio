# Portfolio hero revamp: A little play, serious craft

## Assignment

Act as a creative director and senior frontend interaction designer. Revamp only the hero of Umar's existing personal product-design portfolio. Implement a considered, original direction, not a collection of portfolio trends.

The current hero reads "THE SCREEN IS THE LAST LAYER." and combines a near-black background, oversized uppercase typography, a blueprint-like overlay, and technical microcopy. Replace that composition rather than merely recoloring it. Preserve the rest of the site, its working links, and its content.

The result should introduce a product designer clearly, make their ability to build tangible, and contain one memorable interaction: a tactile retro controller embedded in the headline. The controller changes a verb in that headline. This is a portfolio with a playful object, not a gaming website.

## Reference intent

Reference pages:

```text
https://zainabkabira.com/
https://www.sphereroot.com/
```

Use Zainab Kabira's direct designer/maker positioning as a conceptual reference, not as copy to reproduce. Use SphereRoot's interleaving of headline fragments and imagery as a compositional reference, not as a layout to trace. Inspect the live sites where your tools permit; do not claim to have tested motion you cannot observe.

The user's second reference image shows a wide red retro controller with a cream faceplate and dark controls. It is not a screen-equipped handheld console. Borrow that horizontal silhouette and physical material contrast. Create an original, simplified object; do not copy the Sup branding or other manufacturer marks.

## The central idea

The controller is punctuation within a sentence, and its action changes that sentence. It is not a stock illustration in a separate right-hand column.

Use this default headline, preserving the words as actual web text:

```text
I design things
worth [CONTROLLER] using.
```

The bracketed text denotes the real interactive asset and must never appear in the finished UI.

The verb can change from `design` to `build`, `code`, and `ship`, returning to `design`. The default is always `design`; there is no automatic rotation.

These are proposed positioning words, not permission to invent experience. Before publishing, confirm that the existing portfolio supports them. `Build` and `code` may describe working frontend prototypes; do not imply full-stack or production-engineering expertise. Keep `ship` only when existing case studies demonstrate involvement in released work. Otherwise use `refine`. If another verb is unsupported, omit that mode and derive the mode indicator from the remaining data.

Supporting copy:

> I'm Umar, a product designer turning complex workflows into clear products and working prototypes.

Primary link: `Explore my work`, pointing to the existing work section or route.
Secondary link: `Let's talk`, reusing the existing contact destination.

Use `Umar / Product Designer` as a small identity line. Keep existing relevant navigation destinations. Do not invent a contact address, availability, location, years of experience, client logos, project outcomes, or awards.

A small, persistent caption near the controller reads `Press to switch`. Keep it outside the H1's readable sentence. The hero must communicate the person's role and offer a route to their work without anyone discovering or using the controller.

## Art direction

Use a warm paper-colored canvas, near-black typography, and a red controller as the focal accent. This is a proposed hero-local palette change, not permission to replace the whole site's color system. Inspect the project's token source, including `tokens.css` if present. Reuse suitable roles and add only the scoped tokens that the new hero requires in that source of truth. Avoid hardcoded color values scattered across components.

Choose a characterful grotesk from the fonts already licensed or available in the project. Use substantial but not extra-heavy weight, sentence case, tight but readable spacing, and intentional line breaks. Do not recreate the current all-caps poster treatment. Keep body copy in a compatible, readable face. At most, use a small mono treatment for printed hardware markings, not for all navigation and supporting text.

The asset should feel like a small physical product photographed in a controlled studio: matte red molded plastic, an ivory inset faceplate, charcoal rubber D-pad, a thin visible sidewall, one believable seam, a restrained top-edge highlight, and a soft contact shadow. A small printed `UMAR` mark can personalize the faceplate.

Prefer fewer, better details. Do not add distressed textures, a long cable, floating stickers, multiple collectibles, pixel-art backgrounds, neon outlines, glass cards, blueprint grids, particles, or decorative skill badges. Material gradients on the controller are acceptable; an ambient gradient blob behind the hero is not.

## Desktop composition

Use one centered editorial composition within a generous maximum-width container. Do not default to a text-left/illustration-right landing-page template.

A starting point at a 1440 px viewport is a content width of roughly 1120-1200 px, horizontal page gutters around 48-72 px, and headline text around 104-128 px. These are starting values for optical adjustment, not unchangeable constants.

Place `I [verb] things` on the first line. Place `worth`, the controller, and `using.` on the second line. Build explicit layout slots so the controller has its own space and cannot cover a letter. Its visual body can be approximately 220-260 px wide and 105-130 px high at desktop size. Optically align its center with the surrounding letterforms rather than blindly using the image bounding box.

Keep the identity line above the main composition, supporting copy below it at a readable measure of about 45-55 characters, and the two links underneath. Use no more supporting elements than those needed to introduce the person, explain the interaction, and navigate.

At common desktop heights, the main links should be visible without scrolling. The start of the existing work section may peek into view when space permits. Do not force a fixed-height hero, clip content at browser zoom, or introduce an enormous dead area simply to fill a viewport. Preserve the next section; handle the transition with spacing and a clean boundary rather than redesigning it.

The layout must hold its exact line breaks and asset position when the verb changes. Reserve the dynamic word's width using the longest enabled label and verify its optical spacing at each breakpoint. Do not measure it only after first paint and create a layout jump.

## Controller construction

Build the first version as a lightweight 2.5D object using SVG, CSS layers, and semantic HTML. This is simulated depth, not a fully rotatable 3D mesh. The purpose is convincing material and button travel, not unrestricted camera movement.

Keep the shell, faceplate, D-pad, material highlights, and ground shadow as independent visual layers. Use perspective and small transforms where helpful. Do not flatten the entire controller into a screenshot and then tilt that screenshot as the complete solution.

Simplify the reference into one interactive D-pad plus a small mode indicator on the right side. Omit extra controls rather than adding realistic-looking buttons with no action. The indicator can use discreet printed dots and the current mode label. Keep it subordinate to the headline. It is display-only, not a second set of controls.

The D-pad is one native `button` with a single activation action: show the next headline verb. Its cross shape is visual, not a promise of four different directional commands. The caption `Press to switch` makes that behavior explicit. Use a comfortably sized, non-overlapping hit area: target at least 48 by 48 CSS px, including on mobile.

Preserve the distinction between the visual body and its active control. The shell is not clickable; only the D-pad gets the pointer cursor, pressed state, and focus treatment. The native button's rectangular hit region may extend into a little surrounding faceplate to keep the cross easy to press.

A generated raster image is not required for version one. If an image-based material treatment is introduced later, it must still permit the D-pad to move independently and must not contain the headline, navigation, CTA labels, or other live text. Do not add WebGL, a game engine, or a model viewer to achieve a few degrees of tilt.

## Interaction and motion

One successful activation advances exactly one enabled mode. Activate the state change through the native button's click event, including keyboard-generated clicks. Do not update both on pointer-down and click. Pointer-down may start the visual depression; pointer-cancel, pointer-up, blur, and lost pointer capture must restore the resting visual state.

On press, move the D-pad about 2-3 px into its housing, tighten its local shadow, and optionally introduce a small directional rock. Return with a short, controlled spring-like motion. Suggested starting timings are 70-100 ms for press feedback and 140-220 ms for release; tune by feel rather than treating these as universal standards.

Transition only the changing word with a restrained vertical displacement of about 6-10 px and an opacity change lasting roughly 180-240 ms. Do not animate each character, scramble text, run a typewriter effect, move the whole headline, or change the page palette with each mode. Keep the supporting copy and links stationary.

The object can have a small resting rotation of approximately -5 degrees. Optional pointer-follow tilt must be local to the controller, bounded to about 3-4 degrees, and enabled only on fine-pointer devices. Reset it on pointer leave. The hero should be completely still at rest: no perpetual floating, bouncing, spinning, or idle loop.

Handle rapid presses without building a queue of obsolete transitions. The displayed verb and mode indicator must always represent the same state. No autoplay, sounds, vibration, full game, achievement toast, confetti, or scroll hijacking in this version.

## Mobile and accessibility

Do not shrink the desktop headline until it becomes hard to read. On narrow screens, use this composition:

```text
I design things
[CONTROLLER]
worth using.
```

The controller remains between parts of the sentence, but occupies its own row. Start around 42-56 px for the headline and 190-220 px for the controller width, then adjust for the actual font. Keep the D-pad's hit target large enough independently of the asset's scaling. Reflow earlier on tablet if the inline desktop arrangement would become cramped.

The interaction must work through tapping, mouse activation, and native Enter/Space activation. No hover is required to discover it. Provide a clearly visible focus indicator and do not steal arrow keys or other page-level keyboard input. Focus stays on the D-pad after activation.

Keep one coherent H1 containing the full headline text in reading order. The controller is visually integrated into the composition but should be a separately labeled interactive element rather than part of the heading's accessible name. Use an explicit layout slot and a sibling controller component where practical. Never put a focusable control inside an `aria-hidden` subtree. Hide only decorative asset layers from assistive technology.

Give the button a stable label such as `Change headline verb` and associate the visible instruction with it. Use a separate polite status message to announce the current mode only after user activation. Do not treat this cycling command as a binary `aria-pressed` toggle. Avoid duplicated heading announcements or repeated automatic announcements.

Honor `prefers-reduced-motion`: remove pointer tilt, positional transitions, springs, and any smooth scrolling introduced by this task. Update the verb immediately, or with a minimal opacity-only transition. Retain clear static pressed and focus feedback. If the installed Motion library is used, enable its reduced-motion handling and separately disable any custom CSS or pointer-driven movement.

Render the default headline, role, copy, and navigation without waiting for animation or hydration. Without JavaScript, retain the composed static asset and readable default content; do not advertise an active switch that cannot work. The main work and contact links must remain functional.

## Implementation boundaries

Inspect the existing framework, dependencies, styles, hero component, tokens, font setup, and routes before editing. Continue using the existing Next.js/React project where that is what the repository contains. Do not migrate frameworks, upgrade packages, add a second animation library, or change app architecture for this task.

Keep the interactive state isolated to a small client-side component. Reuse the project's installed motion solution if appropriate, or use CSS for the small number of transitions. Avoid canvas for text or hit testing. Use normal document scrolling and real anchors for navigation.

Suggested responsibilities, adapted to existing project conventions: hero composition, rotating verb, retro controller, and a small mode-data definition. Do not create a new design-system framework. Scope new styles to the hero and remove obsolete hero effects only after verifying they are not used elsewhere.

Do not download assets from the reference websites, invent profile details, modify other case studies, or deploy changes without a separate request.

## Build and review sequence

First inspect the project and state the intended files and any missing facts. Build the static desktop and mobile composition before adding interaction. Check the typography, identity, object proportions, and actual CTA destinations. Then construct the layered controller and wire the single cycling action. Add motion only after the layout and state behavior are correct.

Review at 1440, 1280, 1024, 768, 390, and 360 px widths, including a short desktop viewport and 200% browser zoom. Test every enabled verb, keyboard operation, touch, rapid activation, reduced motion, and the no-JavaScript state. Check a real mobile browser where available; distinguish it from emulation in the final report.

Run the repository's relevant lint, type-check, and build commands. Report which checks actually ran and any failures. Produce desktop and mobile screenshots when your environment permits and visually inspect them; do not claim visual verification when screenshots or browser access are unavailable.

## Definition of done

The static first frame is a complete, clear introduction to a product designer. The red object feels deliberately embedded in the typography, not pasted onto a template. The D-pad has convincing physical feedback and one understandable purpose. All enabled words fit without shifting the surrounding composition. Work and contact remain obvious, independent of the playful control.

Mobile is designed, not merely scaled down. Keyboard users can operate the control and see focus. Reduced-motion and no-JavaScript visitors still receive the core portfolio message. There is no overflow, clipped text, broken destination, page-level keyboard capture, fabricated professional claim, or unrelated redesign.

Finish with a short implementation summary, actual files changed, verified test results, and any remaining asset or content decisions. An award is an aspiration, not an acceptance criterion or a promised outcome.

## Technical reference notes

These sources inform implementation constraints; the visual dimensions and timing values above are proposed starting points, not externally mandated specifications.

CSS layered 3D transforms:
`https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style`

Native button interaction and labeling:
`https://www.w3.org/WAI/ARIA/apg/patterns/button/`

WCAG target-size guidance, including the distinction between the 24 px minimum criterion and the 44 px enhanced criterion:
`https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html`
`https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced`

Reduced-motion guidance for Motion:
`https://motion.dev/docs/react-accessibility`
`https://motion.dev/docs/react-use-reduced-motion`

Awwwards evaluation criteria, for context rather than a promise of recognition:
`https://www.awwwards.com/about-evaluation/`
