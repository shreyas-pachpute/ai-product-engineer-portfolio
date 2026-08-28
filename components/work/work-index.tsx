import { Section, SectionHeader } from "@/components/primitives";
import { WorkIndexRow } from "@/components/work/work-index-row";
import type { WorkEntry } from "@/lib/content/work";

type WorkIndexProps = {
  entries: WorkEntry[];
};

/**
 * Left-aligned at display scale, where this used to be a centered block.
 *
 * The index pages (Work, Notes) are the right place to be editorial: they
 * are lists of writing, and a large ragged-right title over a rule-divided
 * list is how that has looked in print for a century. It also separates
 * them clearly from About/Services/Contact, which stay centered and calm
 * on purpose — so the site now has two distinct page registers instead of
 * one applied everywhere.
 */
export function WorkIndex({ entries }: WorkIndexProps) {
  return (
    <Section spacing="lg">
      <SectionHeader
        align="left"
        headingAs="h1"
        headingSize="display"
        eyebrow="Work"
        heading={<>Systems I&rsquo;ve designed, built, and shipped.</>}
        subheading={
          <>
            Each one is a full engineering review — the problem, the
            architecture, the trade-offs, and what I&rsquo;d do differently.
          </>
        }
        className="mb-16 md:mb-20"
      />

      <div className="divide-border-subtle divide-y">
        {entries.map((entry) => (
          <WorkIndexRow key={entry.slug} entry={entry} />
        ))}
      </div>
    </Section>
  );
}
