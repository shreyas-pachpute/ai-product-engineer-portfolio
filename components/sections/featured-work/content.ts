import type { ComponentType, SVGProps } from "react";
import {
  CopilotIcon,
  KnowledgeIcon,
  VoiceIcon,
} from "@/components/sections/capabilities/icons";
import {
  DocumentIntelligenceVisual,
  SupportCopilotVisual,
  VoiceOrderingVisual,
} from "./project-visuals";

/**
 * No fabricated company names, no invented global metrics, no claimed
 * completed engagements — the same honesty constraint as the Proof Bar
 * and Business Impact sections, and the same one the linked case studies
 * in content/work/*.mdx already hold themselves to (qualitative
 * before/after framing, not invented percentages). `value` stays
 * consistent with that: confident and specific about mechanism, without
 * asserting a headline number the case study itself doesn't claim.
 *
 * Icons are reused directly from Capabilities (not redrawn) — Document
 * Intelligence is a RAG/knowledge system, the Support system is a
 * copilot, the ordering system is voice — so the same mark means the same
 * thing in both sections instead of inventing a parallel icon set.
 *
 * `visual` renders a coded product mockup (see project-visuals.tsx) —
 * there's no real screenshot to show yet, so these are illustrative
 * panels of the actual mechanism each case study describes, not generic
 * decoration.
 *
 * `slug` maps directly to the real content/work/<slug>.mdx case study —
 * every card link below resolves to an actual route.
 */

export const FEATURED_WORK_EYEBROW = "Featured Work";
export const FEATURED_WORK_HEADING = "What that looks like, applied.";
export const FEATURED_WORK_SUBHEADING =
  "Three production systems — the architecture, the interface, and the mechanism that makes each one trustworthy enough to run unattended.";

export type Project = {
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

export const PROJECTS: Project[] = [
  {
    slug: "document-intelligence-pipeline",
    category: "RAG & Knowledge",
    title: "Document Intelligence Pipeline",
    icon: KnowledgeIcon,
    visual: DocumentIntelligenceVisual,
    problem:
      "Manual review was the bottleneck — hours of reading to pull structured data out of unstructured PDFs and scans.",
    approach:
      "Layout-aware parsing feeds a schema-constrained extraction model, with a confidence threshold routing uncertain fields to a human instead of a guess.",
    value:
      "Cuts review time to minutes on the documents the model is confident about, without removing the human from the ones it isn't.",
    hardPart:
      "The extraction schema and confidence routing are what make it reliable enough to run unattended — not the model choice.",
  },
  {
    slug: "multi-agent-support-copilot",
    category: "Multi-Agent System",
    title: "Multi-Agent Support Copilot",
    icon: CopilotIcon,
    visual: SupportCopilotVisual,
    problem:
      "Every support ticket needed context pulled from five different systems before an agent could even start answering.",
    approach:
      "A planner agent decomposes the request, specialized retrieval agents pull from each system in parallel, and a synthesis step drafts a response a human reviews before it sends.",
    value:
      "First-response time drops from minutes of context-gathering to seconds, with a human still the last checkpoint on anything customer-facing.",
    hardPart:
      "Explicit handoffs and a synthesis-then-review step — not one agent with every tool bolted on.",
  },
  {
    slug: "real-time-voice-ordering",
    category: "Voice AI",
    title: "Real-Time Voice Ordering",
    icon: VoiceIcon,
    visual: VoiceOrderingVisual,
    problem:
      "Phone orders meant a hold queue or a rigid IVR menu — customers hung up on both.",
    approach:
      "A low-latency speech pipeline with barge-in support feeds a structured-output layer that turns natural conversation directly into a validated order.",
    value:
      "Orders get taken at any hour without a queue, and without sounding like a phone tree.",
    hardPart:
      "Turn-taking and barge-in handling — the parts that make it feel like a conversation, not a transcription pipeline with a voice bolted on.",
  },
];
