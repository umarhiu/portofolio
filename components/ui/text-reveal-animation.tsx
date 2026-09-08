import { Fragment } from "react"

import { cn } from "@/lib/utils"

/*
  Text reveal: splits a string so each letter can be revealed sequentially,
  staggered by its index (the pattern from 21st.dev's text-reveal-animation).

  This component only builds the structure; the motion is applied to the
  emitted [data-reveal-letter] spans by whoever owns the timing. In this
  project that is the hero entrance orchestrator
  (components/hero/useHeroEntrance.ts), which animates them in one Motion call
  with a stagger, so the reveal stays part of the same sequence as the rest of
  the intro and inherits its fail-open deadlines.

  Two details that matter:

  - Words, then letters. Letters are inline-block, and a browser may break a
    line between inline-block boxes, so the letters of each word are wrapped in
    a nowrap span. Body copy therefore still wraps on word boundaries.
  - Accessibility. The split letters are decorative and aria-hidden, with one
    sr-only copy of the real string, so a screen reader reads the text rather
    than spelling it out. Keep that pairing if you edit this.
*/

// Grapheme-safe split so emoji and combining marks stay intact.
function splitIntoCharacters(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

export interface TextRevealProps {
  text: string
  className?: string
  wordClassName?: string
  letterClassName?: string
}

export function TextReveal({
  text,
  className,
  wordClassName,
  letterClassName,
}: TextRevealProps) {
  const words = text.split(" ")

  return (
    <span className={cn("hp-reveal", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="hp-reveal__words">
        {words.map((word, wordIndex) => (
          <Fragment key={`${word}-${wordIndex}`}>
            <span className={cn("hp-reveal__word", wordClassName)}>
              {splitIntoCharacters(word).map((char, charIndex) => (
                <span
                  key={charIndex}
                  data-reveal-letter=""
                  className={cn("hp-reveal__letter", letterClassName)}
                >
                  {char}
                </span>
              ))}
            </span>
            {wordIndex !== words.length - 1 && (
              <span className="hp-reveal__space"> </span>
            )}
          </Fragment>
        ))}
      </span>
    </span>
  )
}
