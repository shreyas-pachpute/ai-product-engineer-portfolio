import { ArrowRightIcon } from "@/components/primitives";

type ArchitectureBlockProps = {
  title: string;
  steps: string[];
};

/** A request/data-flow diagram rendered from plain text, not an image — `<ArchitectureBlock title="Request flow" steps={["...", "..."]} />`. Keeps the diagram as accurate as the prose describing it, and never goes stale the way a hand-drawn screenshot would. */
export function ArchitectureBlock({ title, steps }: ArchitectureBlockProps) {
  return (
    <div className="not-prose border-border-subtle bg-surface-raised my-8 rounded-md border p-6">
      <p className="text-caption text-text-tertiary mb-4 font-mono tracking-[0.15em] uppercase">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span className="border-border-highlight bg-surface-base text-caption text-text-primary rounded-full border px-3 py-1.5">
              {step}
            </span>
            {index < steps.length - 1 && (
              <ArrowRightIcon className="text-text-tertiary size-3.5 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
