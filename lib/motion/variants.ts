import type { Variants } from "framer-motion";
import { motionDuration, motionEasing } from "@/lib/motion/tokens";

/**
 * Reusable, tokenized Framer Motion variants — generic building blocks for
 * later content phases (scroll reveals, staggered lists), not scene-specific
 * animation. Every one of these reads its timing from lib/motion/tokens.ts
 * rather than inlining a duration/easing, so retuning the "narrative" tier
 * globally retunes every consumer of these variants too.
 */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionDuration.narrative,
      ease: motionEasing.narrative,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.narrative,
      ease: motionEasing.narrative,
    },
  },
};

/** Apply to a parent; children using `fadeIn`/`fadeInUp` will cascade in rather than reveal simultaneously. */
export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

/* ---------------------------------------------------------------------------
 * Beyond fade-up.
 *
 * `fadeInUp` was doing essentially all the reveal work on the site, which is
 * why every section arrived the same way regardless of what it contained.
 * These are not decoration for its own sake — each one suits a different kind
 * of content, and the point is that a section can now be revealed in a way
 * that matches what it *is*:
 *
 *   blurIn      — atmospheric; things that should feel like they resolve into
 *                 focus (hero copy, large statements)
 *   clipReveal  — architectural; things with a strong edge that should be
 *                 uncovered rather than moved (images, panels, diagrams)
 *   maskWipe    — directional; text and rules that should be drawn in
 *   scaleIn     — tactile; small objects that should feel placed (badges,
 *                 icon tiles, metric chips)
 *   weightSettle— typographic; display type that arrives light and settles
 *                 into its final weight. Requires a variable font.
 *
 * All read timing from lib/motion/tokens.ts. None of them animate a property
 * that forces layout — transform, opacity, filter and clip-path only.
 * ------------------------------------------------------------------------ */

const narrative = {
  duration: motionDuration.narrative,
  ease: motionEasing.narrative,
} as const;

/** Resolves into focus. Pair with content that carries its own weight — over-applied, a blur reveal reads as a page that failed to load. */
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 8 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { ...narrative, duration: motionDuration.narrative * 1.2 },
  },
};

/**
 * Uncovers from the bottom edge without moving the element. The subtle `y`
 * is intentional: a pure clip reveal reads as mechanical, and 12px of travel
 * against a 100% clip is what makes it read as material being uncovered
 * rather than a wipe effect.
 */
export const clipReveal: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)", y: 12 },
  visible: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    y: 0,
    transition: { ...narrative, duration: motionDuration.narrative * 1.3 },
  },
};

/** Left-to-right draw. For single lines — rules, eyebrows, one-line headings. Multi-line text wipes unevenly and should use `clipReveal` instead. */
export const maskWipe: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  visible: {
    opacity: 1,
    clipPath: "inset(0 0% 0 0)",
    transition: { ...narrative, duration: motionDuration.narrative * 1.4 },
  },
};

/** Settles into place. Starts at 0.96, not 0.8 — a large scale delta on a card reads as a popup, which is the wrong register for content that was always there. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...narrative, duration: motionDuration.orientation * 1.6 },
  },
};

/**
 * Variable-font weight settle, driven through the registered `--wght`
 * custom property (see the `@property --wght` block in app/globals.css).
 * The consuming element needs `font-variation-settings: "wght" var(--wght)`.
 *
 * Weights are chosen for Space Grotesk's actual axis (300–700); asking for
 * anything outside that range silently clamps rather than erroring, which
 * makes the mistake invisible, so it is worth stating.
 */
export const weightSettle: Variants = {
  hidden: { opacity: 0, y: 10, "--wght": 300 },
  visible: {
    opacity: 1,
    y: 0,
    "--wght": 700,
    transition: { ...narrative, duration: motionDuration.narrative * 1.5 },
  },
};

/** Tighter cascade than `staggerChildren`, for word- or character-level reveals where the default 80ms would make a headline crawl. */
export const staggerWords: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.08,
    },
  },
};
