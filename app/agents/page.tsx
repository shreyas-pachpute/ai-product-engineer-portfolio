import type { Metadata } from "next";
import { getAllAgents } from "@/lib/content/agents";
import { AgentIndex } from "@/components/agents";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "AI Agents",
  description:
    "Live, testable AI agents — the architecture, the guardrails, and what's actually verified.",
  path: "/agents",
});

export default function AgentsIndexPage() {
  const entries = getAllAgents();
  return <AgentIndex entries={entries} />;
}
