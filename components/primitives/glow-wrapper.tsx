import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const glowWrapperStyles = cva("rounded-[inherit]", {
  variants: {
    tone: {
      accent: "shadow-glow",
      ember: "shadow-glow-ember",
    },
  },
  defaultVariants: {
    tone: "accent",
  },
});

type GlowWrapperProps = VariantProps<typeof glowWrapperStyles> &
  Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    children?: ReactNode;
  };

/**
 * Wraps a single element (a CTA, a highlighted card) in an accent-tinted
 * glow shadow. Foreground emphasis, not background ambiance — see
 * GradientSurface for the full-bleed section-level version.
 */
export function GlowWrapper({
  tone,
  className,
  children,
  ...props
}: GlowWrapperProps) {
  return (
    <div className={cn(glowWrapperStyles({ tone }), className)} {...props}>
      {children}
    </div>
  );
}
