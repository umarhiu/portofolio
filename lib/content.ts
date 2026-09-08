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
  colophon: "Set in Archivo Expanded, Spectral, and JetBrains Mono. Built with Next.js and GSAP.",
} as const;

export const nav = [
  { label: "Work", href: "/#selected-work" },
  { label: "Practice", href: "/#practice" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

/*
  "A little play, serious craft" hero (docs/portfolio-hero-brief.md). An
  editorial headline with a tactile retro controller embedded between the
  words; its D-pad cycles the verb. Copy lives here so the voice pass happens
  in one place. No em-dashes.

  Verb honesty check (the brief's content-verification rule), each against a
  real case study in this file:
  - design: every study.
  - build:  working frontend prototypes (the trade-in widget prototype with a
            live URL; the Strata Nexus site built end to end).
  - code:   the same prototypes, honestly framed (reusely-design-workflow and
            strata-nexus-site both describe prompting real, working code);
            no full-stack or production-engineering claim implied.
  - ship:   released work (rsmbs.strata.my.id live; strata-nexus on Vercel;
            the Reusely rebrand and design system rolled out across product).
  All four modes are therefore enabled. "design" is the longest label and
  reserves the slot width.
*/
export const hero = {
  identity: "Umar / Product Designer",
  // The headline reads "I {verb} things worth using." The controller sits
  // between "worth" and "using." on desktop and on its own row on mobile.
  verbs: ["design", "build", "code", "ship"],
  headline: {
    prefix: "I",
    afterVerb: "things",
    line2: ["worth", "using."],
  },
  support:
    "I'm Umar, a product designer turning complex workflows into clear products and working prototypes.",
  ctas: {
    primary: { label: "Explore my work", href: "/#selected-work" },
    secondary: { label: "Let's talk", href: "/#contact" },
  },
} as const;

export type Depth = "DEEP DIVE" | "BRIEF";
export type ProjectType =
  | "Ways of Working"
  | "Dashboard"
  | "Workflow"
  | "Design System"
  | "Rebrand"
  | "Zero-to-One"
  | "Experiment";

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
  // Optional external link shown as a bordered CTA: a live prototype, or a live
  // site as proof of shipped work. label/note/cta default to project #1's
  // widget-prototype wording, so older studies render unchanged.
  prototypeUrl?: string;
  prototypeLabel?: string;
  prototypeNote?: string;
  prototypeCta?: string;
  // Optional before/after screenshots of the result.
  before?: string;
  after?: string;
  // Optional gallery of full-width captioned shots, for wide reference boards
  // (file structure, foundations, components) that should not be cropped.
  gallery?: { src: string; caption: string }[];
  // Optional set of labelled before/after screen pairs (e.g. a rebrand rollout).
  beforeAfters?: { label: string; before: string; after: string }[];
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
    slug: "reusely-rebrand",
    title: "One brand, every screen",
    context: "Reusely, infrastructure for trade-ins and reverse commerce",
    depth: "DEEP DIVE",
    type: "Rebrand",
    cover: "/asset/project/rebrand-cover.webp",
    outcome: "A cohesive brand, from foundation to every screen",
    mock: false,
    stack: ["Brand strategy", "Foundations", "Components"],
    stackLabel: "Scope",
    study: {
      lede: "As the sole product designer at Reusely, I led a strategic rebrand of the platform end to end. I set the brand foundation, built the components on top of it, and rolled the new look across the product, turning the previous design into one cohesive identity, screen by screen. Every design task the platform needs, I design.",
      role: "Sole product designer, Reusely",
      duration: "Ongoing",
      metric: {
        value: "One brand",
        label: "a single brand foundation carried from tokens to components to every screen, replacing a fragmented older design",
      },
      beforeAfters: [
        {
          label: "Offer management",
          before: "/asset/project/Offer-before.webp",
          after: "/asset/project/Offer-after.webp",
        },
        {
          label: "Notifications",
          before: "/asset/project/Notifications-before.webp",
          after: "/asset/project/Notifications-after.webp",
        },
      ],
      sections: [
        {
          heading: "Strategy, not surface",
          body: [
            "The rebrand started from intent, not decoration: a clear direction for how Reusely should look and feel as it grows into infrastructure for reverse commerce.",
            "Brand decisions were made to scale across a whole platform, not to dress a single screen.",
          ],
        },
        {
          heading: "The foundation",
          body: [
            "I defined the foundation first: color, type, spacing, and the brand expression, so every later decision inherited from one source rather than being reinvented per screen.",
          ],
        },
        {
          heading: "The components",
          body: [
            "Components were built on the new foundation, consistent and reusable, so the brand is enforced by the system rather than reapplied by hand each time.",
          ],
        },
        {
          heading: "Applied across the product",
          body: [
            "Then the rollout: turning the previous design into the new one, screen by screen, until the whole product spoke a single language. As the only designer, every screen passed through me.",
          ],
        },
        {
          heading: "What I would change",
          body: [
            "Sequence the rollout around the highest-traffic flows first, and keep the brand foundation versioned so the system and the product never drift apart as it grows.",
          ],
        },
      ],
    },
  },
  {
    slug: "rsmbs-hospital-website",
    title: "One foundation, the whole hospital",
    context: "RS Muhammadiyah Bandung Selatan, a community hospital in South Bandung",
    depth: "DEEP DIVE",
    type: "Zero-to-One",
    cover: "/asset/project/rsmbs-cover.webp",
    outcome: "A complete public hospital website, designed end to end from a token-driven foundation",
    mock: false,
    stack: ["Foundations", "Components", "Responsive"],
    stackLabel: "Scope",
    study: {
      lede: "RS Muhammadiyah Bandung Selatan is a Muhammadiyah community hospital in South Bandung, and it needed a public website that an ordinary patient or family could actually use before they ever walked in. The job behind the job is rarely browse a hospital. It is find the right clinic, find a doctor, check a schedule, and figure out how to get there. I took this on solo as a freelance UI/UX designer, starting from nothing: the foundations, the reusable components built on top of them, the layout, the content, the page structure, and the responsive behavior across devices. The result is the live site, one coherent thing carried from foundation to finished pages by one person.",
      role: "Freelance UI/UX designer, solo",
      duration: "Freelance, 2026",
      metric: {
        value: "Foundation to ship",
        label: "a token-driven foundation, reusable components, full layout, content, structure, and mobile responsive behavior, designed end to end by one freelancer",
      },
      prototypeUrl: "https://rsmbs.strata.my.id/",
      prototypeLabel: "The live site",
      prototypeNote: "The hospital's public website, live. Designed end to end, from the foundation to the responsive pages.",
      prototypeCta: "Visit the live site",
      sections: [
        {
          heading: "The brief",
          body: [
            "The hospital needed a public face that a worried patient or family member could read quickly and act on: find a clinic, check a doctor's schedule, locate the emergency service, understand which insurance is accepted, and plan a visit.",
            "There was no existing site to inherit and no system to lean on. The job was to design the whole thing, from the first foundational decision to the last responsive screen, as one freelancer.",
            "Trust was the real constraint. A community hospital site has to feel calm, legible, and dependable, because people arrive at it under stress, not at leisure.",
          ],
        },
        {
          heading: "The foundation first",
          body: [
            "I started underneath the screens, not on them. Before any page, I set the foundation: color, type, spacing, and the surface roles every later decision would inherit from, expressed as semantic, named tokens rather than raw values.",
            "You can see this in the live build itself, where the markup carries semantic token classes like content-secondary, surface-lightest, brand, and content-inverse. That naming is the honest proof of the approach. The site was driven by a named foundation, not styled screen by screen.",
            "Naming the foundation by meaning instead of by appearance is what keeps a whole site consistent. A heading, a quiet caption, or an inverted surface reads the same on every page because each one points back to the same named decision, instead of being reapplied by hand and drifting.",
          ],
        },
        {
          heading: "Components, then pages",
          body: [
            "On that foundation I built the reusable components: the hero, the clinic and facility cards, the doctor cards, schedule blocks, the emergency callout, the navigation, and the contact and location panels. Each one draws from the same tokens, so a card on the home page and a card three pages deep belong to the same family.",
            "Only then did I compose the pages from those parts. The clinic listings, the doctor cards, the schedule rows, and the facility blocks are the same pieces in different arrangements, which is why the site reads as one coherent place rather than a stack of unrelated templates.",
            "Designing components before pages is what let one person cover an entire site. The hard thinking happened once, in the parts, and the pages were composition after that.",
          ],
        },
        {
          heading: "Structure that matches how people search",
          body: [
            "I designed the information structure around what a visitor actually needs to do, then wrote and arranged the content to match, so the words and the navigation were designed together rather than poured in afterward. The home page leads with a hero, the featured specialist clinics, the emergency service (IGD), the doctors, operating hours, location, insurance and BPJS information, and a clear prompt to plan a visit, ordered so the most urgent answers sit nearest the top.",
            "Underneath sit the full pages, mapped to how a patient actually thinks. The specialist clinics (Poli and Spesialis) span areas like internal medicine, obstetrics and gynecology, radiology and imaging, and the clinical laboratory. Then come the supporting and diagnostic facilities (Fasilitas Penunjang), the inpatient rooms (Kamar Rawat Inap), the doctor schedule (Jadwal Dokter), our doctors (Dokter Kami), about (Tentang Kami), promos, an FAQ, and contact and location (Kontak and Lokasi).",
            "Each page answers one clear question, and the home page routes people toward the next step, so someone can go from what do they treat, to which doctor and when, to how do I get there, without guessing where to look.",
          ],
        },
        {
          heading: "Across every device",
          body: [
            "A hospital site is opened far more often on a phone than a desktop, frequently by someone in a waiting room or sitting in a car. So responsive behavior was a first-class part of the design, not a finishing pass.",
            "Because the layout was composed from token-driven components, it adapted cleanly from desktop to mobile instead of merely surviving the shrink. Cards restack, schedules stay readable, and the plan-a-visit and contact details stay reachable without pinching or sideways scrolling.",
            "Designing the components to be responsive from the start meant the same system carried every breakpoint, instead of a separate mobile design drifting away from the desktop one.",
          ],
        },
        {
          heading: "What I would change",
          body: [
            "A doctor schedule and a clinic directory are living content, so the next thing I would push for is a clearer editing model, one that lets the hospital's own staff keep schedules and clinic details current without a designer in the loop.",
            "I would also pressure-test the wayfinding with a few real first-time visitors. The structure reads cleanly to me, but the honest measure of a hospital site is whether a stranger under stress finds the answer on the first try, and that is best learned by watching, not assuming.",
            "The thing I am most confident in is the order of operations: foundation, then components, then pages. Built that way, a whole hospital site held together as one system, and it stays easy to evolve as new clinics, doctors, and pages get added.",
          ],
        },
      ],
    },
  },
  {
    slug: "strata-nexus-site",
    title: "Prompt to production",
    context: "Strata Nexus, an enterprise technology consultancy in Bandung",
    depth: "DEEP DIVE",
    type: "Experiment",
    cover: "/asset/project/strata-cover.webp",
    outcome: "My first vibe-coded site, built with Claude Code and shipped to Vercel",
    mock: false,
    stack: ["Claude Code", "Next.js", "Vercel"],
    stackLabel: "Built with",
    study: {
      lede: "Strata Nexus is a small enterprise technology consultancy in Bandung, and it needed a real landing site: the solutions it offers, its case studies, the team, and the way it delivers. I took it on as my first vibe-coding project, a deliberate piece of research to learn Claude Code and find out whether I could carry something all the way from design intent to a live, deployed site by directing an AI rather than building it by hand. I designed the structure and the content, described what each part needed to do in plain language, let Claude Code build it while I read and steered every step, and then shipped it to Vercel. It is the first thing I took from an empty repo to a public URL on my own.",
      role: "Design and build, solo",
      duration: "Self-initiated, 2026",
      metric: {
        value: "Shipped live",
        label: "a complete multi-section marketing site, designed and vibe-coded with Claude Code, then deployed to Vercel, my first time building this way",
      },
      prototypeUrl: "https://strata-nexus-3bgg.vercel.app/",
      prototypeLabel: "The live site",
      prototypeNote: "The site, deployed on Vercel. Built by prompting Claude Code, my first time working this way.",
      prototypeCta: "Visit the live site",
      sections: [
        {
          heading: "The experiment",
          body: [
            "I can design a site. The open question was whether I could build and ship one by directing an AI instead of handing a file to an engineer. Claude Code was the thing I wanted to learn, so I gave myself a real target instead of a toy: an actual landing site that Strata Nexus needed.",
            "Using real work as the lesson kept me honest. A throwaway demo lets you skip the hard parts. A site that has to go live forces every decision, from the structure down to the empty states.",
          ],
        },
        {
          heading: "Vibe coding, in practice",
          body: [
            "The loop was plain language in, working code out. I described what a section was for and what it had to say, Claude Code built it, and I read the result, kept what was right, and corrected what was not. My judgment stayed on the design: the structure, the hierarchy, what each section had to earn its place. The building is what the AI took off my hands.",
            "It is faster than learning to hand-write all of it, and it is not magic. The model needs a clear intent and someone who can tell good output from plausible output. That gate is the designer's, and it is where most of my time actually went.",
          ],
        },
        {
          heading: "A whole site, not a one-pager",
          body: [
            "The scope was a full marketing site, not a single screen: a hero, the solutions the firm offers, real case studies, the team, a five stage delivery process, an FAQ, and contact. The pieces had to feel like one place, with a consistent structure carried across every section.",
            "Designing it as a system, then composing the pages from shared parts, is the same instinct I bring to product work. Vibe coding just changed who did the assembly.",
          ],
        },
        {
          heading: "Shipping it to Vercel",
          body: [
            "The part that made it real was deployment. Getting it onto Vercel, on a live public URL, is what turned an exercise into a thing that exists. It is one matter to build something on your own machine, and another to put it where anyone can open it.",
            "Owning the work all the way to live, not stopping at a handoff, is exactly what I was after.",
          ],
        },
        {
          heading: "What it taught me",
          body: [
            "This is where my AI-augmented workflow at Reusely started. Once I had shipped a whole site this way, prototyping product features by the same method was a short step, and that loop is now how I work day to day.",
            "It is honestly a first attempt, and it shows its seams in places. What I would change: tighten the structure before prompting so there is less to undo later, and keep treating the AI as a fast builder I direct, never as a substitute for the design decisions that make the thing worth shipping.",
          ],
        },
      ],
    },
  },
  {
    slug: "skulytics-design-system",
    title: "From the foundation up",
    context: "Skulytics, a customer portal",
    depth: "DEEP DIVE",
    type: "Design System",
    cover: "/asset/project/skulytics-cover.webp",
    outcome: "A design system built from the foundation up: tokens, variables, and documented components in Figma",
    mock: false,
    stack: ["Figma variables", "Tokens", "Components"],
    stackLabel: "Built with",
    study: {
      lede: "Skulytics needed a design system its customer portal could grow on, not a set of styles reinvented on every screen. I built it solo in Figma, from the foundation up: a structured set of color, typography, spacing, and elevation tokens as the core layer, then the components on top of them. The colors are organized as primitive scales by hue and elevation, and every semantic token and component references those primitives, so the whole system turns on one set of decisions. Each component is documented with its states, sizes, and variants, so the team can adopt it without guessing.",
      role: "Design systems, solo",
      duration: "Solo, 2026",
      metric: {
        value: "Foundation up",
        label: "a layered token system in Figma, primitive scales to semantic tokens to documented components, built so the customer portal stays consistent as it scales",
      },
      gallery: [
        {
          src: "/asset/project/skulytics-foundation.webp",
          caption: "The foundation: color, type, spacing, and elevation tokens, the core layer",
        },
        {
          src: "/asset/project/skulytics-type.webp",
          caption: "The type scale, documented across sizes and weights in DM Sans",
        },
        {
          src: "/asset/project/skulytics-semantic.webp",
          caption: "Semantic tokens aliased to the primitives by role: surface, text, icon, and border",
        },
        {
          src: "/asset/project/skulytics-component.webp",
          caption: "A documented component: states, sizes, and copy-ready variants",
        },
      ],
      sections: [
        {
          heading: "What it needed",
          body: [
            "Skulytics is a customer portal, and a portal earns trust by being consistent. The brief was a system that could hold that consistency as the product grew, so styles were decided once, in one place, rather than reinvented on every new screen.",
            "That meant starting under the UI, with a real foundation, before drawing a single component.",
          ],
        },
        {
          heading: "The foundation, the core layer",
          body: [
            "I built the foundation first: a structured set of color, typography, spacing, and elevation tokens, all defined in Figma. This is the layer everything else inherits from.",
            "Typography runs on a documented scale, set in DM Sans across weights, so headings, body, and data figures all come from the same system instead of being sized by hand.",
          ],
        },
        {
          heading: "Primitives, then semantics",
          body: [
            "The colors are organized as primitive scales, by hue and by elevation from light to dark. Nothing uses those raw values directly. On top of them sit semantic tokens, named for their role in the UI, surface, text, icon, and border, and for intent like positive, negative, and warning. Components reference the semantic tokens, never the raw hex, which is what lets a single change ripple correctly across the whole system.",
            "Building it on Figma variables means the tokens are real, switchable values rather than notes in a file, so the system can be themed and maintained from one source.",
          ],
        },
        {
          heading: "Components, documented to be used",
          body: [
            "On top of the tokens I built the components, each one documented to be adopted, not decoded. A component like the text input ships with its states, default, focused, and error, its sizes, and its variants for labels, helpers, and icons, alongside a copy-ready version to pull straight into a design.",
            "Documenting the variants and states up front is what turns a component from one person's file into something a team can reuse without asking how it works.",
          ],
        },
        {
          heading: "What I would change",
          body: [
            "Wire the Figma variables to code tokens so design and engineering share one source instead of two that drift. Add short usage and do-not guidance to each component, and version the foundation so changes to the core layer stay deliberate and traceable as the portal grows.",
          ],
        },
      ],
    },
  },
];

export const projectTypes: ProjectType[] = [
  "Ways of Working",
  "Dashboard",
  "Workflow",
  "Design System",
  "Rebrand",
  "Zero-to-One",
  "Experiment",
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
