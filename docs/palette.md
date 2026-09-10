# Portfolio palette

- Primary: Deep Sea Green `#075056` — primary actions, controller shell, statement portal and work chapter.
- Secondary: Blaze Orange `#FF5B04` — small accents, selected controller button and readable accents on Mirage.
- Dark background: original near-black `#0B0D10` — page and dark-section surfaces.
- Neutral: Mirage `#16232A` — light-surface ink and material shadows, not dark-section backgrounds.
- White `#FFFFFF` — hero canvas, faceplate, text on primary and dark surfaces.
- Reserved tertiary: Wild Sand `#E4EEF0` — token only, not used in the interface.

CSS tokens in `app/globals.css` are the browser source of truth; `lib/tokens.ts` mirrors values for non-browser consumers. Neutral shades and material shading derive from this palette. Project imagery retains its original colors. No motion, layout or scroll timing changes are part of this update.

Use white on green and Mirage on orange buttons; orange is not a small-text color on white.
