import Link from "next/link";
import { Text } from "@/components/primitives";
import type { WorkEntry } from "@/lib/content/work";

type CaseStudyPagerProps = {
  previous: WorkEntry | null;
  next: WorkEntry | null;
};

/** Sequential prev/next through the catalog — alongside RelatedWork (category-based), gives every reader more than one way to keep going instead of ending on a dead page. */
export function CaseStudyPager({ previous, next }: CaseStudyPagerProps) {
  if (!previous && !next) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {previous ? (
        <Link
          href={`/work/${previous.slug}`}
          className="group border-border-subtle ease-feedback hover:border-border-highlight rounded-md border p-5 transition-colors duration-150"
        >
          <Text size="caption" tone="tertiary" className="mb-1">
            ← Previous
          </Text>
          <Text
            size="body"
            tone="primary"
            className="ease-feedback group-hover:text-accent-primary font-medium transition-colors duration-150"
          >
            {previous.title}
          </Text>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/work/${next.slug}`}
          className="group border-border-subtle ease-feedback hover:border-border-highlight rounded-md border p-5 text-right transition-colors duration-150"
        >
          <Text size="caption" tone="tertiary" className="mb-1">
            Next →
          </Text>
          <Text
            size="body"
            tone="primary"
            className="ease-feedback group-hover:text-accent-primary font-medium transition-colors duration-150"
          >
            {next.title}
          </Text>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
