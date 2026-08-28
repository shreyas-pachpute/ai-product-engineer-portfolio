"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Drives the sitewide cursor spotlight (see `CursorSpotlight`) via a single
 * `window`-level `pointermove` listener writing `--pointer-x`/`--pointer-y`/
 * `--pointer-active` directly onto `documentElement.style` — no React
 * state, no re-renders, the same imperative pattern Hero's local version
 * used before this replaced it. One listener for the whole site instead of
 * one per section is both the simpler implementation and the cheaper one.
 *
 * Renders nothing. Skips entirely (no listeners attached at all) under
 * reduced motion or on touch/coarse-pointer devices, where "follows the
 * cursor" has no meaning.
 */
export function CursorGlowController() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia(FINE_POINTER_QUERY).matches) return;

    const root = document.documentElement;
    let hasPositioned = false;

    function handlePointerMove(event: PointerEvent) {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
      root.style.setProperty("--pointer-active", "1");

      /*
       * `--pointer-x`/`-y` are now registered as <length> (see the
       * @property block in globals.css), which is what lets the spotlight
       * glide between pointer events instead of teleporting. That
       * introduces one edge case: a registered property always has a
       * value, so the var() fallback that used to center the light no
       * longer applies, and the first move would smear the glow in from
       * the 0px origin at the top-left.
       *
       * So the lag starts at 0s (set in globals.css), the first move
       * places the light instantly, and only then — one frame later, once
       * that position has been committed — does the real follow delay get
       * switched on. Every subsequent move eases.
       */
      if (!hasPositioned) {
        hasPositioned = true;
        requestAnimationFrame(() => {
          root.style.setProperty("--pointer-lag", "0.28s");
        });
      }
    }

    function handlePointerLeave() {
      root.style.setProperty("--pointer-active", "0");
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      root.style.removeProperty("--pointer-x");
      root.style.removeProperty("--pointer-y");
      root.style.removeProperty("--pointer-active");
      root.style.removeProperty("--pointer-lag");
    };
  }, [reducedMotion]);

  return null;
}
