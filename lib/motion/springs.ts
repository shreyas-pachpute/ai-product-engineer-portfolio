import type { Transition } from "framer-motion";

/**
 * Framer Motion-specific spring presets. Kept separate from
 * lib/motion/tokens.ts on purpose — that file is deliberately
 * framework-agnostic (its cubic-bezier arrays work as-is for GSAP or CSS),
 * and spring physics config has no equivalent shape in either of those, so
 * folding it in would compromise that file's one job.
 */
export const motionSpring = {
  /** Small, immediate UI chrome — the nav active-route indicator. */
  snappy: {
    type: "spring",
    stiffness: 420,
    damping: 32,
    mass: 0.9,
  } satisfies Transition,
  /** Larger surfaces that should still feel physical, not snappy — nav show/hide, the mobile overlay. */
  gentle: {
    type: "spring",
    stiffness: 260,
    damping: 30,
  } satisfies Transition,
} as const;
