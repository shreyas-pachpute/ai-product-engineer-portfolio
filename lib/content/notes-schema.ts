import { z } from "zod";

/**
 * Four types, not one generic "post" — each implies a different shape of
 * writing, not just a label: a Note is a short single observation, an
 * Essay is a sustained argument, a Review is a structured analysis of a
 * system/technology trade-off, a Report is findings-driven (a benchmark,
 * an experiment, an incident). The taxonomy from the brief (Engineering
 * Notes, Architecture Reviews, Research Summaries, Experiments,
 * Benchmarks, Failure Reports, Design Decisions, Reading Notes,
 * Production Lessons...) collapses into these four without losing
 * anything — most of those ten are the same underlying form wearing a
 * different topic.
 */
export const NOTE_TYPES = ["note", "essay", "review", "report"] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  note: "Note",
  essay: "Essay",
  review: "Review",
  report: "Report",
};

/**
 * Themes are the index's actual organizing axis ("browse ideas, not
 * dates") — `type` is metadata shown per entry, not the primary
 * structure. Four clusters chosen to plausibly hold years of future
 * writing without needing to be revisited.
 */
export const NOTE_THEMES = [
  "systems",
  "evaluation",
  "product",
  "tools",
] as const;
export type NoteTheme = (typeof NOTE_THEMES)[number];

export const NOTE_THEME_LABELS: Record<NoteTheme, string> = {
  systems: "Systems & Architecture",
  evaluation: "Evaluation & Reliability",
  product: "Product & Business",
  tools: "Tools & Models",
};

export const noteFrontmatterSchema = z.object({
  title: z.string(),
  type: z.enum(NOTE_TYPES),
  theme: z.enum(NOTE_THEMES),
  summary: z.string(),
  publishedAt: z.string(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

export type NoteFrontmatter = z.infer<typeof noteFrontmatterSchema>;
