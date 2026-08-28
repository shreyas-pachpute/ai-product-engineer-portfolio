import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const headingStyles = cva("text-balance text-text-primary", {
  variants: {
    size: {
      display: "font-display text-display",
      h1: "font-display text-h1",
      h2: "font-sans text-h2",
      h3: "font-sans text-h3",
    },
  },
  defaultVariants: {
    size: "h2",
  },
});

export type HeadingSize = NonNullable<
  VariantProps<typeof headingStyles>["size"]
>;

/** Semantic tag implied by each visual size — overridable via `as` when the visual scale and document outline need to diverge (e.g. a card title that's an `h3` in the outline but should read at `h2` size). */
const defaultElementForSize: Record<HeadingSize, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
};

type HeadingProps<TElement extends ElementType> = {
  as?: TElement;
  size?: HeadingSize;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<TElement>, "as" | "className" | "children">;

/**
 * `size` (visual scale) and `as` (semantic tag/document outline) are
 * decoupled on purpose — the visual system and the document structure
 * don't always agree, and forcing them to match either breaks accessibility
 * (skipped heading levels) or breaks the design (an h2 that has to look
 * like an h1 because it follows one in the DOM).
 */
export function Heading<TElement extends ElementType = "h2">({
  as,
  size = "h2",
  className,
  children,
  ...props
}: HeadingProps<TElement>) {
  const Component = as ?? defaultElementForSize[size];

  return (
    <Component className={cn(headingStyles({ size }), className)} {...props}>
      {children}
    </Component>
  );
}
