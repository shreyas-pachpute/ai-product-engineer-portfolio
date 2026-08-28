import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const containerStyles = cva("mx-auto w-full px-6 md:px-8", {
  variants: {
    size: {
      nav: "max-w-nav",
      content: "max-w-content",
      prose: "max-w-prose",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "content",
  },
});

export type ContainerSize = NonNullable<
  VariantProps<typeof containerStyles>["size"]
>;

type ContainerProps<TElement extends ElementType> = {
  as?: TElement;
  size?: ContainerSize;
  className?: string;
  children?: ReactNode;
} & Omit<
  ComponentPropsWithoutRef<TElement>,
  "as" | "size" | "className" | "children"
>;

/**
 * Horizontal measure + centering. This is the ONLY primitive responsible
 * for max-width and horizontal gutters — Section handles vertical rhythm,
 * Stack/Grid handle internal layout. Keeping these concerns in separate
 * primitives means a section can, e.g., go full-bleed while its text still
 * clamps to `prose` width, without fighting one all-in-one component.
 */
export function Container<TElement extends ElementType = "div">({
  as,
  size,
  className,
  children,
  ...props
}: ContainerProps<TElement>) {
  const Component = as ?? "div";

  return (
    <Component className={cn(containerStyles({ size }), className)} {...props}>
      {children}
    </Component>
  );
}
