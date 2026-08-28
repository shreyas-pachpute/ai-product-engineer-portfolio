/**
 * The architecture doc's original Proof Bar assumed real, citable numbers
 * ("99.4% retrieval precision", "$1.2M generated") would exist by the time
 * this section shipped. They don't yet, and a portfolio built for
 * technical reviewers who evaluate claims for a living is the worst
 * possible place to guess at plausible-sounding stats.
 *
 * So this section proves credibility a different way: not through claimed
 * outcomes, but through the specificity of the standards a system gets
 * held to before it ships. That specificity is itself hard to fake —
 * someone who hasn't actually built production AI systems doesn't
 * casually write "priced per request before it ships." When real,
 * citable project metrics exist, individual cards here can carry an
 * actual number without changing this shape at all — the type stays the
 * same, only the `detail` copy would cite the project.
 */

export const PROOF_EYEBROW = "Operating Standards";
export const PROOF_HEADING = "Every system clears these before it ships.";

export type Standard = {
  label: string;
  statement: string;
  detail: string;
  href: string;
};

export const STANDARDS: Standard[] = [
  {
    label: "Evals",
    statement: "Ships against a benchmark, not a demo.",
    detail:
      "Retrieval, generation, and agent output are scored before launch — regressions get caught in testing, not by users.",
    href: "/work",
  },
  {
    label: "Latency",
    statement: "Sub-second, or it isn't done.",
    detail:
      "Streaming responses, edge inference, and prompt compression are architecture decisions, not a post-launch optimization pass.",
    href: "/work",
  },
  {
    label: "Unit Economics",
    statement: "Priced per request before it ships.",
    detail:
      "Token spend, caching strategy, and model choice are sized against the business case, not discovered on the first invoice.",
    href: "/work",
  },
  {
    label: "Guardrails",
    statement: "Constrained outputs, not hopeful prompts.",
    detail:
      "Schema validation, fallback logic, and human checkpoints are part of the design — not a patch added after something breaks.",
    href: "/work",
  },
];
