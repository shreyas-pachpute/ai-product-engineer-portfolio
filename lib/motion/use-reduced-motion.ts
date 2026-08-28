"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** Server has no OS preference to read; assume full motion until the client corrects it on mount. */
function getServerSnapshot() {
  return false;
}

/**
 * The single source of truth for "does this visitor want reduced motion."
 * Framer Motion's own `reducedMotion="user"` (see MotionProvider) already
 * handles this for `m`/`motion` components automatically — this hook exists
 * for everything Framer Motion doesn't touch: Lenis (skip smoothing
 * entirely), scroll-driven hide/show behavior, and any future GSAP work.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
