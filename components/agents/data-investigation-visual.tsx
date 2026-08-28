/**
 * Real captured output from a verified run, not a mockup — there's no web
 * UI for this CLI-based agent yet, so rather than invent one, the "visual"
 * is the actual terminal output from investigating the pipeline-failure
 * incident (2025-04-15) in the project's own eval suite.
 */
export function DataInvestigationVisual() {
  return (
    <div className="bg-surface-elevated border-border-subtle overflow-hidden rounded-md border font-mono text-[13px] leading-relaxed">
      <div className="border-border-subtle bg-surface-base/60 flex items-center gap-1.5 border-b px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-500/60" />
        <span className="size-2.5 rounded-full bg-yellow-500/60" />
        <span className="size-2.5 rounded-full bg-green-500/60" />
        <span className="text-text-tertiary ml-2 text-[11px]">
          investigator.cli investigate --date 2025-04-15
        </span>
      </div>
      <div className="text-text-secondary flex flex-col gap-1.5 p-4">
        <p>
          <span className="text-text-tertiary">$</span> Investigating
          daily_revenue on 2025-04-15...
        </p>
        <p className="text-text-primary">
          Conclusion:{" "}
          <span className="text-accent-primary-hover">data_quality_issue</span>
        </p>
        <p>Confidence: high (0.90)</p>
        <p className="text-text-tertiary">
          Summary: NA region ingestion pipeline failed, dropping most NA
          orders for the day.
        </p>
        <p>Queries run: 1 &nbsp; LLM calls: 4</p>
        <p className="text-emerald-400">Evidence grounding: passed</p>
      </div>
    </div>
  );
}
