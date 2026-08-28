import type { ComponentType, SVGProps } from "react";
import {
  AgentsIcon,
  CopilotIcon,
  InfraIcon,
  KnowledgeIcon,
  MultiAgentIcon,
  VoiceIcon,
} from "./icons";

/**
 * Not a tech-stack list. Each entry leads with what a business gets, then
 * earns credibility with one concrete technical detail — never a row of
 * tool badges. Ten example categories were on the table (agents,
 * multi-agent, RAG, copilots, voice, automation, search, knowledge,
 * evals, infra); several are genuinely the same underlying capability
 * from a buyer's perspective (RAG/search/knowledge; evals/infra), so
 * they're merged rather than padded into separate cards.
 */

export const CAPABILITIES_EYEBROW = "Capabilities";
export const CAPABILITIES_HEADING = "What I build.";
export const CAPABILITIES_SUBHEADING =
  "Not a tech stack — the categories of AI product I actually design, build, and ship.";

export type Capability = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  headline: string;
  detail: string;
};

export const CAPABILITIES: Capability[] = [
  {
    icon: AgentsIcon,
    label: "AI Agents & Automation",
    headline: "Systems that take an action, not just a suggestion.",
    detail:
      "Task-executing agents wired into real tools and APIs — the kind that files the ticket or updates the record, with a human able to step in when it matters.",
  },
  {
    icon: MultiAgentIcon,
    label: "Multi-Agent Systems",
    headline: "For when one model can't be trusted with the whole job.",
    detail:
      "Specialized agents that plan, execute, and check each other's work, with explicit handoffs and failure modes — not one prompt hoping for the best.",
  },
  {
    icon: KnowledgeIcon,
    label: "RAG & Knowledge Systems",
    headline: "Answers grounded in what's actually true for your business.",
    detail:
      "Retrieval over your own documents, product data, or support history — hybrid search, reranking, and citations, so the model stops guessing.",
  },
  {
    icon: CopilotIcon,
    label: "AI Copilots",
    headline: "AI that makes an expert faster, not one that replaces them.",
    detail:
      "In-product assistants — streaming responses, inline suggestions, human review — built into the workflow a team already uses, not a bolted-on chat widget.",
  },
  {
    icon: VoiceIcon,
    label: "Voice AI",
    headline: "Conversations that don't feel like a phone tree.",
    detail:
      "Low-latency voice pipelines — real-time inference and natural turn-taking — for support, intake, or hands-free workflows.",
  },
  {
    icon: InfraIcon,
    label: "Evaluation & AI Infrastructure",
    headline: "The unglamorous layer that decides what's safe to ship.",
    detail:
      "Benchmarks, guardrails, cost monitoring, and observability — the infrastructure that catches a regression before a customer does.",
  },
];
