import { Badge, Heading, Text } from "@/components/primitives";
import { NoteMeta } from "@/components/notes/note-meta";
import {
  NOTE_THEME_LABELS,
  NOTE_TYPE_LABELS,
} from "@/lib/content/notes-schema";
import type { NoteEntry } from "@/lib/content/notes";

type NoteHeroProps = {
  entry: NoteEntry;
};

export function NoteHero({ entry }: NoteHeroProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mb-4 flex items-center justify-center gap-2">
        <Badge tone="accent" size="sm">
          {NOTE_TYPE_LABELS[entry.type]}
        </Badge>
        <Badge tone="neutral" size="sm">
          {NOTE_THEME_LABELS[entry.theme]}
        </Badge>
      </div>

      <Heading as="h1" size="display" className="mb-6">
        {entry.title}
      </Heading>

      <Text size="lead" tone="secondary" className="mb-8">
        {entry.summary}
      </Text>

      <NoteMeta entry={entry} />
    </div>
  );
}
