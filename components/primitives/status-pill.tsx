import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const dotStyles = cva("size-2 shrink-0 rounded-full", {
  variants: {
    tone: {
      success: "bg-status-success",
      neutral: "bg-text-tertiary",
      warning: "bg-status-warning",
      accent: "bg-accent-primary",
    },
  },
  defaultVariants: {
    tone: "success",
  },
});

type StatusPillProps = VariantProps<typeof dotStyles> &
  Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    /** Defaults true — the dot pulses via the `pulse-glow` keyframe token to read as "live," not just colored. Set false for a static status. */
    pulse?: boolean;
    children?: ReactNode;
  };

/**
 * Live-state indicator (e.g. "Open to select roles", "Production · Live").
 * Distinct from Badge: Badge is a static label, StatusPill asserts a
 * current, animated state.
 */
export function StatusPill({
  tone,
  pulse = true,
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <div
      className={cn(
        "glass-panel text-caption text-text-secondary inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        className,
      )}
      {...props}
    >
      <span
        className={cn(dotStyles({ tone }), pulse && "animate-pulse-glow")}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
