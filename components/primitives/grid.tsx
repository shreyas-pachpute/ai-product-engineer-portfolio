import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { gapScale, type Gap } from "@/components/primitives/types";

/**
 * Explicit literal class maps rather than a `` `grid-cols-${n}` `` template.
 * Tailwind v4's scanner only generates utilities for class names it can see
 * as literal strings in source — a dynamically interpolated class name
 * would silently produce no CSS. This is a deliberate constraint, not an
 * oversight; every value the Grid API accepts must be spelled out here.
 */
type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12;

const baseColsMap: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const mdColsMap: Record<GridColumns, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
};

const lgColsMap: Record<GridColumns, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};

type GridProps<TElement extends ElementType> = {
  as?: TElement;
  /** Column count at the base breakpoint. Mobile-first: this applies until overridden by `colsMd`/`colsLg`. */
  cols?: GridColumns;
  colsMd?: GridColumns;
  colsLg?: GridColumns;
  gap?: Gap;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<TElement>, "as" | "className" | "children">;

/** CSS grid primitive with an explicit, mobile-first responsive column API. */
export function Grid<TElement extends ElementType = "div">({
  as,
  cols = 1,
  colsMd,
  colsLg,
  gap = "md",
  className,
  children,
  ...props
}: GridProps<TElement>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "grid",
        baseColsMap[cols],
        colsMd && mdColsMap[colsMd],
        colsLg && lgColsMap[colsLg],
        gapScale[gap],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
