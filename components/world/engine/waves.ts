/**
 * The swell — one definition, two languages.
 *
 * The sea's surface is displaced in the vertex shader, and everything that
 * floats on it (the paper boat, the ship, the buoys) is positioned from
 * JavaScript. Both have to agree on where the water is, or hulls hover and
 * sink through crests. So the wave set lives here once, and is emitted both
 * as a TypeScript function and as the GLSL that the sea material compiles.
 *
 * Plain sines rather than Gerstner waves on purpose: a sum of sines is a
 * height *function* of (x, z), so buoyancy is a direct lookup. Gerstner
 * waves move points sideways as well, which would need an iterative solve
 * per floating object per frame for a difference nobody can see once the
 * surface is drawn as flat bands of colour.
 */

type Wave = {
  /** Unit direction of travel on the xz plane. */
  dirX: number;
  dirZ: number;
  /** Crest-to-crest distance, world units. */
  length: number;
  /** Height at swell = 1, world units. */
  amplitude: number;
  /** Radians per second. */
  speed: number;
};

function wave(
  angleDeg: number,
  length: number,
  amplitude: number,
  speed: number,
): Wave {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    dirX: Math.cos(angle),
    dirZ: Math.sin(angle),
    length,
    amplitude,
    speed,
  };
}

/**
 * Long swell first, chop last. The angles are spread so no two trains run
 * parallel — parallel trains beat against each other into visible stripes.
 */
export const WAVES: readonly Wave[] = [
  wave(14, 19, 0.34, 0.62),
  wave(-38, 11.5, 0.2, 0.86),
  wave(71, 6.4, 0.105, 1.18),
  wave(-112, 3.7, 0.05, 1.7),
];

/** Sum of the amplitudes: the largest possible height at swell = 1. */
export const WAVE_PEAK = WAVES.reduce((sum, w) => sum + w.amplitude, 0);

/** Water height at a point. `swell` scales the whole set. */
export function waveHeight(
  x: number,
  z: number,
  time: number,
  swell: number,
): number {
  let height = 0;
  for (const w of WAVES) {
    const k = (Math.PI * 2) / w.length;
    height +=
      w.amplitude * Math.sin(k * (w.dirX * x + w.dirZ * z) - w.speed * time);
  }
  return height * swell;
}

/** Surface slope (dh/dx, dh/dz) — what a hull tilts to. */
export function waveSlope(
  x: number,
  z: number,
  time: number,
  swell: number,
): { dx: number; dz: number } {
  let dx = 0;
  let dz = 0;
  for (const w of WAVES) {
    const k = (Math.PI * 2) / w.length;
    const c =
      w.amplitude *
      k *
      Math.cos(k * (w.dirX * x + w.dirZ * z) - w.speed * time);
    dx += c * w.dirX;
    dz += c * w.dirZ;
  }
  return { dx: dx * swell, dz: dz * swell };
}

/**
 * The same sum as GLSL. Generated from WAVES rather than typed out a
 * second time, so the two cannot drift apart.
 */
export const WAVE_GLSL = /* glsl */ `
const float WAVE_PEAK = ${WAVE_PEAK.toFixed(5)};

float waveHeight(vec2 p, float t) {
  float h = 0.0;
${WAVES.map((w) => {
  const k = ((Math.PI * 2) / w.length).toFixed(5);
  return `  h += ${w.amplitude.toFixed(5)} * sin(${k} * dot(vec2(${w.dirX.toFixed(5)}, ${w.dirZ.toFixed(5)}), p) - ${w.speed.toFixed(5)} * t);`;
}).join("\n")}
  return h;
}

vec2 waveSlope(vec2 p, float t) {
  vec2 s = vec2(0.0);
${WAVES.map((w) => {
  const k = ((Math.PI * 2) / w.length).toFixed(5);
  return `  s += ${(w.amplitude * ((Math.PI * 2) / w.length)).toFixed(5)} * cos(${k} * dot(vec2(${w.dirX.toFixed(5)}, ${w.dirZ.toFixed(5)}), p) - ${w.speed.toFixed(5)} * t) * vec2(${w.dirX.toFixed(5)}, ${w.dirZ.toFixed(5)});`;
}).join("\n")}
  return s;
}
`;
