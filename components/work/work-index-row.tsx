import Link from "next/link";
import {
  ArrowUpRightIcon,
  Badge,
  Heading,
  IconWrapper,
  Text,
} from "@/components/primitives";
import { workIconRegistry } from "@/components/work/icon-registry";
import type { WorkEntry } from "@/lib/content/work";

type WorkIndexRowProps = {
  entry: WorkEntry;
};

/**
 * A catalog row, not a thumbnail card — full title at real size, the full
 * problem statement, real breathing room. Deliberately not a grid: a grid
 * of small cards is what a "gallery" looks like, and the brief was
 * explicit that this shouldn't read as one.
 */
export function WorkIndexRow({ entry }: WorkIndexRowProps) {
  const Icon = workIconRegistry[entry.icon];

  return (
    <Link
      href={`/work/${entry.slug}`}
      className="group ease-feedback flex items-start gap-5 py-8 transition-colors duration-150 first:pt-0 md:gap-8 md:py-10"
    >
      <IconWrapper
        variant="tile"
        tone="neutral"
        size="lg"
        className="ease-feedback group-hover:text-accent-primary mt-1 hidden shrink-0 transition-colors duration-150 sm:flex"
      >
        <Icon className="size-6" />
      </IconWrapper>

      <div className="min-w-0 flex-1">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="neutral" size="sm">
            {entry.category}
          </Badge>
          {entry.tier === "signature" && (
            <Badge tone="accent" size="sm">
              Deep Dive
            </Badge>
          )}
        </div>

        <Heading
          as="h2"
          size="h1"
          className="ease-feedback group-hover:text-accent-primary mb-3 transition-colors duration-150"
        >
          {entry.title}
        </Heading>

        <Text size="lead" tone="secondary" className="mb-4 max-w-2xl">
          {entry.problem}
        </Text>

        <div className="text-caption text-text-tertiary flex items-center gap-3">
          <span>{entry.readingTime}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.timeline}</span>
        </div>
      </div>

      <ArrowUpRightIcon className="text-text-tertiary ease-feedback group-hover:text-accent-primary mt-4 size-6 shrink-0 transition-colors duration-150" />
    </Link>
  );
}
