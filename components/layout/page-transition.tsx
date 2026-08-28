"use client";

import { AnimatePresence, m } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { motionDuration, motionEasing } from "@/lib/motion/tokens";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

/**
 * Client-side route changes (Next's App Router intercepts `<Link>` clicks —
 * no full page load) leave a real gap a full navigation doesn't have: the
 * browser has nothing to reset focus to, and nothing to announce, so
 * keyboard focus just sits on the link that was clicked and screen-reader
 * users get no signal a new page even loaded. Moving focus to `#main-content`
 * (see its `tabIndex={-1}` in app/layout.tsx) on every pathname change
 * approximates what a real navigation gives for free. Skips the initial
 * mount deliberately — the first load already starts focus at the top of
 * the document, matching normal browser behavior.
 */
function useRouteChangeFocus(pathname: string) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.getElementById("main-content")?.focus();
  }, [pathname]);
}

/**
 * Route-transition foundation (Phase 3 / Phase 5's "page transition
 * hooks"). Deliberately subtle — a crossfade with a small vertical
 * settle, not a scene-level animation — because this wraps every future
 * page's content and needs to stay out of the way of whatever that content
 * does with its own motion.
 *
 * Bails out to a plain passthrough under reduced motion rather than relying
 * solely on MotionConfig's neutralization — AnimatePresence exit timing has
 * more edge cases than a simple `animate` call, and an unmount that never
 * resolves is worse than just not animating.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  useRouteChangeFocus(pathname);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: motionDuration.narrative,
          ease: motionEasing.narrative,
        }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
