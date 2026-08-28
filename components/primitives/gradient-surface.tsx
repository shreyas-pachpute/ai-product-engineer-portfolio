import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const gradientSurfaceStyles = cva(
  "pointer-events-none absolute inset-0 -z-10",
  {
    variants: {
      tone: {
        accent:
          "bg-[radial-gradient(circle_at_50%_0%,var(--color-accent-glow),transparent_60%)]",
        ember:
          "bg-[radial-gradient(circle_at_50%_0%,var(--color-accent-ember-glow),transparent_60%)]",
        neutral:
          "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]",
      },
      intensity: {
        subtle: "opacity-50",
        medium: "opacity-75",
        strong: "opacity-100",
      },
    },
    defaultVariants: {
      tone: "accent",
      intensity: "medium",
    },
  },
);

type GradientSurfaceProps = VariantProps<typeof gradientSurfaceStyles> & {
  className?: string;
};

/**
 * Decorative, full-bleed ambient glow meant to sit behind section content
 * (hero, proof bar, final conversion zone). Purely presentational —
 * `aria-hidden`, `pointer-events-none`, and absolutely positioned, so the
 * parent element must be `relative` (or otherwise establish a positioning
 * context) for it to place correctly.
 *
 * Distinct from GlowWrapper: this is background ambiance behind a whole
 * section; GlowWrapper is a foreground emphasis effect around one element.
 */
export function GradientSurface({
  tone,
  intensity,
  className,
}: GradientSurfaceProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(gradientSurfaceStyles({ tone, intensity }), className)}
    />
  );
}
