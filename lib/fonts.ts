import { Fraunces, Mona_Sans } from "next/font/google";

/**
 * Two typefaces, with clearly different jobs.
 *
 * FRAUNCES — the voice. A soft, slightly wonky old-style serif, loaded as
 * one variable file with four axes:
 *   wght 100–900   weight
 *   opsz 9–144     optical size (the browser picks it from font-size)
 *   SOFT 0–100     how rounded the terminals are
 *   WONK 0–1       the "leaning" alternates for h, n, m…
 * It sets every headline and the wordmark. At display size with SOFT up it
 * reads like lettering cut for a print, which is the register the whole
 * illustrated world is in — and it is about as far from the grotesque of a
 * typical developer site as a typeface can get while staying legible.
 *
 * MONA SANS — the instrument. A plain grotesque for everything that is
 * read rather than looked at: body copy, labels, buttons. Its width axis
 * (75–125) is used for small labels, which are set wide instead of
 * uppercase-and-tracked.
 *
 * Both are self-hosted by next/font: no request to Google at runtime, and a
 * metric-matched fallback so the swap does not shift layout.
 */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  // Italic is used for single words of emphasis in headlines.
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

export const fontSans = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
});

export const fontVariables = [fontDisplay.variable, fontSans.variable].join(
  " ",
);
