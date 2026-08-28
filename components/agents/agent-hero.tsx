import { Badge, Heading, Text } from "@/components/primitives";
import { AgentMeta } from "@/components/agents/agent-meta";
import { AgentLinks } from "@/components/agents/agent-links";
import type { AgentEntry } from "@/lib/content/agents";

type AgentHeroProps = {
  entry: AgentEntry;
};

/** Mirrors components/work/case-study-hero.tsx, minus the tier badge (agents have one template, not two), plus the tech-stack row. */
export function AgentHero({ entry }: AgentHeroProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 flex items-center justify-center gap-2">
        <Badge tone="accent" size="sm">
          {entry.category}
        </Badge>
      </div>

      <Heading as="h1" size="display" className="mb-6">
        {entry.title}
      </Heading>

      <Text size="lead" tone="secondary" className="mb-6">
        {entry.problem}
      </Text>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {entry.stack.map((tech) => (
          <Badge key={tech} tone="neutral" size="sm">
            {tech}
          </Badge>
        ))}
      </div>

      <AgentMeta entry={entry} />
      <AgentLinks entry={entry} />
    </div>
  );
}
