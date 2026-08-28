import { Badge, Heading, Text } from "@/components/primitives";
import { CaseStudyMeta } from "@/components/work/case-study-meta";
import { CaseStudyLinks } from "@/components/work/case-study-links";
import type { WorkEntry } from "@/lib/content/work";

type CaseStudyHeroProps = {
  entry: WorkEntry;
};

export function CaseStudyHero({ entry }: CaseStudyHeroProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 flex items-center justify-center gap-2">
        <Badge tone="neutral" size="sm">
          {entry.category}
        </Badge>
        <Badge
          tone={entry.tier === "signature" ? "accent" : "neutral"}
          size="sm"
        >
          {entry.tier === "signature" ? "Deep Dive" : "Build Log"}
        </Badge>
      </div>

      <Heading as="h1" size="display" className="mb-6">
        {entry.title}
      </Heading>

      <Text size="lead" tone="secondary" className="mb-8">
        {entry.problem}
      </Text>

      <CaseStudyMeta entry={entry} />
      <CaseStudyLinks entry={entry} />
    </div>
  );
}
