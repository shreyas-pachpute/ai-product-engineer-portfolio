import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const iconWrapperStyles = cva(
  "inline-flex shrink-0 items-center justify-center",
  {
    variants: {
      variant: {
        plain: "",
        tile: "rounded-sm border border-border-subtle bg-surface-raised",
      },
      tone: {
        neutral: "text-text-secondary",
        accent: "text-accent-primary",
        ember: "text-accent-ember",
      },
      size: {
        sm: "size-8 [&_svg]:size-4",
        md: "size-10 [&_svg]:size-5",
        lg: "size-12 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "plain",
      tone: "neutral",
      size: "md",
    },
  },
);

type IconWrapperProps = VariantProps<typeof iconWrapperStyles> &
  Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    children?: ReactNode;
  };

/**
 * Sizing/color treatment for icons — icon-agnostic on purpose. This phase
 * doesn't wire in an icon package (that's a content-phase decision, see
 * Architecture Doc §28); this component just guarantees every icon used
 * anywhere in the app is sized and colored consistently, whatever package
 * ends up providing the SVGs.
 */
export function IconWrapper({
  variant,
  tone,
  size,
  className,
  children,
  ...props
}: IconWrapperProps) {
  return (
    <span
      className={cn(iconWrapperStyles({ variant, tone, size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}
