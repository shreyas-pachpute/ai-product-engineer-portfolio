/**
 * Real captured output from this session, not a mockup: the actual pytest
 * run for the architectural-separation test, the standout property of this
 * project (see PROJECT.md Section 9/24 — verified by testing, not just
 * design intent).
 */
export function AccountIntelligenceVisual() {
  return (
    <div className="bg-surface-elevated border-border-subtle overflow-hidden rounded-md border font-mono text-[13px] leading-relaxed">
      <div className="border-border-subtle bg-surface-base/60 flex items-center gap-1.5 border-b px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-500/60" />
        <span className="size-2.5 rounded-full bg-yellow-500/60" />
        <span className="size-2.5 rounded-full bg-green-500/60" />
        <span className="text-text-tertiary ml-2 text-[11px]">
          pytest tests/test_architectural_separation.py -v
        </span>
      </div>
      <div className="text-text-secondary flex flex-col gap-1.5 p-4">
        <p className="text-emerald-400">
          test_hypothesis_agent_imports_no_search_capability PASSED
        </p>
        <p className="text-emerald-400">
          test_hypothesis_agent_never_mentions_tavily_by_name PASSED
        </p>
        <p className="text-text-tertiary">
          — parses hypothesis.py&apos;s actual AST, asserts zero import of
          the search layer.
        </p>
        <p className="text-text-primary mt-1">16 passed in 2.43s</p>
      </div>
    </div>
  );
}
