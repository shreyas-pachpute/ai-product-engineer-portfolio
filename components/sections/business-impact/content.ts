import type { ComponentType, SVGProps } from "react";
import {
  ArchitectureIcon,
  DeploymentIcon,
  EconomicsIcon,
  IterationIcon,
  ProblemIcon,
  ReliabilityIcon,
} from "./stage-icons";

/**
 * The architecture doc's original Business Impact section paired prose
 * with "animated metric charts and token-cost bar comparisons" — which,
 * like the original Proof Bar, assumed real project numbers that don't
 * exist yet. Charting fabricated data here would be worse than doing it
 * in the Proof Bar: this section's entire job is proving business
 * judgment, and a founder or CTO reading a chart with invented numbers
 * would correctly conclude the opposite.
 *
 * So this doesn't chart outcomes — it walks the six-stage loop every AI
 * product actually goes through, pairing each engineering concern with
 * its business consequence. That loop is true regardless of which project
 * it's describing, which is the point: it's evidence of how someone
 * thinks, not a claim about what they've measured.
 */

export const BUSINESS_IMPACT_EYEBROW = "How This Gets Built";
export const BUSINESS_IMPACT_HEADING = "The model is never the hard part.";
export const BUSINESS_IMPACT_SUBHEADING =
  "Cost, latency, reliability, and adoption are — and they get decided in the architecture, not after launch.";

export type Stage = {
  index: number;
  number: string;
  title: string;
  headline: string;
  detail: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const STAGES: Stage[] = [
  {
    index: 0,
    number: "01",
    title: "Problem",
    headline:
      "Every system starts with what the problem actually costs — not with which model is trending.",
    detail:
      "Before any architecture decision, the question is what's slow, manual, or inconsistent today, and what fixing it is actually worth.",
    icon: ProblemIcon,
  },
  {
    index: 1,
    number: "02",
    title: "Architecture",
    headline: "The model is one component, not the whole product.",
    detail:
      "Retrieval, orchestration, and the interface around the model usually decide the outcome more than which model answers the prompt.",
    icon: ArchitectureIcon,
  },
  {
    index: 2,
    number: "03",
    title: "Economics",
    headline:
      "Latency is a UX decision. Cost is a business decision. Both get made at design time.",
    detail:
      "Model choice, caching, and prompt size are sized against a target response time and a per-request budget — before launch, not after the first invoice.",
    icon: EconomicsIcon,
  },
  {
    index: 3,
    number: "04",
    title: "Reliability",
    headline: "Trust is designed in, not hoped for.",
    detail:
      "Schema-constrained outputs, eval suites, and fallback paths catch failure before a customer does.",
    icon: ReliabilityIcon,
  },
  {
    index: 4,
    number: "05",
    title: "Deployment",
    headline: "Shipping is the start of the feedback, not the finish line.",
    detail:
      "Telemetry, cost dashboards, and error tracking go live with the product, not after something breaks.",
    icon: DeploymentIcon,
  },
  {
    index: 5,
    number: "06",
    title: "Iteration",
    headline: "Production data becomes the next version's spec.",
    detail:
      "Usage, edge cases, and eval failures feed straight back into the roadmap — the loop closes, and the next iteration starts smarter.",
    icon: IterationIcon,
  },
];
