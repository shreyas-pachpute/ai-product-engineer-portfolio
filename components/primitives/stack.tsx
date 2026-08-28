import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { gapScale } from "@/components/primitives/types";

const stackStyles = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
    gap: gapScale,
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "column",
    gap: "md",
    align: "stretch",
    justify: "start",
    wrap: false,
  },
});

export type StackGap = NonNullable<VariantProps<typeof stackStyles>["gap"]>;

type StackProps<TElement extends ElementType> = VariantProps<
  typeof stackStyles
> & {
  as?: TElement;
  className?: string;
  children?: ReactNode;
} & Omit<
    ComponentPropsWithoutRef<TElement>,
    "as" | "className" | "children" | keyof VariantProps<typeof stackStyles>
  >;

/** Flex layout primitive. Vertical by default — pass `direction="row"` for horizontal groups (e.g. a CTA pair). */
export function Stack<TElement extends ElementType = "div">({
  as,
  direction,
  gap,
  align,
  justify,
  wrap,
  className,
  children,
  ...props
}: StackProps<TElement>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        stackStyles({ direction, gap, align, justify, wrap }),
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
