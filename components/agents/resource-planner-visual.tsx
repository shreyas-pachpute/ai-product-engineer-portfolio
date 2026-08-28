/**
 * Real captured output from the "skill_matters" eval scenario, hand-verified
 * against the scoring formula by unit test (tests/test_scoring.py) — not a
 * mockup.
 */
export function ResourcePlannerVisual() {
  return (
    <div className="bg-surface-elevated border-border-subtle overflow-hidden rounded-md border font-mono text-[13px] leading-relaxed">
      <div className="border-border-subtle bg-surface-base/60 flex items-center gap-1.5 border-b px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-500/60" />
        <span className="size-2.5 rounded-full bg-yellow-500/60" />
        <span className="size-2.5 rounded-full bg-green-500/60" />
        <span className="text-text-tertiary ml-2 text-[11px]">
          planner.cli plan --role-id r1
        </span>
      </div>
      <div className="text-text-secondary flex flex-col gap-1.5 p-4">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-text-tertiary text-[11px] uppercase">
              <th className="pb-1.5 pr-3 font-normal">Candidate</th>
              <th className="pb-1.5 pr-3 font-normal">Total</th>
              <th className="pb-1.5 font-normal">Skill</th>
            </tr>
          </thead>
          <tbody className="text-text-primary">
            <tr>
              <td className="pr-3 py-0.5">yuki_tanaka</td>
              <td className="text-accent-primary-hover pr-3 py-0.5">78.25</td>
              <td className="py-0.5">100</td>
            </tr>
            <tr>
              <td className="pr-3 py-0.5">grace_osei</td>
              <td className="pr-3 py-0.5">69.75</td>
              <td className="py-0.5">85</td>
            </tr>
            <tr>
              <td className="pr-3 py-0.5">ben_carter</td>
              <td className="pr-3 py-0.5">66.25</td>
              <td className="py-0.5">70</td>
            </tr>
          </tbody>
        </table>
        <p className="text-emerald-400 mt-1">
          22/22 tests passing — exact scores hand-verified.
        </p>
      </div>
    </div>
  );
}
