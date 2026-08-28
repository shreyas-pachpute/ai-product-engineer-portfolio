/**
 * Decorative-only strings — deliberately generic/illustrative telemetry
 * (loss curves, latency, eval passes), never a real, asserted claim about
 * any actual system. Same category as a dot-grid or noise texture, not a
 * metric anyone could mistake for a real dashboard number tied to a real
 * project (those live in Work case studies, sourced from real content).
 *
 * Positions are hand-authored, not `Math.random()` at render time — this is
 * a Server Component with no client re-render, so determinism isn't
 * strictly required for hydration safety, but fixed values keep the field
 * reviewable/diffable like everything else in this design system, and
 * avoid a build that looks different every time it runs.
 */
export type AmbientGlyph = {
  text: string;
  top: number;
  left: number;
  size: "xs" | "sm";
  delay: number;
  duration: number;
  min: number;
  max: number;
};

const LINES = [
  "loss: 0.0043",
  'tok[4471] -> "context"',
  "eval_pass: 12/12",
  "latency_p99: 84ms",
  "retrying... 1/3",
  "embedding_dim: 1536",
  "cache_hit: 0.91",
  "queue_depth: 3",
  "grad_norm: 0.0012",
  "tokens/sec: 2140",
  "ctx_window: 128k",
  "temp: 0.2",
  "top_p: 0.9",
  "batch: 32/32",
  "rerank_score: 0.87",
  "cold_start: 340ms",
  "ttfb: 62ms",
  "kv_cache: warm",
  "step 8,204",
  "epoch 3/10",
  "recall@10: 0.94",
  "shard 4/8 synced",
  "drift: within bounds",
  "trace_id: 9f3a21",
];

const POSITIONS: Array<{ top: number; left: number }> = [
  { top: 6, left: 8 },
  { top: 14, left: 62 },
  { top: 9, left: 88 },
  { top: 22, left: 30 },
  { top: 28, left: 78 },
  { top: 34, left: 5 },
  { top: 40, left: 46 },
  { top: 18, left: 18 },
  { top: 47, left: 92 },
  { top: 52, left: 24 },
  { top: 58, left: 66 },
  { top: 63, left: 10 },
  { top: 68, left: 40 },
  { top: 72, left: 84 },
  { top: 77, left: 55 },
  { top: 82, left: 15 },
  { top: 86, left: 72 },
  { top: 91, left: 34 },
  { top: 4, left: 44 },
  { top: 38, left: 96 },
  { top: 60, left: 2 },
  { top: 95, left: 60 },
  { top: 25, left: 52 },
  { top: 12, left: 4 },
];

export const AMBIENT_GLYPHS: AmbientGlyph[] = LINES.map((text, index) => {
  const position = POSITIONS[index]!;
  return {
    text,
    top: position.top,
    left: position.left,
    size: index % 3 === 0 ? "sm" : "xs",
    delay: (index * 0.7) % 5,
    duration: 4.5 + (index % 5) * 0.6,
    min: 0.08 + (index % 4) * 0.02,
    max: 0.3 + (index % 3) * 0.08,
  };
});
