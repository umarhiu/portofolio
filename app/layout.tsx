import type { Metadata } from "next";
import { Archivo, Spectral, JetBrains_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/lib/content";
import "./globals.css";

/*
  Display: Archivo as a variable font including the width (wdth) axis, driven
  to its expanded end via font-variation-settings in globals.css. This is the
  reliable way to get an "expanded grotesque" from Google Fonts. The product
  voice.
*/
const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo-expanded",
  display: "swap",
});

/* Long-form serif: sharp, intelligent. The depth and decisions voice. */
const serif = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

/* Mono: telemetry, data, labels. The rigor and receipts voice. */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_URL = "https://example.com"; // TODO: replace with the real domain before launch.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name}. ${site.role}`,
    template: `%s. ${site.name}`,
  },
  description: site.tagline,
  openGraph: {
    title: `${site.name}. ${site.role}`,
    description: site.tagline,
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}. ${site.role}`,
    description: site.tagline,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${display.variable} ${serif.variable} ${mono.variable}`}
        suppressHydrationWarning
      >
        <body suppressHydrationWarning>
          {/* Pre-paint renderer decision (no-flash). Mirrors detectRenderer in
              lib/hero/capability.ts. Runs before the hero is parsed, so capable
              desktops never paint the static hero. Bots and non-capable devices
              skip this and keep the SSR static hero (good for SEO and LCP). */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "(function(){try{var m=window.matchMedia;var reduce=m&&m('(prefers-reduced-motion: reduce)').matches;var fine=m&&m('(pointer: fine)').matches;var wide=m&&m('(min-width: 1024px)').matches;var gl=false;try{gl=!!document.createElement('canvas').getContext('webgl2');}catch(e){}var cores=navigator.hardwareConcurrency||4;if(!reduce&&gl&&fine&&wide&&cores>=4){document.documentElement.setAttribute('data-hero','webgl');}}catch(e){}})();",
            }}
          />
          <a
            href="#selected-work"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:uppercase focus:tracking-wider focus:text-void"
          >
            Skip to selected work
          </a>
          {children}
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}
