import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { toString as nodeToString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Root, Heading as MdastHeading } from "mdast";

export type TocHeading = {
  id: string;
  text: string;
};

/**
 * Extracts H2s only — H2 is the convention for a case study's major
 * sections (see work-schema.ts), so these are exactly the anchors
 * SectionNav needs. Runs a parse-only pass (no rehype, no compile) purely
 * to walk the heading structure; the actual render pass (with rehype-slug)
 * happens separately in the MDX pipeline.
 *
 * Uses `github-slugger` directly rather than re-deriving IDs some other
 * way — it's the exact package `rehype-slug` uses internally, so a fresh
 * `GithubSlugger` instance here produces byte-identical IDs to what
 * actually ends up in the rendered HTML, which is the only thing that
 * makes SectionNav's `href="#id"` links reliable.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const slugger = new GithubSlugger();
  const headings: TocHeading[] = [];

  visit(tree, "heading", (node: MdastHeading) => {
    if (node.depth !== 2) return;
    const text = nodeToString(node);
    headings.push({ id: slugger.slug(text), text });
  });

  return headings;
}
