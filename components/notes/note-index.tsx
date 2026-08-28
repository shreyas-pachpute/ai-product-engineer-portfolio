import { Section, SectionHeader } from "@/components/primitives";
import { NoteIndexRow } from "./note-index-row";
import { NOTES_INDEX_HERO } from "./content";
import { NOTE_THEME_LABELS } from "@/lib/content/notes-schema";
import type { getNotesByTheme } from "@/lib/content/notes";

type NoteIndexProps = {
  groups: ReturnType<typeof getNotesByTheme>;
};

/**
 * The whole point of this page, structurally: grouped by theme, not a
 * reverse-chronological feed. No "latest posts" section, no visible
 * dates on the index itself (each entry's publish date lives on its own
 * page, in NoteMeta) — nothing here signals "newest first" as the
 * organizing idea, because it isn't one.
 */
export function NoteIndex({ groups }: NoteIndexProps) {
  return (
    <Section spacing="lg">
      {/* Left-aligned editorial opener, matching the Work index — see the
          note there on why the two list pages diverge from the centered
          treatment the content pages keep. */}
      <SectionHeader
        align="left"
        headingAs="h1"
        headingSize="display"
        eyebrow={NOTES_INDEX_HERO.eyebrow}
        heading={NOTES_INDEX_HERO.heading}
        subheading={NOTES_INDEX_HERO.sub}
        className="mb-16 md:mb-20"
      />

      <div className="flex max-w-3xl flex-col gap-16">
        {groups.map((group) => (
          <div key={group.theme}>
            {/* The theme label is a real `h2` in the outline — it is what
                a screen reader user navigates the page by — while looking
                like an eyebrow. `Eyebrow` renders a `<p>`, so the element
                is spelled out here rather than reusing it. */}
            <h2 className="eyebrow text-accent-primary-hover mb-6">
              {NOTE_THEME_LABELS[group.theme]}
            </h2>
            <div className="divide-border-subtle divide-y">
              {group.notes.map((note) => (
                <NoteIndexRow key={note.slug} entry={note} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
