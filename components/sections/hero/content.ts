/**
 * Hero copy, kept as data separate from markup so it can be edited without
 * touching component logic. `neutral` is the pre-interaction default — the
 * persona toggle re-weights the supporting line and CTA emphasis, it
 * doesn't gate a visitor out of coherent copy before they engage with it.
 */

export const HERO_STATUS = "Open to select roles & partnerships";

export const HERO_HEADLINE = {
  lead: "Most AI prototypes never ship.",
  payoff: "I build the ones that do.",
} as const;

export type Persona = "neutral" | "recruiter" | "founder";

export const HERO_SUPPORTING: Record<Persona, string> = {
  neutral:
    "Applied AI engineer and product builder — I turn working models into shipped products: the architecture, the interface, and the business case behind them.",
  recruiter:
    "Full-stack ownership of AI systems — model architecture, production infrastructure, and the evals that keep it honest.",
  founder:
    "I take ambiguous AI ideas to a working product fast, without a team of five to manage.",
};

type CTA = { label: string; href: string };

export const HERO_CTA: Record<Persona, { primary: CTA; secondary: CTA }> = {
  neutral: {
    primary: { label: "View the Work", href: "/work" },
    secondary: { label: "Start a Conversation", href: "/contact" },
  },
  recruiter: {
    primary: { label: "View the Work", href: "/work" },
    secondary: { label: "Get in Touch", href: "/contact" },
  },
  founder: {
    primary: { label: "Start a Project", href: "/contact" },
    secondary: { label: "View the Work", href: "/work" },
  },
};

export const PERSONA_OPTIONS: { value: Persona; label: string }[] = [
  { value: "recruiter", label: "For Recruiters" },
  { value: "founder", label: "For Founders" },
];
