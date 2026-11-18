/**
 * Colour, as data.
 *
 * The world has one palette per chapter — the same sea at a different time
 * of day — and the engine interpolates between them as the page scrolls.
 * Time of day *is* the progress indicator: dawn in the harbour, flat noon
 * light over the paper boat, the warm paper of the drawing board, a storm
 * at night, and sunrise on open water.
 *
 * Colours are plain sRGB triples (0–1). The renderer runs with three's
 * colour management off and writes these values to the screen untouched,
 * because this is flat illustration: a swatch chosen here has to be the
 * exact swatch on screen, not a physically "correct" conversion of it.
 *
 * There is no purple or violet anywhere, on purpose. Night is navy.
 */

export type RGB = readonly [number, number, number];

export function hex(value: string): RGB {
  const n = parseInt(value.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** The brand colours. Mirrored as CSS custom properties in app/globals.css. */
export const BRAND = {
  ink: hex("#0B2A3F"),
  paper: hex("#FBF3E4"),
  vermilion: hex("#FF4B2B"),
  sun: hex("#FFC53D"),
} as const;

export type Palette = {
  /** Sky at the zenith and at the horizon. */
  skyTop: RGB;
  skyHorizon: RGB;
  /** The sun (or moon) disc and its halo ring. */
  sun: RGB;
  sunHalo: RGB;
  cloud: RGB;
  cloudShade: RGB;
  /** Sea: troughs, mid water, crests, and where it meets the horizon. */
  seaDeep: RGB;
  seaMid: RGB;
  seaLight: RGB;
  seaFar: RGB;
  foam: RGB;
  /** Multiplied into every object's shadow side. Sets the mood of the light. */
  shade: RGB;
  /** Multiplied into everything lit. White in daylight, blue at night. */
  ambient: RGB;
  /** Outline colour for the whole frame. */
  ink: RGB;
  /** Distant objects fade to this. */
  haze: RGB;
};

/** Harbour at dawn. Coral sky, teal water, a low cream sun. */
const dawn: Palette = {
  skyTop: hex("#FF8E63"),
  skyHorizon: hex("#FFD7A8"),
  sun: hex("#FFF4D6"),
  sunHalo: hex("#FFC27A"),
  cloud: hex("#FFE9CC"),
  cloudShade: hex("#FFB98A"),
  seaDeep: hex("#0B5C6E"),
  seaMid: hex("#168C97"),
  seaLight: hex("#3FBFB2"),
  seaFar: hex("#F2B48A"),
  foam: hex("#FDF6E6"),
  shade: hex("#86A0B4"),
  ambient: hex("#FFFFFF"),
  ink: hex("#0B2A3F"),
  haze: hex("#FFC79C"),
};

/** Flat, bright midday. The light a demo is always shown in. */
const noon: Palette = {
  skyTop: hex("#3FA9D8"),
  skyHorizon: hex("#CFEFF2"),
  sun: hex("#FFFBEA"),
  sunHalo: hex("#E4F6F4"),
  cloud: hex("#FFFFFF"),
  cloudShade: hex("#C7E6EE"),
  seaDeep: hex("#0A6C8A"),
  seaMid: hex("#1E9FB3"),
  seaLight: hex("#62D2C4"),
  seaFar: hex("#BFE9EA"),
  foam: hex("#FFFFFF"),
  shade: hex("#7FA0C4"),
  ambient: hex("#FFFFFF"),
  ink: hex("#0B2A3F"),
  haze: hex("#C9ECEE"),
};

/** The drawing board. The sea has become paper; the sky is the same sheet. */
const paper: Palette = {
  skyTop: hex("#F6EAD3"),
  skyHorizon: hex("#FBF3E4"),
  sun: hex("#FBF3E4"),
  sunHalo: hex("#FBF3E4"),
  cloud: hex("#FBF3E4"),
  cloudShade: hex("#FBF3E4"),
  seaDeep: hex("#F1E3C8"),
  seaMid: hex("#F6EAD3"),
  seaLight: hex("#FBF3E4"),
  seaFar: hex("#FBF3E4"),
  foam: hex("#FBF3E4"),
  shade: hex("#C9A98C"),
  ambient: hex("#FFFFFF"),
  ink: hex("#0B2A3F"),
  haze: hex("#FBF3E4"),
};

/** Weather. Navy sky, heavy water, one warm light. */
const storm: Palette = {
  skyTop: hex("#071B2F"),
  skyHorizon: hex("#1C4A63"),
  sun: hex("#DCEBEE"),
  sunHalo: hex("#2C6079"),
  cloud: hex("#1F4A61"),
  cloudShade: hex("#0F3048"),
  seaDeep: hex("#052334"),
  seaMid: hex("#0C4458"),
  seaLight: hex("#1D7386"),
  seaFar: hex("#1C4A63"),
  foam: hex("#B9DCE0"),
  shade: hex("#3E5F86"),
  ambient: hex("#9FC3D6"),
  ink: hex("#031320"),
  haze: hex("#1C4A63"),
};

/** Open water at sunrise. The warmest frame of the crossing. */
const sunrise: Palette = {
  skyTop: hex("#FF6A4D"),
  skyHorizon: hex("#FFD27A"),
  sun: hex("#FFF6DC"),
  sunHalo: hex("#FFB25E"),
  cloud: hex("#FFE2B8"),
  cloudShade: hex("#FF9C6B"),
  seaDeep: hex("#0C6677"),
  seaMid: hex("#1B9AA0"),
  seaLight: hex("#58CDB6"),
  seaFar: hex("#FFC27D"),
  foam: hex("#FFF8E8"),
  shade: hex("#8AA5B6"),
  ambient: hex("#FFFFFF"),
  ink: hex("#0B2A3F"),
  haze: hex("#FFC58A"),
};

export const PALETTES = { dawn, noon, paper, storm, sunrise } as const;

export type PaletteName = keyof typeof PALETTES;

const KEYS = Object.keys(dawn) as (keyof Palette)[];

/** Writes the blend of two palettes into `out`. No allocation per frame. */
export function mixPalette(
  out: Record<keyof Palette, [number, number, number]>,
  a: Palette,
  b: Palette,
  t: number,
): void {
  for (const key of KEYS) {
    const from = a[key];
    const to = b[key];
    const target = out[key];
    target[0] = from[0] + (to[0] - from[0]) * t;
    target[1] = from[1] + (to[1] - from[1]) * t;
    target[2] = from[2] + (to[2] - from[2]) * t;
  }
}

export function emptyPalette(): Record<
  keyof Palette,
  [number, number, number]
> {
  const out = {} as Record<keyof Palette, [number, number, number]>;
  for (const key of KEYS) out[key] = [0, 0, 0];
  return out;
}
