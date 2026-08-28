import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/primitives";
import { ReadingProgress } from "@/components/work/reading-progress";
import { SectionNav } from "@/components/work/section-nav";
import { NoteHero } from "./note-hero";
import { NotePager } from "./note-pager";
import { RelatedNotes } from "./related-notes";
import { noteMdxComponents } from "./mdx-components";
import { notesSerializeOptions } from "@/lib/content/notes-mdx-options";
import type { NoteEntry } from "@/lib/content/notes";

type NoteArticleProps = {
  entry: NoteEntry;
  previous: NoteEntry | null;
  next: NoteEntry | null;
  relatedEntries: NoteEntry[];
};

/**
 * One layout for all four note types — unlike Work's Signature/Build Log
 * split, whether the section-nav sidebar appears isn't an author-set
 * field, it's derived from the content itself: three or more H2s and a
 * visitor gets a table of contents, fewer and they don't. A short Note
 * doesn't need a sidebar pointing at one heading, and a long Report
 * shouldn't need its author to remember to opt into navigation for it —
 * the document's own shape decides.
 */
export function NoteArticle({
  entry,
  previous,
  next,
  relatedEntries,
}: NoteArticleProps) {
  const showSectionNav = entry.headings.length >= 3;

  return (
    <ReadingProgress>
      <Container size="content" className="pt-16 pb-8 md:pt-20">
        <NoteHero entry={entry} />
      </Container>

      <Container size="content" className="pb-20">
        {showSectionNav ? (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="mdx-content prose mx-auto w-full max-w-3xl">
              <MDXRemote
                source={entry.body}
                components={noteMdxComponents}
                options={notesSerializeOptions}
              />
            </div>
            <SectionNav headings={entry.headings} />
          </div>
        ) : (
          <div className="mdx-content prose mx-auto max-w-2xl">
            <MDXRemote
              source={entry.body}
              components={noteMdxComponents}
              options={notesSerializeOptions}
            />
          </div>
        )}
      </Container>

      <Container
        size="content"
        className="border-border-subtle flex flex-col gap-16 border-t pt-16 pb-24"
      >
        <NotePager previous={previous} next={next} />
        <RelatedNotes entries={relatedEntries} />
      </Container>
    </ReadingProgress>
  );
}
