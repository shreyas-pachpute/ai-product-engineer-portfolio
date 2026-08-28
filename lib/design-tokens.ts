/**
 * Canonical JS/TS-side mirror of tokens that live primarily as CSS custom
 * properties in app/globals.css. These are the values components reach for
 * when a token is needed in *logic* (matchMedia queries, inline z-index on a
 * portaled element, GSAP/Framer config) rather than in a class name.
 *
 * Breakpoints mirror Tailwind v4's default `--breakpoint-*` scale exactly
 * (left un-themed in globals.css because the defaults are already the right
 * strategy — see Architecture Doc §29). Z-index mirrors the `--z-*` custom
 * properties declared in globals.css `:root`. If either changes, change it
 * in both places.
 */

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const zIndex = {
  base: 0,
  elevated: 10,
  sticky: 20,
  nav: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
} as const;

export type ZIndexToken = keyof typeof zIndex;

/**
 * Mirrors `--color-surface-base` from globals.css. Next's `viewport.themeColor`
 * (app/layout.tsx) sets a literal `<meta>` value and can't reference a CSS
 * custom property, so this is the one place a raw hex is legitimate — kept
 * here, named and commented, instead of inlined at the call site.
 */
// eslint-disable-next-line no-restricted-syntax -- documented exception above: Next's viewport.themeColor needs a literal value, not a CSS var.
export const surfaceBaseHex = "#07090a";
