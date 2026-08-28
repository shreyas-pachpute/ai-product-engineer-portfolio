import Link from "next/link";
import { Badge, Card, Grid, Heading, Text } from "@/components/primitives";
import type { WorkEntry } from "@/lib/content/work";

type RelatedWorkProps = {
  entries: WorkEntry[];
};

/** "Do not trap users" — every case study ends with a path back into the catalog, same-category entries preferred (see getRelatedWork). */
export function RelatedWork({ entries }: RelatedWorkProps) {
  if (entries.length === 0) return null;

  return (
    <div>
      <Text
        size="caption"
        tone="tertiary"
        mono
        className="mb-6 tracking-[0.15em] uppercase"
      >
        More Work
      </Text>
      <Grid cols={1} colsMd={2} gap="md">
        {entries.map((entry) => (
          <Card
            key={entry.slug}
            as={Link}
            href={`/work/${entry.slug}`}
            variant="raised"
            interactive
            className="group"
          >
            <Badge tone="neutral" size="sm" className="mb-3">
              {entry.category}
            </Badge>
            <Heading
              as="h3"
              size="h3"
              className="ease-feedback group-hover:text-accent-primary mb-2 transition-colors duration-150"
            >
              {entry.title}
            </Heading>
            <Text size="body" tone="secondary">
              {entry.problem}
            </Text>
          </Card>
        ))}
      </Grid>
    </div>
  );
}
