"use client";

import { m, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Scroll-triggered stagger container — the below-the-fold counterpart to
 * Hero's on-load stagger (same shape, `whileInView` instead of `animate`).
 * Pairs with `Reveal` children, which inherit "hidden"/"visible" from this
 * ancestor rather than declaring their own trigger. Fires once, the first
 * time it crosses into the viewport, so repeated scrolling up/down
 * doesn't re-trigger it.
 */
export function RevealGroup({ children, className }: RevealGroupProps) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </m.div>
  );
}
