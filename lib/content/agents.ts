import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { agentFrontmatterSchema, type AgentFrontmatter } from "./agents-schema";
import { extractHeadings, type TocHeading } from "./toc";

/**
 * Filesystem-backed content collection, mirroring lib/content/work.ts
 * exactly. Node APIs mean this must only ever be imported from Server
 * Components. Adding agent project #3 is "drop a new .mdx file in
 * content/agents/" — nothing here, and no React component, needs to change.
 */

const AGENTS_DIR = path.join(process.cwd(), "content", "agents");

export type AgentEntry = AgentFrontmatter & {
  slug: string;
  body: string;
  readingTime: string;
  headings: TocHeading[];
};

function readEntry(filename: string): AgentEntry {
  const slug = filename.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(AGENTS_DIR, filename), "utf-8");
  const { data, content } = matter(raw);

  const frontmatter = agentFrontmatterSchema.parse(data);

  return {
    ...frontmatter,
    slug,
    body: content,
    readingTime: readingTime(content).text,
    headings: extractHeadings(content),
  };
}

let entriesCache: AgentEntry[] | null = null;

function loadEntries(): AgentEntry[] {
  if (entriesCache) return entriesCache;

  const filenames = fs
    .readdirSync(AGENTS_DIR)
    .filter((filename) => filename.endsWith(".mdx"));

  entriesCache = filenames
    .map(readEntry)
    .sort(
      (a, b) => b.order - a.order || b.publishedAt.localeCompare(a.publishedAt),
    );

  return entriesCache;
}

export function getAllAgents(): AgentEntry[] {
  return loadEntries();
}

export function getAgentBySlug(slug: string): AgentEntry | undefined {
  return loadEntries().find((entry) => entry.slug === slug);
}

export function getAdjacentAgents(slug: string): {
  previous: AgentEntry | null;
  next: AgentEntry | null;
} {
  const all = loadEntries();
  const index = all.findIndex((entry) => entry.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? all[index - 1]! : null,
    next: index < all.length - 1 ? all[index + 1]! : null,
  };
}
