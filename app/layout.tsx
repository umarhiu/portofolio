import type { Metadata, Viewport } from "next";
import { Archivo, Spectral, JetBrains_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/lib/content";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { FluidCursor } from "@/components/site/FluidCursor";
import "./globals.css";
import { heroIntroBootstrap } from "@/lib/hero-intro-bootstrap";

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

/*
  The browser chrome colour. Nothing set this before, so mobile Safari and
  Chrome painted their bars with their own default rather than the page, which
  read as a seam above a full-bleed black page. It is black at every scheme
  because the site is a locked dark theme: the white hero is a surface inside
  it, not a light mode.
*/
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
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
        <head>
          <script dangerouslySetInnerHTML={{ __html: heroIntroBootstrap }} />
        </head>
        <body suppressHydrationWarning>
          {/* #main exists on every route, unlike the home-only #selected-work. */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:uppercase focus:tracking-wider focus:text-on-accent"
          >
            Skip to content
          </a>
          {children}
          <SmoothScroll />
          <FluidCursor />
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}
