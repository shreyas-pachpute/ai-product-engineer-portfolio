import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Maps to the `glass-*` utilities defined in app/globals.css (`@utility`),
 * which own the actual blur/saturate/border + `@supports` solid-fallback
 * logic. Composed here rather than reimplemented so there is exactly one
 * place backdrop-filter fallback behavior can go wrong, not four.
 */
const glassPanelStyles = cva("", {
  variants: {
    blur: {
      panel: "glass-panel",
      nav: "glass-nav",
      modal: "glass-modal",
      mobileNav: "glass-mobile-nav",
    },
    radius: {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    blur: "panel",
    radius: "md",
  },
});

type GlassPanelProps<TElement extends ElementType> = VariantProps<
  typeof glassPanelStyles
> & {
  as?: TElement;
  className?: string;
  children?: ReactNode;
} & Omit<
    ComponentPropsWithoutRef<TElement>,
    | "as"
    | "className"
    | "children"
    | keyof VariantProps<typeof glassPanelStyles>
  >;

/**
 * Floating-chrome glass surface — nav capsule, modals, the mobile nav
 * overlay. Separate from Card's `glass` variant because chrome needs a
 * configurable blur *intensity* per context (a 12px nav vs. a 24px
 * full-screen mobile overlay), which content cards never do.
 */
export function GlassPanel<TElement extends ElementType = "div">({
  as,
  blur,
  radius,
  className,
  children,
  ...props
}: GlassPanelProps<TElement>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(glassPanelStyles({ blur, radius }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}
