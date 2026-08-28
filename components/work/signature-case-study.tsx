import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/primitives";
import { CaseStudyHero } from "@/components/work/case-study-hero";
import { CaseStudyPager } from "@/components/work/case-study-pager";
import { ReadingProgress } from "@/components/work/reading-progress";
import { RelatedWork } from "@/components/work/related-work";
import { SectionNav } from "@/components/work/section-nav";
import { mdxComponents } from "@/components/work/mdx-components";
import { workSerializeOptions } from "@/lib/content/mdx-options";
import type { WorkEntry } from "@/lib/content/work";

type SignatureCaseStudyProps = {
  entry: WorkEntry;
  previous: WorkEntry | null;
  next: WorkEntry | null;
  relatedEntries: WorkEntry[];
};

/**
 * The full treatment: sticky reading-progress bar and a sticky section-nav
 * sidebar alongside the body. The architecture doc's original vision here
 * was a sticky split-screen with the right pane cross-fading between
 * diagrams/code/telemetry synced to scroll position — deliberately not
 * built. That pattern requires a rigid one-visual-per-section content
 * model, which fights the freeform-MDX-plus-embedded-components approach
 * this system is built on, and it forces the reader's eye to split
 * between two panes instead of reading linearly — which is worse, not
 * better, for something meant to read like a design review. Diagrams and
 * decisions live inline, exactly where the prose discusses them, via
 * ArchitectureBlock/DecisionCard/etc.
 */
export function SignatureCaseStudy({
  entry,
  previous,
  next,
  relatedEntries,
}: SignatureCaseStudyProps) {
  return (
    <ReadingProgress>
      <Container size="content" className="pt-16 pb-8 md:pt-20">
        <CaseStudyHero entry={entry} />
      </Container>

      <Container size="content" className="pb-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="mdx-content prose mx-auto w-full max-w-3xl">
            {/* No `prose-invert` — `.mdx-content` in globals.css already
                redefines every `--tw-prose-*` variable against our own
                tokens, so layering Typography's generic invert palette on
                top would just be two sources of truth for the same
                properties. */}
            <MDXRemote
              source={entry.body}
              components={mdxComponents}
              options={workSerializeOptions}
            />
          </div>
          <SectionNav headings={entry.headings} />
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
