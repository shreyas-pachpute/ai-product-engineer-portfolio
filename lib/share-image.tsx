import { readFile } from "node:fs/promises";
import path from "node:path";
import { MARK } from "@/components/brand/logo";

/**
 * Shared pieces for the generated images (the share card and the home
 * screen icon). These run at build time in Node, not in the browser, and
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
  skyTop: "#ff8e63",
  skyHorizon: "#ffd7a8",
  sunDisc: "#fff4d6",
  sunHalo: "#ffc27a",
  seaLight: "#3fbfb2",
  seaMid: "#168c97",
  seaDeep: "#0b5c6e",
} as const;
/* eslint-enable no-restricted-syntax */

/**
 * Fraunces, as a static cut of the variable font at the settings the site
 * uses for headlines (weight 620, soft, wonky, display optical size). See
 * assets/fonts/ for the file and its licence.
 */
export async function loadFonts() {
  const [display, sans] = await Promise.all([
    readFile(path.join(process.cwd(), "assets/fonts/Fraunces-Display.ttf")),
    readFile(
      path.join(
        process.cwd(),
        "node_modules/@fontsource/mona-sans/files/mona-sans-latin-600-normal.woff",
      ),
    ),
  ]);
  return [
    {
      name: "Fraunces",
      data: display,
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "Mona Sans",
      data: sans,
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}

/** The mark, for the image renderer (which wants explicit sizes and colours). */
export function MarkImage({
  size,
  line,
  sail,
}: {
  size: number;
  line: string;
  sail: string;
}) {
  return (
    <svg width={size} height={size} viewBox={MARK.viewBox} fill="none">
      <rect {...MARK.mast} fill={line} />
      <path d={MARK.sail} fill={sail} />
      <path
        d={MARK.wave}
        stroke={line}
        strokeWidth={MARK.waveWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
