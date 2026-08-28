import { ArrowRightIcon } from "@/components/primitives";

type MetricItem = {
  label: string;
  before: string;
  after: string;
};

type MetricsProps = {
  items: MetricItem[];
};

/**
 * Before/after comparison — `<Metrics items={[{label, before, after}]} />`.
 * Deliberately takes qualitative or quantitative strings, not a
 * percentage-change number: this system has no verified project metrics
 * yet (same constraint as the homepage's Proof Bar), and a component that
 * only accepted precise numbers would invite filling it with invented
 * ones. "Hours per batch" → "Minutes per batch" is honest; a fabricated
 * "83% faster" would not be.
 */
export function Metrics({ items }: MetricsProps) {
  return (
    <div className="not-prose my-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="border-border-subtle bg-surface-raised rounded-md border p-5"
        >
          <p className="text-caption text-text-tertiary mb-3 font-mono tracking-[0.15em] uppercase">
            {item.label}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body text-text-tertiary decoration-border-highlight line-through">
              {item.before}
            </span>
            <ArrowRightIcon className="text-text-tertiary size-3.5 shrink-0" />
            <span className="text-body text-text-primary font-medium">
              {item.after}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
