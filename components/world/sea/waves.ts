/**
 * The sea's surface, defined once.
 *
 * The water is a sum of many waves, each a little shorter and a little
 * weaker than the last, travelling roughly downwind. Three things make it
 * read as water rather than as a pattern:
 *
 *   - each wave is peaked, not a sine: `exp(sin(x) - 1)` has sharp crests
 *     and long flat troughs, the shape gravity gives real waves;
 *   - each wave pushes the next ones sideways a little (the "drag" below),
 *     so crests bunch and fold into each other instead of just overlapping;
 *   - each wave moves at the speed physics says a wave of its length moves
 *     in deep water (omega = sqrt(g k)), so long swells roll through fast
 *     and small ripples crawl. That is where the feeling of weight is.
 *
 * The technique is the octave-warped wave sum popularised by afl_ext's
 * "Very fast procedural ocean" and by Acerola's ocean write-up; the wind
 * bias, the physical dispersion and the exact slopes are additions.
 *
 * WHO USES IT
 * The GPU, to move and shade the surface, and the CPU, to float the boats
 * on it. If the two disagreed, hulls would hover over troughs or sink
 * through crests — so both read the same table of waves (`WaveTable`),
 * which is filled in once per frame on the CPU. That also means the
 * shader never computes a direction, a frequency or a wave speed: per
 * pixel, per wave, all that is left is one sine, one cosine and one
 * exponential.
 */

/** How strongly each wave drags the ones after it. */
const DRAG = 0.38;
/** Each wave is this much shorter than the one before. */
const FREQUENCY_STEP = 1.18;
/** ...and carries this much of its weight. */
const WEIGHT_STEP = 0.8;
/** Pseudo-random stride through wave directions. */
const SEED_STEP = 1232.399963;
/** exp(sin(x) - 1) averages about this, so the sea is level around zero. */
const MEAN_LEVEL = 0.465;
const GRAVITY = 9.81;

export const MAX_WAVES = 32;
export const WAVE_FREQUENCY_STEP = FREQUENCY_STEP;

export type Sea = {
  /** Length of the longest wave, metres. */
  length: number;
  /** Height scale, metres (roughly crest above mean level). */
  height: number;
  /** Direction the wind blows toward, radians, in the xz plane. */
  wind: number;
  /** How far wave directions fan out around the wind, radians. */
  spread: number;
};

/** The waves of one frame, in the form both the CPU and the GPU read. */
export class WaveTable {
  /** Per wave: direction x, direction z, frequency, phase offset. */
  readonly waves = new Float32Array(MAX_WAVES * 4);
  /** Base wavenumber (radians per metre) and height scale (metres). */
  k0 = 1;
  height = 0;

  update(sea: Sea, time: number): void {
    this.k0 = (2 * Math.PI) / sea.length;
    this.height = sea.height;
    let frequency = 1;
    let seed = 0;
    for (let i = 0; i < MAX_WAVES; i++) {
      const angle = sea.wind + Math.sin(seed) * sea.spread;
      // Keep the phase small, so single precision on the GPU holds up
      // however long the page has been open.
      const travelled =
        (time * Math.sqrt(GRAVITY * this.k0 * frequency)) % (2 * Math.PI);
      this.waves[i * 4] = Math.cos(angle);
      this.waves[i * 4 + 1] = Math.sin(angle);
      this.waves[i * 4 + 2] = frequency;
      this.waves[i * 4 + 3] = (seed % (2 * Math.PI)) - travelled;
      frequency *= FREQUENCY_STEP;
      seed += SEED_STEP;
    }
  }

  /** Height of the surface above mean sea level at (x, z), metres. */
  heightAt(x: number, z: number, iterations: number): number {
    const waves = this.waves;
    let px = x * this.k0;
    let pz = z * this.k0;
    let weight = 1;
    let sum = 0;
    let total = 0;
    for (let i = 0; i < iterations; i++) {
      const dx = waves[i * 4]!;
      const dz = waves[i * 4 + 1]!;
      const phase = (dx * px + dz * pz) * waves[i * 4 + 2]! + waves[i * 4 + 3]!;
      const wave = Math.exp(Math.sin(phase) - 1);
      const slope = wave * Math.cos(phase);
      px -= dx * slope * weight * DRAG;
      pz -= dz * slope * weight * DRAG;
      sum += wave * weight;
      total += weight;
      weight *= WEIGHT_STEP;
    }
    return (sum / total - MEAN_LEVEL) * this.height;
  }
}

/**
 * The same sum for the shaders.
 *
 *   seaHeight(p, n)    height in metres at world xz position p
 *   seaSurface(p, n)   (height, dh/dx, dh/dz)
 *
 * The slope in seaSurface is exact, not estimated from neighbouring
 * samples: alongside the position it carries a 2x2 matrix recording how
 * the warped position moves when the true position does, and applies the
 * chain rule through every wave. One pass, and no sampling distance to
 * tune.
 */
export const WAVES_GLSL = /* glsl */ `
uniform vec4 uWaves[${MAX_WAVES}];
uniform float uSeaK;
uniform float uSeaHeight;
uniform float uSeaLength;

float seaHeight(vec2 position, int iterations) {
  vec2 p = position * uSeaK;
  float weight = 1.0;
  float sum = 0.0;
  float total = 0.0;
  for (int i = 0; i < ${MAX_WAVES}; i++) {
    if (i >= iterations) break;
    vec4 w = uWaves[i];
    float phase = dot(w.xy, p) * w.z + w.w;
    float wave = exp(sin(phase) - 1.0);
    p -= w.xy * (wave * cos(phase) * weight * ${DRAG});
    sum += wave * weight;
    total += weight;
    weight *= ${WEIGHT_STEP};
  }
  return (sum / total - ${MEAN_LEVEL}) * uSeaHeight;
}
`;

export const WAVES_SLOPE_GLSL = /* glsl */ `
vec3 seaSurface(vec2 position, int iterations) {
  vec2 p = position * uSeaK;
  mat2 J = mat2(1.0, 0.0, 0.0, 1.0);
  float weight = 1.0;
  float sum = 0.0;
  float total = 0.0;
  vec2 gradient = vec2(0.0);
  for (int i = 0; i < ${MAX_WAVES}; i++) {
    if (i >= iterations) break;
    vec4 w = uWaves[i];
    float phase = dot(w.xy, p) * w.z + w.w;
    float sn = sin(phase);
    float cs = cos(phase);
    float wave = exp(sn - 1.0);
    float slope = wave * cs;
    // How the phase changes with the true position...
    vec2 gphase = (w.xy * J) * w.z;
    gradient += gphase * (slope * weight);
    // ...and how this wave's drag changes it for every wave after.
    J -= outerProduct(w.xy, gphase) * (wave * (cs * cs - sn) * weight * ${DRAG});
    p -= w.xy * (slope * weight * ${DRAG});
    sum += wave * weight;
    total += weight;
    weight *= ${WEIGHT_STEP};
  }
  float scale = uSeaHeight / total;
  return vec3((sum / total - ${MEAN_LEVEL}) * uSeaHeight, gradient * (scale * uSeaK));
}
`;
