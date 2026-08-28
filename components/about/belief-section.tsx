import { Heading, Text } from "@/components/primitives";
import type { Belief } from "./content";

type BeliefSectionProps = {
  belief: Belief;
};

/**
 * No label, no generic "heading" above a paragraph — the belief reversal
 * itself (the "was" premise in muted tone, the "now" conclusion in full
 * emphasis, both inside one h2) is the heading. Deliberately unnumbered
 * and undivided from its neighbors by rules, unlike every other
 * section-based page on this site — this is meant to read as one
 * continuous essay, not a sequence of documentation entries.
 */
export function BeliefSection({ belief }: BeliefSectionProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Heading as="h2" size="h1" className="mb-4 text-balance">
        <span className="text-text-tertiary">{belief.was}</span>{" "}
        <span className="text-text-primary">{belief.now}</span>
      </Heading>
      <Text size="lead" tone="secondary">
        {belief.elaboration}
      </Text>
    </div>
  );
}
