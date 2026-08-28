/**
 * Shared semantic vocabulary reused across primitives (Badge, StatusPill,
 * GlowWrapper, GradientSurface, IconWrapper). Defined once so "accent" means
 * the same accent-primary token everywhere instead of every component
 * inventing its own tone union.
 */
export type Tone =
  "neutral" | "accent" | "ember" | "success" | "warning" | "danger";

/**
 * Shared gap scale for every layout primitive that arranges children
 * (Stack, Grid). Named to match the radius/blur token vocabulary instead of
 * raw Tailwind gap numbers, and defined once so Stack and Grid can't drift
 * out of sync with each other.
 */
export const gapScale = {
  none: "gap-0",
  xs: "gap-1", // 4px
  sm: "gap-2", // 8px
  md: "gap-4", // 16px
  lg: "gap-6", // 24px
  xl: "gap-8", // 32px
  "2xl": "gap-12", // 48px
  "3xl": "gap-16", // 64px
} as const;

export type Gap = keyof typeof gapScale;
