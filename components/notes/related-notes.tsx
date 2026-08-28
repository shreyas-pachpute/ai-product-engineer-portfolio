import Link from "next/link";
import { Badge, Card, Text } from "@/components/primitives";
import { NOTE_TYPE_LABELS } from "@/lib/content/notes-schema";
import type { NoteEntry } from "@/lib/content/notes";

type RelatedNotesProps = {
  entries: NoteEntry[];
};

/** Same theme only (see getRelatedNotes) — continuing to read within one cluster, the same rule NotePager uses for prev/next. */
export function RelatedNotes({ entries }: RelatedNotesProps) {
  if (entries.length === 0) return null;

  return (
    <div>
      <Text
        size="caption"
        tone="tertiary"
        mono
        className="mb-6 tracking-[0.15em] uppercase"
      >
        More on This
      </Text>
      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <Card
            key={entry.slug}
            as={Link}
            href={`/notes/${entry.slug}`}
            variant="raised"
            interactive
            className="group flex items-center justify-between gap-4"
          >
            <div>
              <Text
                size="body"
                tone="primary"
                className="ease-feedback group-hover:text-accent-primary font-medium transition-colors duration-150"
              >
                {entry.title}
              </Text>
              <Text size="caption" tone="tertiary" className="mt-1">
                {entry.summary}
              </Text>
            </div>
            <Badge tone="neutral" size="sm" className="shrink-0">
              {NOTE_TYPE_LABELS[entry.type]}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
