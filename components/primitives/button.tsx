import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils/cn";
import { Slot } from "@/components/primitives/slot";

const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-full font-sans font-medium",
    /*
     * Was `transition-colors` alone, which meant every button on the site
     * responded to a hover by changing color and nothing else — correct,
     * but inert. The additions here are all about making a press feel
     * physical:
     *
     *   -translate-y-px on hover   the button rises toward the cursor
     *   active:translate-y-0       and returns when pressed
     *   active:scale-[0.98]        with a small compression on the press
     *
     * The asymmetry is the point. Hover lifts, press pushes back down —
     * so the two states are opposites rather than degrees of the same
     * thing, and the button reads as a physical control rather than as a
     * rectangle that changes color.
     *
     * `duration-150` on the feedback easing tier: fast enough to feel like
     * a response to input rather than an animation of it.
     */
    "transition-[color,background-color,border-color,box-shadow,transform]",
    "duration-150 ease-feedback",
    "hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2",
    // `disabled:translate-y-0` cancels the lift — without it a disabled
    // button still rises on hover, which promises an interaction it will
    // not honor.
    "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        // The glow on hover reuses the existing `--shadow-glow` token
        // rather than introducing a button-specific shadow: it is the same
        // "this element is active" signal the ProofBar cards already use.
        primary:
          "bg-accent-primary hover:bg-accent-primary-hover hover:shadow-glow text-white",
        secondary:
          "glass-panel text-text-primary hover:border-border-highlight",
        ghost:
          "text-text-secondary hover:bg-surface-raised hover:text-text-primary",
        /*
         * Dark label, not white — and this is a correctness fix, not a
         * style preference.
         *
         * The ember accent is a LIGHT color (OKLCH lightness ~73%). White
         * text on it measures 2.59:1, well under WCAG AA's 4.5:1 floor for
         * button labels; it was simply copied from the `primary` variant,
         * where white is correct because the signal blue is dark (~56%).
         * The variant happens to have no call sites yet, so nothing on the
         * site is currently failing — but it would have failed the moment
         * anyone used it, which is worse than an obvious bug.
         *
         * Inverting to the canvas color gives 7.72:1 (7.59:1 under P3) and
         * is the standard treatment for a light-accent button.
         */
        ember:
          "bg-accent-ember hover:bg-accent-ember-hover hover:shadow-glow-ember text-surface-base",
      },
      size: {
        sm: "h-9 px-4 text-caption",
        md: "h-11 px-6 text-body",
        lg: "h-12 px-8 text-body-lead",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonStyles>["variant"]
>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonStyles>["size"]>;

type ButtonProps = VariantProps<typeof buttonStyles> &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /**
     * Render props onto the single child element instead of a `<button>`
     * — the mechanism for CTAs that are actually navigation (`asChild`
     * wrapping a Next.js `Link`) without losing button styling or
     * semantics being wrong in either direction.
     */
    asChild?: boolean;
    ref?: Ref<HTMLButtonElement>;
  };

/**
 * The one interactive primitive in this phase. Deliberately does not
 * implement magnetic-hover physics or loading states yet — those are
 * scene-level motion (Architecture Doc Phase 3+) layered on top later
 * without changing this API. What's here (variants, sizes, asChild,
 * focus-visible ring) is the part every future phase needs and shouldn't
 * have to touch again.
 */
export function Button({
  ref,
  variant,
  size,
  asChild = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      ref={ref}
      type={asChild ? undefined : type}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}
