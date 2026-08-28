import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const textStyles = cva("font-sans", {
  variants: {
    size: {
      lead: "text-body-lead",
      body: "text-body",
      caption: "text-caption",
    },
    tone: {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      tertiary: "text-text-tertiary",
      accent: "text-accent-primary-hover",
      ember: "text-accent-ember",
      success: "text-status-success",
    },
    mono: {
      true: "font-mono tabular-nums",
      false: "",
    },
  },
  defaultVariants: {
    size: "body",
    tone: "secondary",
    mono: false,
  },
});

type TextProps<TElement extends ElementType> = VariantProps<
  typeof textStyles
> & {
  as?: TElement;
  className?: string;
  children?: ReactNode;
} & Omit<
    ComponentPropsWithoutRef<TElement>,
    "as" | "className" | "children" | keyof VariantProps<typeof textStyles>
  >;

/**
 * Body copy primitive. Defaults to `tone="secondary"` (the muted body
 * color) rather than primary — most paragraph copy in this design system
 * sits underneath a Heading and is supporting text, not the emphasis
 * itself; callers opt into `tone="primary"` for standalone/emphasized text.
 */
export function Text<TElement extends ElementType = "p">({
  as,
  size,
  tone,
  mono,
  className,
  children,
  ...props
}: TextProps<TElement>) {
  const Component = as ?? "p";

  return (
    <Component
      className={cn(textStyles({ size, tone, mono }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}
