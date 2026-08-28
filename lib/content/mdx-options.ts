import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

type WorkSerializeOptions = NonNullable<MDXRemoteProps["options"]>;

/**
 * Shared MDX render options for both case-study tiers — one definition so
 * Signature and Build Log can never silently drift out of sync.
 *
 * `blockJS: false` is the deliberate, load-bearing part of this file.
 * next-mdx-remote defaults to stripping JS expressions from MDX
 * (`blockJS: true`) as an XSS guard for untrusted content — e.g. a CMS
 * where third parties submit MDX. That threat model doesn't apply here:
 * every file in content/work/ is authored by the site owner and committed
 * to this repo, the same trust level as any other source file. Left at
 * the default, it silently strips array/object JSX attribute expressions
 * — `<ArchitectureBlock steps={[...]} />`, `<Timeline items={[...]} />` —
 * turning them into `undefined` with no compile-time warning. That
 * doesn't surface as an error until a component actually renders and
 * calls `.map()` on the now-missing prop, which is exactly the crash this
 * setting exists to prevent here.
 *
 * - remark-gfm: tables, strikethrough, task lists in case-study prose.
 * - rehype-slug: adds the heading `id`s that SectionNav's anchor links
 *   depend on (see lib/content/toc.ts for why it has to be this exact
 *   package, not a hand-rolled slugifier).
 * - rehype-pretty-code: server-side Shiki syntax highlighting — code
 *   blocks ship as static, pre-colored HTML, no client-side highlighter.
 */
export const workSerializeOptions: WorkSerializeOptions = {
  blockJS: false,
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: "one-dark-pro" }]],
  },
};
