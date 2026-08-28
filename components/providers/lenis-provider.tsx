"use client";

import Lenis from "lenis";
import {
  createContext,
  use,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

/**
 * The live Lenis instance, or `null` when smooth scroll is off (reduced
 * motion) or not yet created. Backed by a ref, not state — every real
 * consumer (a "back to top" click handler, a future command palette)
 * reads this imperatively at the moment it's needed rather than needing a
 * re-render when Lenis itself becomes ready, so there's no reason to pay
 * for reactivity here.
 */
export function useLenis(): Lenis | null {
  const ref = use(LenisContext);
  return ref?.current ?? null;
}

/**
 * Owns the Lenis instance for the whole app. Two responsibilities beyond
 * "create Lenis":
 *
 * 1. Reduced motion: Lenis is never instantiated at all when the OS
 *    preference is set — native scrolling takes over completely, which is
 *    both simpler and more correct than trying to animate a "reduced"
 *    version of momentum scrolling.
 *
 * 2. Route-change scroll reset: Lenis keeps its own internal scroll-position
 *    state in sync with the DOM via rAF. Next's App Router changes the page
 *    without a full reload, so without this, navigating to a new route can
 *    leave Lenis's internal target scroll position stale, and it will
 *    visibly fight/snap the page back toward wherever it last thought it
 *    should be. Forcing an immediate `scrollTo(0)` on every pathname change
 *    keeps Lenis's state authoritative. This is the mechanism behind Phase
 *    5's "scroll restoration" — implemented once here rather than in two
 *    places.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const instance = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      autoRaf: true,
    });
    lenisRef.current = instance;

    return () => {
      instance.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <LenisContext value={lenisRef}>{children}</LenisContext>;
}
