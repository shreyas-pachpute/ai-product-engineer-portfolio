type DecisionCardProps = {
  decision: string;
  rationale: string;
  alternative?: string;
};

/**
 * The single most important component in this content system for
 * "reads like a design review, not a portfolio" — real design docs
 * explicitly name the decision, the reasoning, and what was rejected and
 * why. `<DecisionCard decision="..." rationale="..." alternative="..." />`
 * directly in MDX.
 */
export function DecisionCard({
  decision,
  rationale,
  alternative,
}: DecisionCardProps) {
  return (
    <div className="not-prose border-accent-primary/25 bg-accent-glow/30 my-8 rounded-md border p-6">
      <p className="text-caption text-accent-primary-hover mb-2 font-mono tracking-[0.15em] uppercase">
        Decision
      </p>
      <p className="text-body-lead text-text-primary mb-3 font-medium">
        {decision}
      </p>
      <p className="text-body text-text-secondary">{rationale}</p>
      {alternative && (
        <p className="border-border-subtle text-caption text-text-tertiary mt-4 border-t pt-4">
          Considered and rejected: {alternative}
        </p>
      )}
    </div>
  );
}
