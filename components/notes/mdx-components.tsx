import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { ArchitectureBlock } from "@/components/work/mdx/architecture-block";
import { Callout } from "@/components/work/mdx/callout";
import { DecisionCard } from "@/components/work/mdx/decision-card";
import { MediaBlock } from "@/components/work/mdx/media-block";
import { Metrics } from "@/components/work/mdx/metrics";
import { Pre } from "@/components/work/mdx/pre";
import { Timeline } from "@/components/work/mdx/timeline";
import { Reference } from "./mdx/reference";

/**
 * `ArchitectureBlock`, `Callout`, `DecisionCard`, `MediaBlock`, `Metrics`,
 * `Pre`, and `Timeline` are imported directly from components/work/mdx —
 * not duplicated. Every one of them is already content-agnostic (they
 * take props, not Work-specific data), so a Review or Report note gets
 * the exact same diagram/decision/metrics components a case study does.
 * This is the same cross-folder reuse pattern already established
 * (Featured Work and Work's own icon registry both import Capabilities'
 * icons directly rather than redrawing them).
 *
 * `Reference` is the one genuinely new component this content type
 * needed — citations, which Work's case studies never did.
 *
 * Same @tailwindcss/typography `prose` styling as Work handles headings,
 * paragraphs, lists, blockquotes, tables, and — new here — footnotes
 * (native GFM syntax via remark-gfm) and equations (remark-math +
 * rehype-katex), so none of those need a component mapping either.
 */
export const noteMdxComponents: NonNullable<MDXRemoteProps["components"]> = {
  pre: Pre,
  Callout,
  DecisionCard,
  ArchitectureBlock,
  Timeline,
  Metrics,
  MediaBlock,
  Reference,
};
