import { MARK } from "@/components/brand/logo";

/**
 * Shared pieces for the generated home-screen icon. (The share card is a
 * rendered photograph of the world: app/opengraph-image.png.) These run at build time in Node, not in the browser, and
 * are drawn by Next's image renderer — which understands a subset of CSS
 * and needs its fonts handed to it as files.
 *
 * Colours are literal here because that renderer cannot read the CSS
 * custom properties in app/globals.css. They are the same four.
 */
/* eslint-disable no-restricted-syntax -- the image renderer cannot read CSS tokens */
export const PAINT = {
  ink: "#0b2a3f",
  paper: "#fbf3e4",
  vermilion: "#ff4b2b",
  sun: "#ffc53d",
} as const;
/* eslint-enable no-restricted-syntax */

/** The mark, for the image renderer (which wants explicit sizes and colours). */
export function MarkImage({
  size,
  line,
  pennant,
}: {
  size: number;
  line: string;
  pennant: string;
}) {
  return (
    <svg width={size} height={size} viewBox={MARK.viewBox} fill="none">
      <path d={MARK.mast} fill={line} />
      <circle {...MARK.truck} fill={line} />
      <path d={MARK.bowl} stroke={line} strokeWidth={MARK.bowlWidth} />
      <path d={MARK.pennant} fill={pennant} />
    </svg>
  );
}
