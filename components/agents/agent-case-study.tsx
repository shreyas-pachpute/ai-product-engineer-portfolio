import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/primitives";
import { AgentHero } from "@/components/agents/agent-hero";
import { AgentHighlights } from "@/components/agents/agent-highlights";
import { ReadingProgress } from "@/components/work/reading-progress";
import { mdxComponents } from "@/components/work/mdx-components";
import { agentSerializeOptions } from "@/lib/content/agents-mdx-options";
import type { AgentEntry } from "@/lib/content/agents";

type AgentCaseStudyProps = {
  entry: AgentEntry;
};

/**
 * Mirrors components/work/signature-case-study.tsx, simplified: no TOC
 * sidebar, no pager, no related-entries rail — not worth the complexity
 * at two entries. `ReadingProgress` and `mdxComponents` are reused
 * directly from components/work/* since both are content-agnostic.
 */
export function AgentCaseStudy({ entry }: AgentCaseStudyProps) {
  return (
    <ReadingProgress>
      <Container size="content" className="pt-16 pb-8 md:pt-20">
        <AgentHero entry={entry} />
      </Container>

      <Container size="content" className="pb-12">
        <AgentHighlights entry={entry} />
      </Container>

      <Container size="content" className="pb-24">
        <div className="mdx-content prose mx-auto w-full max-w-3xl">
          <MDXRemote
            source={entry.body}
            components={mdxComponents}
            options={agentSerializeOptions}
          />
        </div>
      </Container>
    </ReadingProgress>
  );
}
