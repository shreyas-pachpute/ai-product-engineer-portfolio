import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const badgeStyles = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-mono text-caption tracking-wide uppercase",
  {
    variants: {
      tone: {
        neutral: "border-border-subtle bg-surface-raised text-text-secondary",
        accent:
          "border-accent-primary/30 bg-accent-glow text-accent-primary-hover",
        ember: "border-accent-ember/30 bg-accent-ember-glow text-accent-ember",
        success:
          "border-status-success/30 bg-status-success/10 text-status-success",
        warning:
          "border-status-warning/30 bg-status-warning/10 text-status-warning",
        danger:
          "border-status-danger/30 bg-status-danger/10 text-status-danger",
      },
      size: {
        sm: "h-6 px-2.5",
        md: "h-7 px-3",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "sm",
    },
  },
);

type BadgeProps = VariantProps<typeof badgeStyles> &
  Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    children?: ReactNode;
  };

/** Static label/tag — a stack badge, a category tag on a case study card. For a live/animated state indicator, use StatusPill instead. */
export function Badge({
  tone,
  size,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeStyles({ tone, size }), className)} {...props}>
      {children}
    </span>
  );
}
