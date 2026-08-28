import { z } from "zod";
import { WORK_ICON_KEYS } from "./work-schema";

/**
 * Reuses Work's icon vocabulary rather than declaring a parallel enum —
 * same rationale as work-schema.ts: an icon should mean the same thing
 * everywhere on the site, not introduce a second visual vocabulary.
 *
 * No `tier` (agents get one detail template, not two) and no `timeline`
 * (less meaningful for these than for a multi-week case study). Adds
 * `stack` (tech badges shown in the hero) and `highlights` (short,
 * verifiable proof-points — real, checkable facts only, e.g. "22/22
 * deterministic tests passing," never a vanity metric with no source).
 */
export const agentFrontmatterSchema = z.object({
  title: z.string(),
  category: z.string(),
  icon: z.enum(WORK_ICON_KEYS),
  /** One-line problem statement — reused on the index card and the hero. */
  problem: z.string(),
  /** Short abstract for <meta description>. */
  summary: z.string(),
  stack: z.array(z.string()),
  highlights: z.array(z.string()),
  publishedAt: z.string(),
  /**
   * Same rule as Work: both optional, and repoUrl is genuinely set once a
   * project has a real public repo (both do, today). liveUrl stays unset
   * until an actual live, testable deployment exists — the UI renders
   * nothing for it until then, never a placeholder.
   */
  repoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  /** Manual sort override for the index; ties broken by publishedAt descending. */
  order: z.number().default(0),
});

export type AgentFrontmatter = z.infer<typeof agentFrontmatterSchema>;
