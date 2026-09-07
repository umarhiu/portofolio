# Portfolio hero v2: white canvas, living headline, tactile controller

## Assignment and precedence

Refine the existing Umar portfolio hero shown in the latest screenshot. Do not restart the design or return to the old dark manifesto hero. Act as a senior product designer and frontend interaction designer working within the existing repository.

This file REPLACES `portfolio-hero-brief.md` for this revision. Specifically, it supersedes the warm canvas, manual-only word switching, right-hand text indicator, controller-local tilt, and flexible desktop hero height. Preserve the current centered composition, approved content, typography direction, working navigation, and embedded-controller idea.

Scope: hero, its navigation treatment, controller, word animation, and the shaped boundary into the immediately following section. Do not rewrite case studies, redesign the following section's content, migrate frameworks, add an animation library, or deploy.

## Visual intent

A completely white opening screen; near-black editorial typography; one red, physically convincing controller between the words. The object remains anchored in the composition but reacts to pointer movement anywhere in the hero. The headline rotates automatically, while the controller still lets visitors select words manually. Scrolling reveals a broad, symmetrical stepped boundary into the next section.

Use the latest first screenshot as the current implementation. Use the latest second screenshot ONLY for the stepped section boundary: center highest, shoulders lower, outer edges lowest. Do not copy its portrait, headline, purple palette, or oversized empty space.

## 1. Preserve the composition; make the canvas pure white

Keep the desktop headline as live text:

```text
I [design / build / code / ship] things
worth [INTERACTIVE CONTROLLER] using.
```

`design` is the initial word. The bracketed descriptions are instructions, never UI copy. Reuse the currently approved mode data; do not add unsupported professional claims. Retain `refine` instead of `ship` when that is the approved existing wording.

Keep the current identity line, supporting copy, and the existing destinations for `Explore my work` and `Let's talk`. Do not invent contact details or availability.

Set the opening canvas, header/navigation background, and exposed page backing to exactly `#FFFFFF`. Change the header logo and links to readable dark colors. Remove the dark horizontal header slab, unintended dark gutters, and any old dark hero overlay. Do not use off-white, beige, a background gradient, grid texture, or a colored glow. Cream is still appropriate for the controller's physical faceplate; it is not the page background.

Implement this through existing scoped tokens or page/theme conventions. Do not scatter global overrides across unrelated pages. Preserve any intentional contrasting background belonging to the next section.

## 2. One viewport, including the navigation

The complete opening composition is one viewport: navigation plus hero, not a full-height hero with another navigation height added above it.

Use one outer intro shell, with the navigation taking its normal height and the hero filling the remaining space. Target `100dvh` for this shell with a suitable `100svh`/`100vh` fallback. Dynamic viewport units follow browser UI changes; small viewport units provide a stable smaller viewport but can leave space after mobile browser chrome retracts. Do not treat them as interchangeable. [R1]

Keep title, controller, supporting copy, and both links visible in the first screen at ordinary desktop and mobile sizes. Center the composition optically inside the area below the navigation. Fit it by tuning type, row gaps, and padding together; do not add a large empty spacer.

Use a content-safe minimum-height layout that normally equals one viewport. At unusually short heights, enlarged text, or browser zoom, let the shell grow rather than clipping content or making the body text tiny. No nested hero scrollbar and no blanket `overflow: hidden` to conceal layout problems. Avoid rigid sizing that loses links behind mobile browser chrome.

The next section starts after the intro shell in normal document flow. Its stepped cap belongs to the next section; it must not add a second viewport or extend the hero's scroll duration.

On narrow screens, preserve the intended mobile composition:

```text
I [verb] things
[CONTROLLER]
worth using.
```

Adjust spacing to the available height and keep controls comfortably operable. Do not shrink the entire desktop composition as one transformed image.

## 3. Automatic word switching, with manual control retained

Use one shared active-mode state for the visible word and controller selection feedback.

- Initial state: `design`, rendered without waiting for animation or hydration.
- Normal autoplay: advance through enabled words every 3.5 seconds.
- Manual activation: update immediately, cancel any pending advance, hold that selection for 5 seconds, then resume the normal cycle if playback is allowed.
- Manual selection while explicitly paused: change the word but remain paused.
- Pause when the headline is offscreen or the browser tab is hidden. Resume with a fresh interval, not a burst of missed updates. The Page Visibility API exposes document visibility; do not use window focus alone as its equivalent. [R2]
- Temporarily suspend autoplay during an active press and while keyboard focus is visibly within the controller. Do not pause merely because the pointer is somewhere in the hero: that would defeat the requested automatic behavior. Pointer-induced focus must not accidentally prevent the intended 5-second resumption.

Provide a small visible pause/resume control beside the controller caption, outside the faceplate. Use a plain icon with an accessible changing action label such as `Pause word rotation` / `Resume word rotation`. A visitor's explicit pause persists for the mounted session until they resume; leaving the hero or clicking another controller button must not override it. Auto-updating content needs a user-controlled pause, stop, hide, or update-frequency mechanism; temporary focus or hover suspension is not a replacement. [R3]

Suggested caption: `Auto-rotating. Press to choose.` When paused, update it to `Paused. Press to choose.` Keep it visually quiet and outside the H1.

Animate only the verb: a short opacity transition with approximately 6-10 px of vertical travel over 220-280 ms. No typewriter, text scrambling, letter-by-letter animation, changing body copy, or whole-headline movement.

Reserve the longest enabled word's intrinsic width from the initial render. Every state must preserve the positions of `I`, `things`, the second line, the controller, and the links. Use fixed layout slots rather than measuring only after first paint. Rapid clicks must not queue obsolete transitions. Maintain one timer and clean it up on unmount; guard against a timer and click advancing twice in the same moment.

## 4. Replace the right-hand text with real action buttons

Remove the existing right-side mode word, indicator dots, and printed `UMAR` text in that area. Replace them with four raised, dark circular action buttons in a compact diamond arrangement, inspired by the user's original controller reference. Keep the left cross-shaped D-pad. Do not add a second analog joystick or a screen-equipped handheld console.

Suggested mapping for the four approved modes: top = design; right = build; bottom = code; left = ship/refine. Use the approved mode data, not a separate hardcoded copy. Each right-side button directly selects its corresponding word. If fewer modes are approved, render fewer functional buttons in a balanced arrangement rather than inventing experience or leaving dead controls.

Preserve the existing D-pad as one press-to-next button. Do not promise four separate directional actions when only a single native button is implemented. The shell remains non-clickable.

Give every action button a stable accessible label such as `Show build headline`. Show the active selection through a restrained rim or material change, not another printed mode label. Optional labels may appear on hover and keyboard focus; do not depend on tooltips to communicate the accessible name. Automatic changes update selection feedback but do not repeatedly simulate a person's button press.

Each real press depresses only that control about 2-3 px into its housing. Tighten its contact shadow and return with a controlled release. Trigger the word change through the click event once; pointer-down is visual feedback, not a second state-change path. Restore the visual state on cancel, release, or blur. Use native buttons with visible focus and Enter/Space operation. [R4]

Keep target areas non-overlapping. As a project usability target, aim for at least 44 px on touch devices. Increase the controller's mobile size or adjust button spacing instead of shrinking all hit targets. Do not put fake transparent buttons at coordinates that stop matching the tilted visible controls.

## 5. More physical depth; pointer response across the ENTIRE hero

### Materials and geometry

Keep the wide red shell and ivory faceplate. Strengthen the object's construction: a visible darker lower shell, side faces, rounded bevels, inset faceplate, raised D-pad, raised round buttons, consistent top-edge highlight, small contact shadows, and a restrained ground shadow.

At a controller width around 250-280 px, start with about 12-16 px of apparent shell depth. Tune proportions optically; this is a suggested art-direction value, not a required physical measurement.

Build the shell, sidewalls, faceplate, controls, and shadow as separate layers. The result must not be a flat picture with a bigger drop shadow. Use the existing CSS/SVG/HTML construction and installed motion solution. Do not introduce WebGL or an unrelated model viewer for this bounded interaction.

Use a perspective wrapper around the object, starting around 800 px. Keep `transform-style: preserve-3d` on the relevant nested model elements. Properties such as filters, clipping, and opacity on a preserving parent can flatten its descendants; put mask/filter effects on appropriate separate layers, and keep the stepped divider out of the model's ancestor chain. [R5]

### Anchored position, responsive orientation

The controller's layout slot NEVER follows the cursor. Its center stays between `worth` and `using.` Only its orientation and subtle lighting/shadow response change. No dragging, screen-space translation, magnetic attraction, camera orbit, or perpetual bobbing.

Listen to pointer movement on the complete intro/hero shell, including blank space and movement over its content. Do not restrict the effect to the controller's bounding box or a proximity radius. Navigation hover, headline hover, and hero corners must all produce a response while the pointer is within the shell.

Use the untransformed hero shell's rectangle, not the event's nested target or the moving controller's rectangle. Normalize pointer coordinates to [-1, 1], clamp them, and refresh geometry on relevant resize/scroll changes. `getBoundingClientRect()` supplies viewport-relative element geometry, so use compatible client coordinates. [R6]

Conceptual mapping (degrees; tune visually):

```text
nx = clamp(2 * (clientX - heroRect.left) / heroRect.width  - 1, -1, 1)
ny = clamp(2 * (clientY - heroRect.top)  / heroRect.height - 1, -1, 1)

rotateX =  10 - ny * 8
rotateY = -10 + nx * 14
rotateZ = -5
```

Guard against zero-sized geometry. The nonzero resting X/Y angles ensure visible depth before anyone moves the pointer. These are starting ranges, not an instruction to expose missing side faces or make controls hard to click.

Smooth orientation changes with a damped spring or equivalent; avoid jitter and excessive lag. When the pointer stops, the controller settles and stays there. On leaving the entire hero, ease back to its resting pose, not a completely flat pose. Disable tracking after the hero leaves view and while the page is hidden.

Use motion values or requestAnimationFrame-managed DOM updates for high-frequency transforms, not React state updates on every pointer event. Motion values can update styles without React re-renders. Keep the installed package's existing import conventions. [R7]

Separate layout placement, pointer orientation, static model construction, and per-button press transforms into appropriate nested layers. Do not let one animation overwrite another's `transform`. Keep controls inside the same geometry as their rendered buttons so hit areas move with them.

Hold the current orientation during an actual button press, then smoothly resume tracking. For keyboard interaction, settle into a predictable resting pose while keyboard focus is within the controller. Do not disable hero-wide response merely because the mouse is close to a button. Use no full-screen invisible event-catching overlay that blocks navigation or selection.

## 6. Stepped transition at the end of the hero

Build a full-bleed architectural step shape at the TOP OF THE NEXT SECTION. The next section's background rises highest in the center, one level lower at the middle shoulders, and lowest at the outside edges. This is the orientation in the reference; do not invert it.

Use five broad horizontal bands, with breakpoints around 20%, 40%, 60%, and 80% of the viewport width. Starting top-edge offsets:

```text
0-20%:    y = 96 px
20-40%:   y = 48 px
40-60%:   y =  0 px
60-80%:   y = 48 px
80-100%:  y = 96 px
```

Reduce total cap height to roughly 48-64 px on mobile while retaining symmetry and the clear center/shoulder/edge structure. These measurements describe the top outline, not five independently floating cards. Corners are square and crisp: no waves, diagonals, rounded hills, or a jagged pixel staircase.

Use a responsive SVG or a CSS polygon/background layer. `clip-path` can define the outline of that decorative background, but do not apply it to the whole content tree and cut off headings or focus rings. [R8]

The cap belongs to normal page flow immediately after the one-viewport shell. As the visitor scrolls, the raised central part enters first, followed by the shoulders and edges. Native document scrolling provides the reveal. No pinned hero, additional 200vh scroll track, mandatory snap, wheel interception, scroll-lock, or replayed entrance animation is needed. Scrolling back should naturally reveal the same boundary in reverse.

Use the immediately following section's EXISTING background for the cap and lower fill so they join seamlessly. The reference's purple is not permission to recolor the portfolio. Keep white in the cap's negative spaces. If the real next section is also white, surface the missing contrast decision rather than silently adding purple or copying the reference portrait.

Keep following-section content safely below the cap, with intentional padding. Do not create a blank transition-only screen, a thin dark seam, clipped content, or a rectangular dark bar ahead of the shape. Do not clip the hero itself to produce the effect.

## 7. Accessibility, fallback, and quality checks

Honor reduced-motion preferences: default to manual word switching, remove pointer tilt, springs, and positional transitions, and keep the static dimensional asset. Manual word selection remains available. If the visitor explicitly enables word rotation, allow static text replacements without spatial movement. Motion's reduced-motion hook can drive this logic; custom CSS and pointer handlers need to follow the same preference. [R9]

Keep one coherent H1. Decorative layers may be hidden from assistive technology, but never put focusable controls inside an `aria-hidden` subtree. Do not announce every automatic update through a live region. Announce the selected phrase only after deliberate user activation, without duplicating the heading.

Keep ordinary page scrolling and keyboard navigation intact. Touch devices get tap controls and the resting 3D appearance without mouse tracking or device-motion permission requests. Without JavaScript, show the readable initial headline, static controller, and functioning navigation; do not display misleading enabled animation controls.

Before editing, inspect the existing hero, shared header, tokens, next-section structure, mode data, dependencies, and motion code. Work within the actual repository conventions. Do not claim the website has been changed or tested merely because this brief exists.

Review the following on the implemented website:

1. Pure-white header and hero, with dark readable navigation and no accidental border strips.
2. A one-viewport opening at 1440x900, 1366x768, 1024x768, 390x844, and 360x740. Also test short landscape heights and 200% zoom; content must remain reachable when the height expands.
3. Stable layout through all enabled words, automatic advancement, immediate manual selection, the 5-second hold, pause/resume, hidden-tab suspension, offscreen suspension, and rapid activation.
4. Hero-wide tilt at all four corners, over text, over navigation, and near the CTAs; the controller's center remains anchored. Test a press while tilted and pointer leave/return.
5. Visible circular right-side buttons with correct actions, independent press depth, matching hit areas, visible keyboard focus, and practical touch spacing.
6. Correct stepped silhouette at intermediate scroll positions in both directions; no extra pinned scene, content clipping, or seams. Verify mobile geometry too.
7. Reduced motion, touch behavior, keyboard activation, screen-reader naming, and a readable no-JavaScript state.

Run the relevant repository lint, type-check, and build commands. Capture desktop/mobile screenshots and a short interaction recording when browser tools permit; screenshots alone cannot prove the pointer and timer behavior. Report only checks actually performed, changed files, and genuine limitations. Keep the final implementation report short.

## Technical references

The dimensions, angles, timings, and visual mapping in this brief are design decisions, not external standards. References support the browser and accessibility constraints only.

[R1] MDN, CSS viewport length units: `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length`

[R2] MDN, Page Visibility API: `https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API`

[R3] W3C, Understanding SC 2.2.2 Pause, Stop, Hide: `https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html`

[R4] W3C, Button Pattern: `https://www.w3.org/WAI/ARIA/apg/patterns/button/`

[R5] MDN, transform-style and flattening: `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style`

[R6] MDN, getBoundingClientRect(): `https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect`

[R7] Motion, motion component and motion values: `https://motion.dev/docs/react-motion-component`

[R8] MDN, clip-path: `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path`

[R9] Motion, useReducedMotion: `https://motion.dev/docs/react-use-reduced-motion`
