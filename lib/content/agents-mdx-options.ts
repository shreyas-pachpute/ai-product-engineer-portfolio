import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

type AgentSerializeOptions = NonNullable<MDXRemoteProps["options"]>;

/**
 * Mirrors lib/content/mdx-options.ts verbatim — kept as a separate file
 * (same pattern as notes-mdx-options.ts existing separately from
 * mdx-options.ts) so each content collection can evolve its render
 * options independently.
 *
 * `blockJS: false` is load-bearing here too: every file in content/agents/
 * is authored by the site owner, the same trust level as any other source
 * file, and the default `blockJS: true` silently strips the array/object
 * JSX props ArchitectureBlock/Timeline/Metrics depend on.
 */
export const agentSerializeOptions: AgentSerializeOptions = {
  blockJS: false,
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: "one-dark-pro" }]],
  },
};
