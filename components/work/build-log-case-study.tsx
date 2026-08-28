import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/primitives";
import { CaseStudyHero } from "@/components/work/case-study-hero";
import { CaseStudyPager } from "@/components/work/case-study-pager";
import { ReadingProgress } from "@/components/work/reading-progress";
import { RelatedWork } from "@/components/work/related-work";
import { mdxComponents } from "@/components/work/mdx-components";
import { workSerializeOptions } from "@/lib/content/mdx-options";
import type { WorkEntry } from "@/lib/content/work";

type BuildLogCaseStudyProps = {
  entry: WorkEntry;
  previous: WorkEntry | null;
  next: WorkEntry | null;
  relatedEntries: WorkEntry[];
};

/**
 * The lighter tier: same hero, same reading-progress bar, same embedded
 * components available in the body — but no SectionNav sidebar and a
 * single-column layout. A build log is short enough that a table of
 * contents would be clutter pointing at three headings, not navigation.
 */
export function BuildLogCaseStudy({
  entry,
  previous,
  next,
  relatedEntries,
}: BuildLogCaseStudyProps) {
  return (
    <ReadingProgress>
      <Container size="content" className="pt-16 pb-8 md:pt-20">
        <CaseStudyHero entry={entry} />
      </Container>

      <Container size="content" className="pb-20">
        <div className="mdx-content prose mx-auto max-w-3xl">
          <MDXRemote
            source={entry.body}
            components={mdxComponents}
            options={workSerializeOptions}
          />
        </div>
      </Container>

      <Container
        size="content"
        className="border-border-subtle flex flex-col gap-16 border-t pt-16 pb-24"
      >
        <CaseStudyPager previous={previous} next={next} />
        <RelatedWork entries={relatedEntries} />
      </Container>
    </ReadingProgress>
  );
}
