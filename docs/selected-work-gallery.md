# Selected Work gallery

The active WorkRail now shows five non-clickable project cards using the existing hero device mockups. White frames contain an image, title and category chips. No arrow or link affordance is shown.

Desktop native page scrolling drives horizontal translation continuously. The centered card is full size, with neighbors at 82%; scaling is tied directly to the same scroll progress and never changes layout measurements. First and last cards each finish centered. Touch, small screens and reduced-motion users get a native horizontal scroller; reduced motion disables scaling.

The violet statement handoff is unchanged. The old `/work/[slug]` page route has been removed and its URLs removed from the sitemap. Historical case-study content remains in Git and lib/content.ts, but is not displayed by this gallery.
