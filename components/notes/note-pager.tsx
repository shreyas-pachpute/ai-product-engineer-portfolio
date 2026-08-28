import Link from "next/link";
import { Text } from "@/components/primitives";
import type { NoteEntry } from "@/lib/content/notes";

type NotePagerProps = {
  previous: NoteEntry | null;
  next: NoteEntry | null;
};

/**
 * Same visual pattern as Work's CaseStudyPager, deliberately re-typed
 * here rather than imported — Notes' adjacency is theme-scoped, Work's is
 * catalog-sequential, different enough in meaning (not just in type)
 * that sharing the component would mean the shared component silently
 * encoding an assumption ("prev/next means X") that isn't true for both
 * collections.
 */
export function NotePager({ previous, next }: NotePagerProps) {
  if (!previous && !next) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {previous ? (
        <Link
          href={`/notes/${previous.slug}`}
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
          href={`/notes/${next.slug}`}
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
