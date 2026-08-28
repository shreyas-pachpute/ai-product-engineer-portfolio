import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import {
  noteFrontmatterSchema,
  NOTE_THEMES,
  type NoteFrontmatter,
  type NoteTheme,
} from "./notes-schema";
import { extractHeadings, type TocHeading } from "./toc";

/**
 * Same shape as lib/content/work.ts (filesystem-backed, Server-Component-
 * only, module-level cache) — deliberately not abstracted into one
 * generic "content collection" helper shared by both. Work and Notes
 * have different grouping/adjacency semantics (flat catalog + sequential
 * prev/next vs. theme-grouped + theme-scoped prev/next), and forcing a
 * shared abstraction over two collections this different would have
 * added indirection without saving real duplication.
 */

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

export type NoteEntry = NoteFrontmatter & {
  slug: string;
  body: string;
  readingTime: string;
  headings: TocHeading[];
};

function readNote(filename: string): NoteEntry {
  const slug = filename.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(NOTES_DIR, filename), "utf-8");
  const { data, content } = matter(raw);

  const frontmatter = noteFrontmatterSchema.parse(data);

  return {
    ...frontmatter,
    slug,
    body: content,
    readingTime: readingTime(content).text,
    headings: extractHeadings(content),
  };
}

let notesCache: NoteEntry[] | null = null;

function loadNotes(): NoteEntry[] {
  if (notesCache) return notesCache;

  const filenames = fs
    .readdirSync(NOTES_DIR)
    .filter((filename) => filename.endsWith(".mdx"));

  notesCache = filenames
    .map(readNote)
    .sort(
      (a, b) => b.order - a.order || b.publishedAt.localeCompare(a.publishedAt),
    );

  return notesCache;
}

export function getAllNotes(): NoteEntry[] {
  return loadNotes();
}

export function getNoteBySlug(slug: string): NoteEntry | undefined {
  return loadNotes().find((note) => note.slug === slug);
}

/** The index's actual structure — grouped by theme, in a fixed display order, empty themes omitted rather than shown as a dead section. */
export function getNotesByTheme(): { theme: NoteTheme; notes: NoteEntry[] }[] {
  const all = loadNotes();
  return NOTE_THEMES.map((theme) => ({
    theme,
    notes: all.filter((note) => note.theme === theme),
  })).filter((group) => group.notes.length > 0);
}

/** Scoped to the same theme — continuing to read within one intellectual cluster, not jumping across unrelated ones, matches "organize by thinking" as a navigation rule too, not just an index layout. */
export function getAdjacentNotes(slug: string): {
  previous: NoteEntry | null;
  next: NoteEntry | null;
} {
  const current = getNoteBySlug(slug);
  if (!current) return { previous: null, next: null };

  const sameTheme = loadNotes().filter((note) => note.theme === current.theme);
  const index = sameTheme.findIndex((note) => note.slug === slug);

  return {
    previous: index > 0 ? sameTheme[index - 1]! : null,
    next: index < sameTheme.length - 1 ? sameTheme[index + 1]! : null,
  };
}

export function getRelatedNotes(slug: string, limit = 3): NoteEntry[] {
  const all = loadNotes();
  const current = all.find((note) => note.slug === slug);
  if (!current) return [];

  return all
    .filter((note) => note.slug !== slug && note.theme === current.theme)
    .slice(0, limit);
}
