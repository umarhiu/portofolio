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
  | "Ways of Working"
  | "Dashboard"
  | "Workflow"
  | "Design System"
  | "Zero-to-One";

// Rich, per-project case study content. Optional: a project without `study`
// falls back to the placeholder reading spine on the case study page, so real
// content can land one project at a time without touching the others.
export interface StudySection {
  heading: string;
  body: string[];
}

// A two-path comparison (the conventional route vs the route I run). Compares
// methods, never people.
export interface StudyComparison {
  flow: string;
  conventional: { label: string; points: string[] };
  mine: { label: string; points: string[] };
}

export interface CaseStudy {
  lede: string;
  role: string;
  duration: string;
  metric: { value: string; label: string };
  // The AI workflow itself, the highlight: ordered stages, the tool each uses,
  // and what it does.
  loop?: { step: string; tool: string; detail: string }[];
  comparison?: StudyComparison;
  // Optional live prototype to embed as proof (the clickable build). Must be a
  // public, embeddable URL.
  prototypeUrl?: string;
  // Optional before/after screenshots of the result.
  before?: string;
  after?: string;
  // Optional gallery of full-width captioned shots, for wide reference boards
  // (file structure, foundations, components) that should not be cropped.
  gallery?: { src: string; caption: string }[];
  sections: StudySection[];
}

export interface Project {
  slug: string;
  title: string;
  context: string;
  depth: Depth;
  type: ProjectType;
  outcome: string;
  mock: boolean;
  cover?: string; // card media image (else the type label shows)
  stack?: string[]; // items surfaced on the card (tools, system makeup, ...)
  stackLabel?: string; // label above the stack line (e.g. "AI workflow")
  study?: CaseStudy;
}

// MOCK set. Anonymized to context, not invented client brands, so nothing
// implies a real relationship until real content lands.
export const projects: Project[] = [
  {
    slug: "reusely-design-workflow",
    title: "Two paths to the same screen",
    context: "Reusely, infrastructure for trade-ins and reverse commerce",
    depth: "DEEP DIVE",
    type: "Ways of Working",
    outcome: "The whole widget clickable, faster than Figma mockups",
    mock: false,
    cover: "/asset/project/widget-cover.webp",
    stack: ["ChatGPT", "Claude Code", "Figma MCP"],
    stackLabel: "AI workflow",
    study: {
      lede: "Reusely is the platform for trade-ins, buybacks, and reverse commerce: programs, reverse logistics, inventory intake, automated pricing, offers, and payouts. I run product design there on an AI-augmented loop, and I prototype most features this way. Given the same brief as the conventional Figma-first path, the loop reaches a clickable, working prototype faster, one that runs the real logic instead of faking it in static frames. This is one of those prototypes, the trade-in widget, taken down both roads.",
      role: "Product designer, Reusely",
      duration: "Ongoing",
      metric: {
        value: "Every state",
        label: "the widget's logic, settings, and edge cases built as a working prototype, not faked in static Figma frames",
      },
      loop: [
        {
          step: "Brainstorm",
          tool: "ChatGPT",
          detail: "Frame the real problem and pressure-test options before any pixels.",
        },
        {
          step: "Prototype",
          tool: "Claude Code",
          detail: "Build the real, clickable thing: the actual logic, settings, and edge cases, not static frames.",
        },
        {
          step: "Systemize",
          tool: "Figma MCP",
          detail: "Generate components straight from the design system, so there is no drift to reconcile.",
        },
        {
          step: "Iterate",
          tool: "Figma",
          detail: "Refine and polish on top of a build that already works.",
        },
      ],
      comparison: {
        flow: "The trade-in widget redesign. Businesses embed Reusely's widget on their own website so their customers can sell an item and get an instant offer. The widget itself had drifted inconsistent, and the setup the business configures it through confused them. The job: one consistent selling experience for the customer, and a setup that is obvious for the business to stand up.",
        conventional: {
          label: "The conventional path",
          points: [
            "Wireframe, then a high-fidelity mockup, screen by screen in Figma.",
            "Build each component by hand, then reconcile it against the design system.",
            "Iterate by editing static frames; the prototype is a click-through of images.",
            "Strong on deliberate craft and control. Slow to a testable build, and the system drifts as the screens multiply.",
          ],
        },
        mine: {
          label: "The path I run",
          points: [
            "A clickable, working build, not a click-through of static images.",
            "It runs the real logic and every edge case, so the prototype behaves like the product.",
            "Components come straight from the design system, so there is no drift to reconcile.",
            "Fast to something testable, and my judgment gates every handoff. The four stages are above.",
          ],
        },
      },
      prototypeUrl: "https://reusely-prototype.vercel.app/prototypes/settings/widget",
      before: "/asset/project/widget-before.webp",
      after: "/asset/project/widget-after.webp",
      sections: [
        {
          heading: "Where my judgment lives",
          body: [
            "The tools are leverage, not the designer. ChatGPT does not decide the problem, it widens the option space I choose from. Claude Code does not decide the interaction, it builds the version I specify so I can feel it in the browser. MCP does not decide the component, it enforces the system I already designed.",
            "The speed comes from removing the manual rebuild, never from removing the decision. Every gate is one I own.",
          ],
        },
        {
          heading: "Same destination, the difference",
          body: [
            "Both paths ship the same widget. The difference is what the prototype actually is: mine runs the real logic and handles the edge cases, where a Figma version would be dozens of static frames faking each state.",
            "It came together in roughly one to two focused weeks, spread across a month while I split time with another feature, and still faster than mocking the same scope in Figma.",
          ],
        },
        {
          heading: "Where the conventional path still wins",
          body: [
            "When a problem is genuinely new and the system has no answer for it yet, slowing down in Figma to invent the pattern by hand is the right call. The loop is for everything the system already knows how to express.",
            "What I would change next: tighten the prompt-to-component contract so the MCP step needs less correction, and capture the brainstorm so the rationale survives the speed.",
          ],
        },
      ],
    },
  },
  {
    slug: "reusely-design-system",
    title: "One source of truth",
    context: "Reusely, infrastructure for trade-ins and reverse commerce",
    depth: "DEEP DIVE",
    type: "Design System",
    outcome: "Scattered files into one reusable system, adopted across products",
    mock: false,
    cover: "/asset/project/ds-cover.webp",
    stack: ["Figma variables", "Tokens", "Components"],
    stackLabel: "Built with",
    study: {
      lede: "Reusely's design system had drifted into scattered files: duplicated components, inconsistent variants, and naming so unclear that the only way to understand prior work was to ask the previous designer. I rebuilt it solo, in about a month, into one reusable system: tokens and foundations as Figma variables, components built from them and documented, all named so the system explains itself. It is now the single source of truth the team builds on across products.",
      role: "Product designer, Reusely",
      duration: "About a month, solo",
      metric: {
        value: "One system",
        label: "scattered, duplicated files consolidated into a single reusable source of truth, adopted across products",
      },
      gallery: [
        {
          src: "/asset/project/ds-before.webp",
          caption: "Before: scattered, unnamed files",
        },
        {
          src: "/asset/project/ds-after.webp",
          caption: "After: one organized, named library",
        },
        {
          src: "/asset/project/ds-foundation.webp",
          caption: "Foundations as Figma variables",
        },
        {
          src: "/asset/project/ds-component.webp",
          caption: "Documented components",
        },
      ],
      sections: [
        {
          heading: "The old system",
          body: [
            "Components were scattered across the project with little reuse, and variants drifted out of sync. Files were unnamed or named badly, so understanding prior work meant asking the previous designer rather than reading the system.",
            "Maintaining it was guesswork: find the right file, and hope it was the current one.",
          ],
        },
        {
          heading: "What I rebuilt",
          body: [
            "One organized library, named so it explains itself. Foundations as Figma variables (color, type, spacing) feed the tokens, every component is built from them, and each is documented with its states and usage.",
            "Reuse is the default, and consistency is enforced by the system rather than by vigilance.",
          ],
        },
        {
          heading: "What it changed",
          body: [
            "Collaboration got cleaner: anyone can find the right component without tribal knowledge. The system is adopted across products, and changing a pattern once updates it everywhere it is used.",
          ],
        },
        {
          heading: "What I would change",
          body: [
            "Tighten the path from Figma variables into code so the system stays true on both sides, and keep the documentation next to the components so it never drifts again.",
          ],
        },
      ],
    },
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
  "Ways of Working",
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
