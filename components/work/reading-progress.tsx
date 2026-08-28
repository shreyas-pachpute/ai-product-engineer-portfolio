"use client";

import { useRef, type ReactNode } from "react";
import { m, useScroll } from "framer-motion";

type ReadingProgressProps = {
  children: ReactNode;
};

/**
 * Thin fixed bar tracking scroll progress through the wrapped content —
 * bound directly to a motion value via `style`, not React state, so it
 * costs zero re-renders for the entire length of the article regardless
 * of scroll speed. Wraps `children` (the server-rendered article content)
 * purely to get a ref on its container; it doesn't need to know anything
 * about what's inside.
 */
export function ReadingProgress({ children }: ReadingProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <>
      <m.div
        aria-hidden="true"
        className="bg-accent-primary fixed inset-x-0 top-0 z-[var(--z-sticky)] h-0.5 origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      <div ref={ref}>{children}</div>
    </>
  );
}
