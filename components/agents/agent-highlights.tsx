import { Card, Eyebrow, Text } from "@/components/primitives";
import type { AgentEntry } from "@/lib/content/agents";

type AgentHighlightsProps = {
  entry: AgentEntry;
};

/**
 * A short, verifiable proof strip between the hero and the MDX body — real,
 * checkable facts only (test counts, guardrail behavior, a verified run),
 * never a vanity metric with no source. This is the one new block agents
 * have that case studies don't: the equivalent of "show me it actually
 * works," not just "here's how it was built."
 */
export function AgentHighlights({ entry }: AgentHighlightsProps) {
  return (
    <Card variant="outline" padding="lg" className="mx-auto max-w-3xl">
      <Eyebrow tone="tertiary" className="mb-4">
        Verified, not claimed
      </Eyebrow>
      <ul className="flex flex-col gap-3">
        {entry.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-3">
            <span
              aria-hidden="true"
              className="bg-accent-primary mt-2 size-1.5 shrink-0 rounded-full"
            />
            <Text size="body" tone="secondary">
              {highlight}
            </Text>
          </li>
        ))}
      </ul>
    </Card>
  );
}
