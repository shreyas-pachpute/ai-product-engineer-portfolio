"use client";

import { m, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp } from "@/lib/motion/variants";

type RevealProps = {
  children: ReactNode;
  variants?: Variants;
  className?: string;
};

/**
 * A single reveal-animated item. Deliberately has no `initial`/trigger of
 * its own — it inherits "hidden"/"visible" from the nearest ancestor that
 * declares them (normally `RevealGroup`). Used standalone (outside a
 * matching ancestor), it will render but never animate; that's a feature,
 * not a footgun — it means this always fails toward "static and correct,"
 * never toward "invisible content."
 */
export function Reveal({
  children,
  variants = fadeInUp,
  className,
}: RevealProps) {
  return (
    <m.div variants={variants} className={className}>
      {children}
    </m.div>
  );
}
