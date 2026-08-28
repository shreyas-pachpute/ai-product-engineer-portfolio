"use client";

import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down";

interface UseScrollDirectionOptions {
  /** Ignore movement smaller than this many px — filters trackpad/sub-pixel jitter so direction doesn't flicker. */
  threshold?: number;
  /** How far from the top (px) before hide-on-scroll-down becomes eligible at all — near the top, chrome should always stay visible. */
  revealZone?: number;
}

interface UseScrollDirectionResult {
  direction: ScrollDirection;
  /** True once scrolled past `revealZone`. */
  scrolledPast: boolean;
}

/**
 * Reusable scroll-direction primitive — not tied to the navbar. Built here
 * (Phase 3 "scroll utilities") so any future chrome that needs
 * hide-on-scroll-down / reveal-on-scroll-up behavior reads from one
 * correct implementation instead of every consumer hand-rolling a scroll
 * listener.
 */
export function useScrollDirection({
  threshold = 4,
  revealZone = 80,
}: UseScrollDirectionOptions = {}): UseScrollDirectionResult {
  const [direction, setDirection] = useState<ScrollDirection>("up");
  const [scrolledPast, setScrolledPast] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (Math.abs(delta) >= threshold) {
        setDirection(delta > 0 ? "down" : "up");
        lastY.current = y;
      }
      setScrolledPast(y > revealZone);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, revealZone]);

  return { direction, scrolledPast };
}
