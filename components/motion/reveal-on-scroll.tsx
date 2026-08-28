"use client";

import { m, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp } from "@/lib/motion/variants";

type RevealOnScrollProps = {
  children: ReactNode;
  variants?: Variants;
  className?: string;
};

/**
 * A standalone, self-triggering fade-up — for sections spaced far enough
 * apart on the page that they need to reveal independently, not a
 * cascading group. `RevealGroup`/`Reveal` intentionally trigger once for
 * the whole group the moment it enters view, which is correct for a
 * cluster of nearby items (a card grid) but wrong for something like a
 * long reading page: by the time a visitor scrolls to the fourth section,
 * a single page-wide group would already have finished animating
 * everything invisibly off-screen. This triggers each time its own
 * element crosses into view instead.
 */
export function RevealOnScroll({
  children,
  variants = fadeInUp,
  className,
}: RevealOnScrollProps) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      className={className}
    >
      {children}
    </m.div>
  );
}
