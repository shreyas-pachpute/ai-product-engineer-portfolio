"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Drives the per-card cursor highlight (the `spotlight` utility in
 * globals.css) by writing `--spot-x`/`--spot-y` onto whichever
 * `[data-spotlight]` element the pointer is currently inside.
 *
 * Event delegation, not a component per card. The alternative — a client
 * component wrapping every card so it can own `onPointerMove` — would
 * force every Card that wants a highlight across the server/client
 * boundary, which on this site means Capabilities, ProofBar and
 * FeaturedWork all stop being Server Components for the sake of a hover
 * effect. One document-level listener keeps every one of them server-
 * rendered, and costs one `closest()` call per pointermove.
 *
 * Two details worth keeping:
 *
 *  - The listener is passive. It never calls preventDefault, and marking
 *    it passive lets the browser keep scrolling off the main thread while
 *    the pointer moves.
 *  - Coordinates are element-relative percentages, computed from the
 *    card's own rect, so the gradient in CSS needs no knowledge of the
 *    card's size or position.
 *
 * Renders nothing. Attaches nothing under reduced motion or on
 * coarse-pointer devices, where a cursor-following highlight has no
 * meaning — matching CursorGlowController's behavior exactly.
 */
export function SpotlightController() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia(FINE_POINTER_QUERY).matches) return;

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const card = target.closest<HTMLElement>("[data-spotlight]");
      if (!card) return;

      const rect = card.getBoundingClientRect();
      // Guard against a zero-size rect (an element mid-transition, or one
      // that is display:none in a layout the pointer is somehow still
      // over) — dividing by zero here yields NaN, which silently
      // invalidates the custom property and drops the highlight.
      if (rect.width === 0 || rect.height === 0) return;

      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--spot-x", `${x}%`);
      card.style.setProperty("--spot-y", `${y}%`);
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [reducedMotion]);

  return null;
}
