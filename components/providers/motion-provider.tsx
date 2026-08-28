"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";
import { motionEasing } from "@/lib/motion/tokens";

/**
 * `domAnimation` (not `domMax`) — covers animate/exit/gestures/layout
 * animation, which is everything the nav's shared-layout active indicator
 * and future scroll reveals need. `domMax` adds drag + advanced layout
 * projection this site has no use for; not loading it is a real bundle-size
 * win, not a hypothetical one.
 *
 * `strict` means every animated element in the codebase must use `m.*`
 * (from framer-motion) rather than `motion.*` — using `motion.*` anywhere
 * will throw. This is deliberate: it's how the `domAnimation`-only bundle
 * stays enforced project-wide instead of silently regressing the first
 * time someone reaches for the more familiar `motion` import.
 *
 * `MotionConfig reducedMotion="user"` is the project's primary
 * reduced-motion mechanism for anything built with Framer Motion — it
 * reads the OS `prefers-reduced-motion` setting and neutralizes
 * transform/layout animation on every descendant `m` component
 * automatically, with no per-component opt-in required.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ ease: motionEasing.orientation }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
