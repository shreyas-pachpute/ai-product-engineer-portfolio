import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { workFrontmatterSchema, type WorkFrontmatter } from "./work-schema";
import { extractHeadings, type TocHeading } from "./toc";

/**
 * Filesystem-backed content collection. Node APIs (`fs`, `path`) mean this
 * module must only ever be imported from Server Components — it will
 * break the client bundle if a "use client" file imports it.
 *
 * This is the whole point of the content model: adding project #4 is
 * "drop a new .mdx file in content/work/" — nothing here, and no React
 * component, needs to change.
 */

const WORK_DIR = path.join(process.cwd(), "content", "work");

export type WorkEntry = WorkFrontmatter & {
  slug: string;
  body: string;
  readingTime: string;
  headings: TocHeading[];
};

function readEntry(filename: string): WorkEntry {
  const slug = filename.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(WORK_DIR, filename), "utf-8");
  const { data, content } = matter(raw);

  const frontmatter = workFrontmatterSchema.parse(data);

  return {
    ...frontmatter,
    slug,
    body: content,
    readingTime: readingTime(content).text,
    headings: extractHeadings(content),
  };
}

let entriesCache: WorkEntry[] | null = null;

function loadEntries(): WorkEntry[] {
  if (entriesCache) return entriesCache;

  const filenames = fs
    .readdirSync(WORK_DIR)
    .filter((filename) => filename.endsWith(".mdx"));

  entriesCache = filenames
    .map(readEntry)
    .sort(
      (a, b) => b.order - a.order || b.publishedAt.localeCompare(a.publishedAt),
    );

  return entriesCache;
}

export function getAllWork(): WorkEntry[] {
  return loadEntries();
}

export function getWorkBySlug(slug: string): WorkEntry | undefined {
  return loadEntries().find((entry) => entry.slug === slug);
}

export function getAdjacentWork(slug: string): {
  previous: WorkEntry | null;
  next: WorkEntry | null;
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

/** Same category first, then whatever's left, excluding the current entry. */
export function getRelatedWork(slug: string, limit = 2): WorkEntry[] {
  const all = loadEntries();
  const current = all.find((entry) => entry.slug === slug);
  if (!current) return [];

  const others = all.filter((entry) => entry.slug !== slug);
  const sameCategory = others.filter(
    (entry) => entry.category === current.category,
  );
  const rest = others.filter((entry) => entry.category !== current.category);

  return [...sameCategory, ...rest].slice(0, limit);
}
