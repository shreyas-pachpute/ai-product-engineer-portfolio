import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { ArchitectureBlock } from "@/components/work/mdx/architecture-block";
import { Callout } from "@/components/work/mdx/callout";
import { DecisionCard } from "@/components/work/mdx/decision-card";
import { MediaBlock } from "@/components/work/mdx/media-block";
import { Metrics } from "@/components/work/mdx/metrics";
import { Pre } from "@/components/work/mdx/pre";
import { Timeline } from "@/components/work/mdx/timeline";

/**
 * Every case study is rendered with @tailwindcss/typography's `prose`
 * class (see globals.css `.mdx-content`), which already styles headings,
 * paragraphs, lists, blockquotes, links, and tables correctly — so those
 * elements are deliberately NOT re-mapped here. This object only
 * overrides `pre` (to add the copy button) and registers the shared
 * embeddable components as MDX-usable tags: `<Callout>`, `<DecisionCard>`,
 * `<ArchitectureBlock>`, `<Timeline>`, `<Metrics>`, `<MediaBlock>`, written
 * directly in case-study .mdx source wherever the narrative calls for
 * them.
 */
export const mdxComponents: NonNullable<MDXRemoteProps["components"]> = {
  pre: Pre,
  Callout,
  DecisionCard,
  ArchitectureBlock,
  Timeline,
  Metrics,
  MediaBlock,
};
