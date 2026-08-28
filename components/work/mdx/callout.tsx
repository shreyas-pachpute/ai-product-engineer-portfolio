import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CalloutType = "info" | "warning" | "insight";

const CALLOUT_STYLES: Record<CalloutType, { border: string; label: string }> = {
  info: { border: "border-l-border-highlight", label: "Note" },
  warning: {
    border: "border-l-status-warning",
    label: "Watch out",
  },
  insight: {
    border: "border-l-accent-primary",
    label: "Why it matters",
  },
};

type CalloutProps = {
  type?: CalloutType;
  children: ReactNode;
};

/** MDX-usable aside/admonition — `<Callout type="insight">...</Callout>` directly in case-study content. */
export function Callout({ type = "info", children }: CalloutProps) {
  const style = CALLOUT_STYLES[type];

  return (
    <div
      className={cn(
        "not-prose bg-surface-raised/60 my-8 border-l-2 py-3 pr-5 pl-5",
        style.border,
      )}
    >
      <p className="text-caption text-text-tertiary mb-1.5 font-mono tracking-[0.15em] uppercase">
        {style.label}
      </p>
      <div className="text-body text-text-secondary [&_a]:text-accent-primary-hover [&_a]:underline [&_p]:m-0">
        {children}
      </div>
    </div>
  );
}
