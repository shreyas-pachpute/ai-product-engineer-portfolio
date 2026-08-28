import type { ComponentType, SVGProps } from "react";
import {
  AgentsIcon,
  CopilotIcon,
  InfraIcon,
  KnowledgeIcon,
  MultiAgentIcon,
  VoiceIcon,
} from "@/components/sections/capabilities/icons";
import type { WorkIconKey } from "@/lib/content/work-schema";

/** Maps frontmatter's `icon` string key to the actual icon component — same marks as Capabilities/Featured Work, not a parallel icon set. */
export const workIconRegistry: Record<
  WorkIconKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  agents: AgentsIcon,
  multiAgent: MultiAgentIcon,
  knowledge: KnowledgeIcon,
  copilot: CopilotIcon,
  voice: VoiceIcon,
  infra: InfraIcon,
};
