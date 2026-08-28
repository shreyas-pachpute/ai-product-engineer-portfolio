import { z } from "zod";

/**
 * Icon keys map to the existing Capabilities icon set (see
 * components/work/icon-registry.tsx) rather than a separate icon library —
 * a case study's icon should mean the same thing it already means on the
 * homepage's Capabilities/Featured Work sections, not introduce a second
 * visual vocabulary.
 */
export const WORK_ICON_KEYS = [
  "agents",
  "multiAgent",
  "knowledge",
  "copilot",
  "voice",
  "infra",
] as const;

/**
 * Two tiers, not the architecture doc's original flat list — see the
 * Phase 17 write-up for the full reasoning. `signature` gets the sticky
 * section-navigation sidebar and is meant for genuinely complex systems;
 * `buildlog` is the lighter, faster-to-read format for smaller builds.
 * Deliberately NOT a rigid 18-field schema: the body is freeform MDX using
 * H2s as major sections plus the shared embeddable components
 * (Callout, DecisionCard, ArchitectureBlock, Timeline, Metrics,
 * MediaBlock) wherever the narrative calls for them. A rigid schema would
 * fight exactly the two things asked for — "the MDX experience should
 * feel first-class" and "add future projects without touching React
 * code" — since every new required field would mean a UI change.
 */
export const workFrontmatterSchema = z.object({
  title: z.string(),
  category: z.string(),
  tier: z.enum(["signature", "buildlog"]),
  icon: z.enum(WORK_ICON_KEYS),
  /** One-line problem statement — reused on the index, the hero, and Related Work cards, so it has to work standalone in all three. */
  problem: z.string(),
  /** Short abstract for <meta description> / OG-adjacent contexts. */
  summary: z.string(),
  timeline: z.string(),
  publishedAt: z.string(),
  /**
   * Both optional and both deliberately unset on every current case study.
   * "Show me the code" is the first thing a technical reader looks for, so
   * the rendering path needs to exist — but a link is only worth having if
   * it's real, and inventing repo/demo URLs would be exactly the kind of
   * unverifiable claim this whole build has avoided. Add them per-entry in
   * frontmatter as real repos and deployments come online; the UI appears
   * automatically and stays absent until then.
   */
  repoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  /** Manual sort override for the index; ties broken by publishedAt descending. */
  order: z.number().default(0),
});

export type WorkFrontmatter = z.infer<typeof workFrontmatterSchema>;
export type WorkIconKey = (typeof WORK_ICON_KEYS)[number];
