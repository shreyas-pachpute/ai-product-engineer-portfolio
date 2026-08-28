import Link from "next/link";
import { Badge, Heading, Text } from "@/components/primitives";
import { NOTE_TYPE_LABELS } from "@/lib/content/notes-schema";
import type { NoteEntry } from "@/lib/content/notes";

type NoteIndexRowProps = {
  entry: NoteEntry;
};

export function NoteIndexRow({ entry }: NoteIndexRowProps) {
  return (
    <Link
      href={`/notes/${entry.slug}`}
      className="group ease-feedback flex items-start justify-between gap-6 py-6 transition-colors duration-150 first:pt-0"
    >
      <div className="min-w-0 flex-1">
        <Heading
          as="h3"
          size="h3"
          className="ease-feedback group-hover:text-accent-primary mb-2 transition-colors duration-150"
        >
          {entry.title}
        </Heading>
        <Text size="body" tone="secondary" className="max-w-xl">
          {entry.summary}
        </Text>
      </div>
      <Badge tone="neutral" size="sm" className="mt-1 shrink-0">
        {NOTE_TYPE_LABELS[entry.type]}
      </Badge>
    </Link>
  );
}
