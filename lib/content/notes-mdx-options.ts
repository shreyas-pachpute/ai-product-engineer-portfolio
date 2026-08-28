import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

type NotesSerializeOptions = NonNullable<MDXRemoteProps["options"]>;

/**
 * Work's `workSerializeOptions` (lib/content/mdx-options.ts) covers
 * remark-gfm + rehype-slug + rehype-pretty-code + `blockJS: false` —
 * everything here needs those too, plus math. Written as its own
 * complete object rather than spreading Work's and appending to it:
 * `remarkPlugins`/`rehypePlugins` are arrays, and "spread the base config
 * and concat two more plugins onto its arrays" is more indirection than
 * four repeated lines are worth for a config object that isn't logic.
 *
 * `blockJS: false` carries forward for the exact reason documented in
 * Work's version: array/object JSX attribute expressions
 * (`items={[...]}`) get silently stripped to `undefined` at the default
 * `blockJS: true`, which is an XSS guard meant for untrusted content —
 * content/notes/*.mdx is authored by the site owner, same trust level as
 * content/work/*.mdx.
 *
 * remark-math + rehype-katex add `$inline$` and `$$block$$` equation
 * syntax; the KaTeX stylesheet these render against is imported once in
 * app/notes/layout.tsx, not per-page.
 */
export const notesSerializeOptions: NotesSerializeOptions = {
  blockJS: false,
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [rehypePrettyCode, { theme: "one-dark-pro" }],
    ],
  },
};
