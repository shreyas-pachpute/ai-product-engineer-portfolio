import type { ComponentType, SVGProps } from "react";
import {
  AgentsIcon,
  InfraIcon,
} from "@/components/sections/capabilities/icons";
import { DataInvestigationVisual } from "@/components/agents/data-investigation-visual";
import { ResourcePlannerVisual } from "@/components/agents/resource-planner-visual";

/**
 * Same honesty constraint as featured-work/content.ts: no fabricated
 * metrics, no invented outcomes. `value` states what's actually verified
 * (test counts, a real confirmed run) rather than a projected business
 * number these MVPs haven't been used in production long enough to earn.
 *
 * `visual` renders the same real-captured-terminal-output component used
 * on the /agents detail page — not a separate mockup — so the claim in
 * `value` and the panel showing it are the same evidence, not two
 * different levels of polish.
 */

export const FEATURED_AGENTS_EYEBROW = "AI Agents";
export const FEATURED_AGENTS_HEADING = "Live systems, not slide decks.";
export const FEATURED_AGENTS_SUBHEADING =
  "Two agents built end-to-end and verified against real, constructed scenarios — the architecture, the guardrails, and the test suite that backs each claim.";

export type AgentProject = {
  slug: string;
  category: string;
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  visual: ComponentType;
  problem: string;
  approach: string;
  value: string;
  hardPart: string;
};

export const AGENT_PROJECTS: AgentProject[] = [
  {
    slug: "ai-data-investigation",
    category: "Agentic Investigation",
    title: "AI Data Investigation & Root-Cause Agent",
    icon: AgentsIcon,
    visual: DataInvestigationVisual,
    problem:
      "Answering 'why did this metric change' meant an analyst manually hypothesizing, querying, and ruling out explanations — the same investigative loop rebuilt from scratch for every anomaly.",
    approach:
      "A genuinely cyclic hypothesize-query-evaluate-refine agent loop over a guardrailed, read-only SQL tool, with every claim in the final report required to cite a query that actually ran.",
    value:
      "Verified end-to-end on a real incident: correctly diagnosed a pipeline failure as the root cause in 4 LLM calls, with evidence grounding passed — and 22/22 deterministic tests covering the guardrails and detection logic.",
    hardPart:
      "The guardrails, not the reasoning — a single-SELECT-only, table-whitelisted, row-capped, timeout-enforced SQL tool is what makes an iterating agent safe to point at a real warehouse.",
  },
  {
    slug: "ai-resource-planner",
    category: "Deterministic Optimization + AI",
    title: "AI Professional Services Resource Planner",
    icon: InfraIcon,
    visual: ResourcePlannerVisual,
    problem:
      "Staffing decisions trade off skill fit, margin, utilization, and client continuity — a genuine constrained-optimization problem usually solved by memory and spreadsheets, not calculation.",
    approach:
      "A deterministic, auditable weighted scoring engine does the actual optimization; AI is scoped to one narrow, single-pass explanation call per request — no agent loop, no multi-agent negotiation.",
    value:
      "22/22 tests passing, including exact hand-verified scores across four constructed scenarios — and the explanation prompt never receives a raw cost-rate figure at all, so it has nothing to leak.",
    hardPart:
      "Saying no to agentic complexity — the disciplined call here was recognizing this is a solved optimization problem, not reframing it as multiple LLM agents reasoning about it because that sounds more sophisticated.",
  },
];
