"use client";

import { m, type Variants } from "framer-motion";
import { motionDuration, motionEasing } from "@/lib/motion/tokens";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

/**
 * The hero payoff line, revealed word by word with a variable-font weight
 * settle: each word arrives light (wght 300), blurred and slightly low,
 * then resolves to its full weight (700) in place.
 *
 * Why weight and not just fade: a fade tells you something appeared. A
 * weight settle tells you something *arrived and took hold* — the letters
 * gain mass as they land. It is only possible because the display face now
 * loads as a variable font (see lib/fonts.ts); static instances can only
 * cross-fade between two files, which reads as a dissolve, not a settle.
 *
 * The axis range here is Space Grotesk's real one (300–700). Values outside
 * it clamp silently rather than erroring, so overshooting looks like
 * "the animation doesn't work" rather than like a bug.
 *
 * Scene-level motion, so the variants live here rather than in
 * lib/motion/variants.ts — but their timing still comes from the shared
 * tokens, so retuning the narrative tier retunes this too.
 */

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const word: Variants = {
  hidden: {
    opacity: 0,
    y: "0.25em",
    filter: "blur(10px)",
    "--wght": 300,
  },
  visible: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    "--wght": 700,
    transition: {
      duration: motionDuration.narrative * 1.4,
      ease: motionEasing.narrative,
    },
  },
};

type KineticHeadlineProps = {
  /** The line to animate. Split on whitespace; words are never broken apart. */
  text: string;
  className?: string;
};

export function KineticHeadline({ text, className }: KineticHeadlineProps) {
  const reducedMotion = useReducedMotion();

  /*
   * Under reduced motion, render one plain text node instead of a stack of
   * animated spans. This is a hard bail rather than a reliance on
   * MotionConfig's neutralization: Framer's reduced-motion handling
   * whitelists a small set of properties, and a custom property driving
   * font-variation-settings is not obviously among them — so rather than
   * depend on undocumented behavior for something that would leave the
   * headline stuck at wght 300, the split simply does not happen.
   */
  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(" ");

  return (
    /*
     * `aria-label` on the container plus `aria-hidden` on the pieces.
     * Splitting a sentence into per-word elements can make some screen
     * readers announce it as disconnected fragments; giving the container
     * the whole string as its accessible name sidesteps that entirely and
     * costs nothing, since the visible text is identical.
     */
    <m.span
      aria-label={text}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((token, index) => (
        <m.span
          key={`${token}-${index}`}
          aria-hidden="true"
          variants={word}
          // `inline-block` is required for the transform to apply at all —
          // transforms have no effect on non-replaced inline boxes. The
          // trailing space is a real character rather than a margin so the
          // line still wraps and copies as normal prose.
          className="inline-block whitespace-pre"
          style={{ fontVariationSettings: '"wght" var(--wght)' }}
        >
          {index < words.length - 1 ? `${token} ` : token}
        </m.span>
      ))}
    </m.span>
  );
}
