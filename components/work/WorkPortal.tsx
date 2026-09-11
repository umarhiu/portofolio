"use client";

import { useEffect, useState, type ReactNode } from "react";
import GlyphPortal from "@/components/ui/glyph-portal";

/*
  The doorway into the Selected Work chapter: the vendored Glyph Portal
  (components/ui/glyph-portal.tsx) configured for this site. A single word set
  in the display face sits on the dark page; the violet field shows through the
  letterforms; scrolling flies the camera into the solid ink of one letter until
  the violet fills the viewport, and the rail of case files is revealed on it.

  Why a wrapper, and why it waits for the font. Glyph Portal freezes whichever
  faces are AVAILABLE at mount (document.fonts.check), and a face that is still
  loading is treated as a stall that keeps the whole mount static, with no
  camera. next/font preloads Archivo, but below-the-fold hydration can still
  beat the font on a slow connection, so this component waits for the display
  face first, with a short timeout, and renders the children plainly until
  then. That plain render is also what the server sends and what no-JS users
  keep, so the cards and their links are always in the document.

  The --gp-* properties map the portal onto the site palette: void is the
  paper, the accent is the field, and the foreground inside the flooded field
  is void ink (see the contrast notes in app/globals.css).
*/

/*
  The word the camera enters through. Short and solid on purpose: the portal
  picks the largest opaque patch of ink to zoom into, and heavy uppercase stems
  give it plenty to choose from. It is the chapter title in one word, and it
  opens onto the full "Selected work" heading on the other side.
*/
const WORD = "WORK";
const FAMILY_VAR = "--font-archivo-expanded";
const FALLBACK = '"Arial Black", Arial, sans-serif';

export function WorkPortal({ children }: { children: ReactNode }) {
  const [face, setFace] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;
    const finish = (value: string) => {
      if (settled) return;
      settled = true;
      setFace(value);
    };
    const family = getComputedStyle(document.documentElement)
      .getPropertyValue(FAMILY_VAR)
      .trim();
    const stack = family ? `${family}, ${FALLBACK}` : FALLBACK;
    // Never wait forever: past this the portal mounts with whatever is loaded,
    // and its own stall guard keeps that mount static rather than broken.
    const timeout = window.setTimeout(() => finish(stack), 1600);
    if (family && document.fonts?.load) {
      document.fonts
        .load(`800 100px ${family}`, WORD)
        .then(() => finish(stack), () => finish(FALLBACK));
    } else {
      finish(stack);
    }
    return () => {
      settled = true;
      clearTimeout(timeout);
    };
  }, []);

  if (!face) {
    return <div className="work-portal work-portal--pending">{children}</div>;
  }

  return (
    <GlyphPortal
      className="work-portal"
      word={WORD}
      interactive={false}
      scrollLength={2.2}
      fontFamily={face}
      fontWeight={800}
      enterLabel="Skip to the work"
      style={{
        "--gp-paper": "var(--color-void)",
        "--gp-ink": "var(--color-vellum)",
        "--gp-field": "var(--color-chapter-field)",
        "--gp-foreground": "var(--color-on-violet)",
      }}
      background={<div aria-hidden="true" className="work-portal__field" />}
    >
      {children}
    </GlyphPortal>
  );
}
