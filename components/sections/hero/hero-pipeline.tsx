/**
 * Hero's signature visual: the five-stage loop the rest of the site keeps
 * making the same argument through (Business Impact's lifecycle diagram,
 * the resume-facing positioning) — Problem → Architecture → Build →
 * Deploy → Impact — rendered here as a standing, always-on strip instead
 * of a scroll-triggered build. It's the first concrete "product" visual a
 * visitor sees, not just gradient blobs.
 *
 * No hooks, no state — pure CSS animation (the `animate-pipeline-flow`
 * token in globals.css), so this stays a plain function component even
 * though it's imported into Hero's "use client" file (same pattern as
 * HeroBackground). Column math: a CSS grid with N equal columns puts each
 * node's center at (i + 0.5)/N of the row width, so a `left-1/2 w-full`
 * connector drawn from node i's center reaches exactly node (i+1)'s
 * center — no measured pixel values needed.
 */

const PIPELINE_STAGES = ["Problem", "Architecture", "Build", "Deploy", "Impact"];

export function HeroPipeline() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto grid w-full max-w-xl grid-cols-5"
    >
      {PIPELINE_STAGES.map((stage, i) => (
        <div
          key={stage}
          className="relative flex min-w-0 flex-col items-center gap-2.5 px-1"
        >
          {i < PIPELINE_STAGES.length - 1 && (
            <div className="bg-border-subtle absolute top-[3px] left-1/2 h-px w-full overflow-hidden">
              <span
                className="animate-pipeline-flow via-accent-primary-hover absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-transparent to-transparent"
                style={{ animationDelay: `${i * 0.45}s` }}
              />
            </div>
          )}
          <span className="bg-accent-primary/80 ring-surface-base relative z-10 size-1.5 rounded-full ring-4" />
          <span className="text-text-tertiary w-full text-center font-mono text-[9px] leading-tight tracking-[0.1em] uppercase sm:text-[10px] sm:tracking-[0.15em]">
            {stage}
          </span>
        </div>
      ))}
    </div>
  );
}
