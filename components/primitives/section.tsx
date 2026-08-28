import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Container,
  type ContainerSize,
} from "@/components/primitives/container";

const sectionStyles = cva("relative w-full", {
  variants: {
    spacing: {
      none: "py-0",
      sm: "py-12 md:py-16",
      md: "py-20 md:py-28",
      lg: "py-28 md:py-40",
    },
  },
  defaultVariants: {
    spacing: "md",
  },
});

export type SectionSpacing = NonNullable<
  VariantProps<typeof sectionStyles>["spacing"]
>;

type SectionProps<TElement extends ElementType> = {
  as?: TElement;
  spacing?: SectionSpacing;
  /**
   * Width to clamp children to, via an internal Container. Pass `false` to
   * skip the wrapper entirely for sections that need a full-bleed layout
   * (e.g. a section with an edge-to-edge background visual and its own
   * internal width handling).
   */
  container?: ContainerSize | false;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<TElement>, "as" | "className" | "children">;

/**
 * Vertical rhythm wrapper for page-level sections. Deliberately separate
 * from Container (width) so a section can carry a full-bleed background
 * while its content still clamps to a readable measure.
 */
export function Section<TElement extends ElementType = "section">({
  as,
  spacing,
  container = "content",
  className,
  children,
  ...props
}: SectionProps<TElement>) {
  const Component = as ?? "section";

  return (
    <Component className={cn(sectionStyles({ spacing }), className)} {...props}>
      {container === false ? (
        children
      ) : (
        <Container size={container}>{children}</Container>
      )}
    </Component>
  );
}
