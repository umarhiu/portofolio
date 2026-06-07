/**
 * Placeholder content for the Substrate portfolio.
 *
 * This is a typed data module so it reads like real content now and can be
 * lifted into MDX or a CMS later without touching components. Everything
 * tagged `mock: true` is a stand-in to be replaced with verified copy and
 * real numbers before launch. The five hero headlines are LOCKED copy, not
 * placeholders.
 */

export const site = {
  name: "Umar",
  role: "Product Designer",
  tagline: "Product designer for complex software. I make dense systems feel obvious.",
  email: "umar@reusely.com",
  availability: "Available for select work in 2026",
  domains: ["Dashboards", "Workflows", "Design systems", "Data-heavy B2B"],
  lastUpdated: "2026-06-01",
  // The fonts and stack are named in the footer colophon as a quiet signal of craft.
  colophon: "Set in Archivo Expanded, Spectral, and JetBrains Mono. Built with Next.js, React Three Fiber, and GSAP.",
} as const;

export const nav = [
  { label: "Work", href: "/#selected-work" },
  { label: "Practice", href: "/#practice" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

export type LayerKind =
  | "assembled"
  | "foundation"
  | "data"
  | "components"
  | "reconverge";

// Each state owns a distinct composition (placement) so scrolling the hero
// reads as a set of posters, not one template.
export type HeroPlacement =
  | "bottom-left"
  | "top-left"
  | "right"
  | "bottom-wide"
  | "center"
  | "center-bottom";

export interface HeroState {
  index: string; // "01".."05"
  layer: LayerKind;
  placement: HeroPlacement;
  eyebrow?: string; // plain-language label, not enumeration
  lead?: string; // small line above the headline (state 02)
  headline: string;
  ghost?: boolean; // render the headline as outline display type
  invert?: boolean; // light (vellum) surface with dark (void) text
  sub?: string; // supporting line
  spec?: string; // mono spec line (state 04)
  cta?: { label: string; href: string };
}

export const heroStates: HeroState[] = [
  {
    index: "01",
    layer: "assembled",
    placement: "bottom-left",
    eyebrow: "Product designer for complex software",
    headline: "I design\nthe system\nbehind the screen.",
  },
  {
    index: "02",
    layer: "foundation",
    placement: "top-left",
    lead: "It starts at the",
    headline: "Foundation.",
    ghost: true,
    sub: "The grid, the spacing scale, the rules everything inherits.",
  },
  {
    index: "03",
    layer: "data",
    placement: "center-bottom",
    headline: "A dashboard is only as honest as its data.",
    sub: "I model the source of truth before the first pixel.",
  },
  {
    index: "04",
    layer: "components",
    placement: "bottom-wide",
    headline: "Every state designed.\nNot just the happy path.",
    spec: "default / hover / loading / error / empty",
  },
  {
    index: "05",
    layer: "reconverge",
    placement: "center",
    invert: true,
    headline: "Complexity, taken apart so no one else has to.",
    cta: { label: "View the case files", href: "#selected-work" },
  },
];

export type Depth = "DEEP DIVE" | "BRIEF";
export type ProjectType =
  | "Dashboard"
  | "Workflow"
  | "Design System"
  | "Zero-to-One";

export interface Project {
  slug: string;
  title: string;
  context: string;
  depth: Depth;
  type: ProjectType;
  outcome: string;
  mock: boolean;
}

// MOCK set. Anonymized to context, not invented client brands, so nothing
// implies a real relationship until real content lands.
export const projects: Project[] = [
  {
    slug: "observability-console",
    title: "Observability console redesign",
    context: "Series-C devtools platform",
    depth: "DEEP DIVE",
    type: "Dashboard",
    outcome: "Time to acknowledge an incident down 41 percent",
    mock: true,
  },
  {
    slug: "underwriting-workflow",
    title: "Underwriting workflow",
    context: "Commercial insurtech",
    depth: "DEEP DIVE",
    type: "Workflow",
    outcome: "Underwriting throughput up 3x",
    mock: true,
  },
  {
    slug: "design-system-pipeline",
    title: "Design system and token pipeline",
    context: "Multi-product enterprise suite",
    depth: "DEEP DIVE",
    type: "Design System",
    outcome: "280 plus components, three products on one system",
    mock: true,
  },
  {
    slug: "analytics-platform",
    title: "Zero to one analytics platform",
    context: "Data infrastructure startup",
    depth: "DEEP DIVE",
    type: "Zero-to-One",
    outcome: "0 to 12k seats in the first year",
    mock: true,
  },
  {
    slug: "billing-console",
    title: "Billing console redesign",
    context: "B2B SaaS",
    depth: "BRIEF",
    type: "Dashboard",
    outcome: "Billing support tickets down 63 percent",
    mock: true,
  },
  {
    slug: "tooling-consolidation",
    title: "Internal tooling consolidation",
    context: "Logistics operations",
    depth: "BRIEF",
    type: "Workflow",
    outcome: "Nine internal tools merged into one",
    mock: true,
  },
];

export const projectTypes: ProjectType[] = [
  "Dashboard",
  "Workflow",
  "Design System",
  "Zero-to-One",
];

export interface ProofMetric {
  value: string;
  label: string;
  mock: boolean;
}

export const proofMetrics: ProofMetric[] = [
  { value: "41%", label: "faster incident acknowledgement", mock: true },
  { value: "3x", label: "underwriting throughput", mock: true },
  { value: "280+", label: "components on one system", mock: true },
  { value: "9 to 1", label: "internal tools consolidated", mock: true },
];

export interface PracticePillar {
  key: string;
  title: string;
  body: string;
}

export const practice: PracticePillar[] = [
  {
    key: "think",
    title: "How I think",
    body: "Map the system before the screen. Name the real problem, not the requested feature, then find the structure that makes the hard thing obvious.",
  },
  {
    key: "decide",
    title: "How I decide",
    body: "Trade-offs in the open. Every call states what it cost and why, so the rationale survives long after the decision.",
  },
  {
    key: "craft",
    title: "How I craft",
    body: "Motion and detail that carry meaning, never decoration. The surface stays calm because the system underneath did the work.",
  },
];

export const about = {
  // TODO: replace with real bio before launch.
  body: "I am a product designer focused on complex software. I work with teams building dashboards, workflows, design systems, and data-heavy B2B products, where the job is taming complexity without flattening it. I care equally about the systems decision and the pixel that lands on it.",
  mock: true,
};
