/**
 * Sea trials: the weather the Projects page puts a real ship through.
 *
 * On the crossing, the reader sinks paper boats with six pressures. On the
 * Projects page the same six pressures (PRESSURES in lib/site.ts, same
 * order) are put to the ship, which stands for one of his real projects.
 * Each pressure is a condition at sea that tests one part of a ship, and
 * the ship comes through it:
 *
 *   0  keel      a beam sea and a crosswind; she holds her course
 *   1  ballast   a squall knocks her down; she rights herself
 *   2  hull      a full gale; she takes the seas
 *   3  stores    a long passage; the sun goes down and she keeps going
 *   4  compass   night; she sails on in the dark
 *   5  rigging   a fresh, shifting breeze; the camera looks up her rig
 *
 * A trial is a set of target values for the world (the same fields as a
 * timeline keyframe), blended in over a second or two on top of the page's
 * own shot, plus, for the squall, a knock-down of the ship's heel. Nothing
 * here draws; the world reads it each frame.
 */
import type { Sample } from "./timeline";

type Preset = Partial<
  Pick<
    Sample,
    | "elevation"
    | "azimuth"
    | "intensity"
    | "moon"
    | "ev"
    | "stars"
    | "fog"
    | "fogSky"
    | "cover"
    | "cloudDensity"
    | "cloudBase"
    | "cloudTop"
    | "storm"
    | "seaLength"
    | "seaHeight"
    | "seaSpread"
    | "wind"
    | "foam"
    | "foamLevel"
    | "rain"
    | "contrast"
    | "saturation"
    | "fov"
  >
> & {
  camera?: [number, number, number];
  look?: [number, number, number];
  speed?: number;
};

export const TRIAL_PRESETS: readonly Preset[] = [
  /* 0 keel: a beam sea, low at the waterline where the keel works. */
  {
    camera: [30, 2.6, 62],
    look: [-10, 6, 0],
    seaLength: 46,
    seaHeight: 2.8,
    seaSpread: 0.7,
    wind: 300,
    foam: 0.7,
    foamLevel: 0.68,
    cover: 0.55,
    speed: 5,
  },
  /* 1 ballast: a squall. Rain, a hard gust, a knock-down, and back up. */
  {
    camera: [36, 6, 76],
    look: [-12, 11, 0],
    cover: 0.93,
    cloudDensity: 0.026,
    cloudBase: 700,
    rain: 0.8,
    fog: 0.00045,
    fogSky: 0.12,
    seaLength: 40,
    seaHeight: 2.2,
    wind: 250,
    foam: 0.8,
    foamLevel: 0.64,
    ev: -0.15,
    saturation: 0.82,
    contrast: 1.08,
    speed: 6,
  },
  /* 2 hull: a full gale, seen from further off so the seas read. */
  {
    camera: [48, 10, 104],
    look: [-14, 9, 0],
    cover: 1,
    cloudDensity: 0.03,
    cloudBase: 500,
    cloudTop: 2600,
    storm: 0.5,
    rain: 1,
    fog: 0.0007,
    fogSky: 0.2,
    seaLength: 70,
    seaHeight: 6.5,
    seaSpread: 0.9,
    wind: 225,
    foam: 1,
    foamLevel: 0.55,
    intensity: 9,
    ev: -0.35,
    contrast: 1.12,
    saturation: 0.6,
    speed: 4,
  },
  /* 3 stores: the long passage. Low gold sun, a long way still to go. */
  {
    camera: [40, 6, 86],
    look: [-20, 12, 0],
    elevation: 3.5,
    azimuth: 70,
    cover: 0.32,
    ev: 0.35,
    seaLength: 52,
    seaHeight: 1.2,
    foam: 0.3,
    contrast: 1.06,
    saturation: 1.1,
    speed: 6,
  },
  /* 4 compass: night, a clear sky, the moon high. */
  {
    camera: [34, 6, 76],
    look: [-18, 13, 0],
    elevation: 30,
    azimuth: 150,
    intensity: 1.6,
    moon: 1,
    ev: -1.6,
    stars: 1,
    fog: 0.0005,
    fogSky: 0.08,
    cover: 0.25,
    seaLength: 40,
    seaHeight: 1.3,
    contrast: 1.08,
    saturation: 0.7,
    speed: 4,
  },
  /* 5 rigging: a fresh breeze; look up the rig where the wind is used. */
  {
    camera: [22, 4, 44],
    look: [-4, 22, 0],
    fov: 40,
    cover: 0.28,
    wind: 175,
    seaLength: 44,
    seaHeight: 1.6,
    foam: 0.55,
    foamLevel: 0.7,
    saturation: 1.05,
    speed: 6,
  },
];

/** Fields that span orders of magnitude, blended geometrically. */
const LOGARITHMIC = new Set([
  "intensity",
  "fog",
  "cloudDensity",
  "seaLength",
  "seaHeight",
]);

function mix(a: number, b: number, t: number, log: boolean): number {
  if (log && a > 0 && b > 0)
    return Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t);
  return a + (b - a) * t;
}

/** Blends `sample` toward trial `kind` by `t` (0–1). */
export function applyTrial(sample: Sample, kind: number, t: number): void {
  const preset = TRIAL_PRESETS[kind];
  if (!preset || t <= 0) return;
  const target = sample as unknown as Record<string, number>;
  for (const [key, value] of Object.entries(preset)) {
    if (key === "camera" || key === "look" || key === "speed") continue;
    target[key] = mix(target[key]!, value as number, t, LOGARITHMIC.has(key));
  }
  if (preset.camera) {
    for (let i = 0; i < 3; i++)
      sample.camera[i] = mix(sample.camera[i]!, preset.camera[i]!, t, false);
  }
  if (preset.look) {
    for (let i = 0; i < 3; i++)
      sample.look[i] = mix(sample.look[i]!, preset.look[i]!, t, false);
  }
  if (preset.speed !== undefined)
    sample.ship.speed = mix(sample.ship.speed, preset.speed, t, false);
}

/**
 * The squall's knock-down, as a target heel (radians) over the seconds
 * since the trial began: a gust lays her over, then lets go. The ship's
 * heel follows this through a slow spring, so she overshoots a little on
 * the way back up, the way a ballasted hull does.
 */
export function trialHeel(kind: number, age: number): number {
  if (kind !== 1) return 0;
  if (age < 0.9) return 0;
  if (age < 2.6) return 0.42;
  return 0;
}
