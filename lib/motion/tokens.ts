/**
 * Canonical motion timing tokens — Architecture Doc §13/§18.
 *
 * Three intent tiers, not a grab-bag of durations:
 *  - feedback:    something responded to input (hover, press, focus)
 *  - orientation: context changed (tab switch, active-route indicator)
 *  - narrative:   something is being revealed for the first time (scroll
 *                 reveals, sticky cross-fades, hero entrance)
 *
 * These are the values Framer Motion and GSAP consume directly (both
 * libraries take durations in seconds and accept a 4-number cubic-bezier
 * array as an easing function). The equivalent curves are declared as CSS
 * custom properties in app/globals.css (`--ease-feedback`, etc.) for
 * CSS-only transitions — kept in sync by hand, see the comment there.
 *
 * No provider wiring lives here (Lenis/GSAP setup is Phase 3). This file is
 * pure, framework-agnostic token data so it can be imported by either
 * animation library without pulling the other one in.
 */

export const motionDuration = {
  feedback: 0.16,
  orientation: 0.3,
  narrative: 0.55,
} as const;

export type MotionDurationToken = keyof typeof motionDuration;

/** Cubic-bezier control points — usable directly as a Framer Motion `ease`. */
export const motionEasing = {
  feedback: [0.16, 1, 0.3, 1],
  orientation: [0.25, 1, 0.5, 1],
  narrative: [0, 0, 0.2, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export type MotionEasingToken = keyof typeof motionEasing;

/** Formats a token's easing as a CSS `cubic-bezier()` string, e.g. for GSAP's CustomEase (Phase 3+) or inline styles. */
export function toCubicBezierString(token: MotionEasingToken): string {
  const [x1, y1, x2, y2] = motionEasing[token];
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
}

/** A ready-to-spread Framer Motion transition for a given intent tier. */
export function motionTransition(token: MotionEasingToken) {
  return {
    duration: motionDuration[token],
    ease: motionEasing[token],
  } as const;
}
