import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const cardStyles = cva("rounded-md", {
  variants: {
    variant: {
      raised: "border border-border-subtle bg-surface-raised",
      glass: "glass-panel",
      outline: "border border-border-subtle bg-transparent",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
    interactive: {
      true: "transition-[transform,border-color] duration-200 ease-orientation hover:-translate-y-1 hover:border-border-highlight cursor-pointer",
      false: "",
    },
    specular: {
      true: "specular-border",
      false: "",
    },
    /**
     * Cursor-following highlight. Composes with `specular` rather than
     * competing with it — `specular-border` owns `::before`, `spotlight`
     * owns `::after`, deliberately. `aurora-border` is the one that
     * conflicts (it also wants `::before`).
     *
     * `overflow-hidden` is not optional here: the highlight is an inset-0
     * pseudo-element with `border-radius: inherit`, and on a card with
     * `padding="none"` holding a full-bleed child, the child's own corners
     * can otherwise sit over the radius.
     */
    spotlight: {
      true: "spotlight overflow-hidden",
      false: "",
    },
  },
  defaultVariants: {
    variant: "raised",
    padding: "md",
    interactive: false,
    specular: false,
    spotlight: false,
  },
});

type CardProps<TElement extends ElementType> = VariantProps<
  typeof cardStyles
> & {
  as?: TElement;
  className?: string;
  children?: ReactNode;
} & Omit<
    ComponentPropsWithoutRef<TElement>,
    "as" | "className" | "children" | keyof VariantProps<typeof cardStyles>
  >;

/**
 * Base content-surface primitive. Three variants cover every content card
 * in the system (raised = default solid surface, glass = translucent for
 * content sitting over a busy background, outline = lowest-emphasis
 * container). For floating chrome (nav, modals, mobile overlay) use
 * GlassPanel instead, which exposes configurable blur intensity that
 * content cards don't need.
 */
export function Card<TElement extends ElementType = "div">({
  as,
  variant,
  padding,
  interactive,
  specular,
  spotlight,
  className,
  children,
  ...props
}: CardProps<TElement>) {
  const Component = as ?? "div";

  return (
    <Component
      // The marker the delegated SpotlightController looks for with
      // `closest()`. A data attribute rather than the class name so the
      // behavior hook and the style hook stay independent — restyling or
      // renaming the utility can't silently break the pointer tracking.
      data-spotlight={spotlight ? "" : undefined}
      className={cn(
        cardStyles({ variant, padding, interactive, specular, spotlight }),
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
