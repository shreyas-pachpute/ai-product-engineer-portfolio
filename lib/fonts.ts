import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

/**
 * Font pairing rationale (Architecture Doc §15):
 * Inter alone is the single most common choice in this design tier (Linear,
 * Vercel, Raycast all ship it end-to-end). Splitting the pairing keeps Inter
 * for body copy, where neutral legibility wins, and gives display type its
 * own voice with Space Grotesk — a geometric sans with enough character to
 * read as intentional rather than templated at hero scale.
 *
 * All three are self-hosted automatically by next/font (no runtime request
 * to Google Fonts, no layout shift from a late-loading @font-face swap).
 *
 * All three load as VARIABLE fonts — note the absence of a `weight` option
 * below, which is what selects the variable file rather than a set of static
 * instances. This matters for more than file count:
 *
 *  - `font-variation-settings` becomes animatable, which is what the hero's
 *    weight-settle reveal is built on. Static instances can only cross-fade
 *    between two files; a variable axis interpolates continuously.
 *  - Any weight in the axis range is available, not just the three that were
 *    pre-declared — so a 550 or a 300 is now a design option rather than a
 *    request to add another font file.
 *
 * Axis ranges (verified against next/font's Google font data, not assumed):
 *   Space Grotesk  wght 300–700
 *   Inter          wght 100–900, opsz 14–32
 *   JetBrains Mono wght 100–800
 */

export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/**
 * `axes: ["opsz"]` opts into Inter's optical-size axis on top of weight.
 * Paired with `font-optical-sizing: auto` in globals.css, the browser then
 * retunes letterforms by rendered size automatically — tighter spacing and
 * thinner hairlines at display scale, looser and sturdier at caption scale.
 * It is the difference between type that was scaled and type that was drawn
 * for its size, and it costs one axis.
 */
export const fontSans = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = [
  fontDisplay.variable,
  fontSans.variable,
  fontMono.variable,
].join(" ");
