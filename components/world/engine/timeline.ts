import { PALETTES, type PaletteName } from "./palette";

/**
 * The crossing, as keyframes.
 *
 * The page's scroll position is turned into one number, the "chapter
 * coordinate": 0 at the top of the first chapter, 1 at the top of the
 * second, and so on, with fractions in between. Every property of the
 * world — where the camera is, what time of day it is, how rough the sea
 * is, how much of the ship has been built — is a function of that number,
 * defined by the keyframes below and interpolated between them.
 *
 * That is the whole animation system for the 3D scene. There are no
 * tweens to start, stop or clean up, and no state that can get out of
 * step with the page: scroll to any point, in either direction, at any
 * speed, and the world is exactly what the keyframes say it is there.
 *
 * FRAMING
 * In every sea chapter the camera looks slightly up, which puts the
 * horizon about 60% of the way down the screen. The top of the frame is
 * sky, and that is where the page sets its text: dark type on a light sky
 * is always legible, where type over the moving bands of the sea is not.
 *
 * Chapters:
 *   0  Harbour     dawn; one paper boat on a gentle sea
 *   1  Paper       noon; the swell builds and the paper boat struggles
 *   2  Drawing board   the sea flattens into paper; the ship is built
 *   3  Weather     night and storm; the ship holds, a lighthouse sweeps
 *   4  Open water  sunrise; the ship sails for the horizon
 */

type Vec3 = [number, number, number];

export type Frame = {
  /** Chapter coordinate this frame sits at. */
  at: number;
  palette: PaletteName;
  camera: Vec3;
  look: Vec3;
  /** Vertical field of view in degrees, for a 16:10 frame. */
  fov: number;
  /**
   * Sideways shift of the camera on a portrait screen, in world units.
   * A wide frame puts the subject to one side to leave room for type; a
   * tall one has the type above the subject, so the subject is centred.
   */
  narrowX: number;
  /** The same idea vertically: how far the camera's aim lifts on a portrait screen. */
  narrowY: number;
  swell: number;
  clouds: number;
  stars: number;
  sunDir: Vec3;
  sunSize: number;
  /** Direction the key light comes from. */
  light: Vec3;
  /** 0 = sea, 1 = drawing board. */
  paper: number;
  foam: number;
  glitter: number;
  hazeNear: number;
  hazeFar: number;

  boat: { x: number; z: number; yaw: number; scale: number; opacity: number };
  ship: { x: number; z: number; yaw: number; build: number; opacity: number };
  wake: number;
  beam: number;
  rain: number;
};

const SUN_DAWN: Vec3 = [0.34, 0.085, -1];
const SUN_NOON: Vec3 = [0.35, 0.8, -0.5];
const SUN_RISE: Vec3 = [-0.42, 0.07, -1];

export const FRAMES: Frame[] = [
  /* 0 — Harbour. The frame the intro hands off to. */
  {
    at: 0,
    palette: "dawn",
    camera: [-1.6, 1.5, 11.5],
    look: [-0.6, 2.25, 0],
    fov: 31,
    narrowX: 2.1,
    narrowY: 0,
    swell: 0.5,
    clouds: 0.52,
    stars: 0,
    sunDir: SUN_DAWN,
    sunSize: 0.004,
    light: [0.55, 0.6, 0.45],
    paper: 0,
    foam: 0.07,
    glitter: 1,
    hazeNear: 30,
    hazeFar: 170,
    boat: { x: 2.9, z: 0.4, yaw: 0.42, scale: 1, opacity: 1 },
    ship: { x: 0, z: -60, yaw: 0, build: 1, opacity: 0 },
    wake: 0,
    beam: 0,
    rain: 0,
  },
  {
    at: 0.82,
    palette: "dawn",
    camera: [-0.2, 1.3, 9.2],
    look: [0.4, 1.9, 0],
    fov: 31,
    narrowX: 1.5,
    narrowY: 0,
    swell: 0.56,
    clouds: 0.52,
    stars: 0,
    sunDir: SUN_DAWN,
    sunSize: 0.004,
    light: [0.55, 0.6, 0.45],
    paper: 0,
    foam: 0.07,
    glitter: 1,
    hazeNear: 30,
    hazeFar: 170,
    boat: { x: 2.2, z: 0.2, yaw: 0.5, scale: 1, opacity: 1 },
    ship: { x: 0, z: -60, yaw: 0, build: 1, opacity: 0 },
    wake: 0,
    beam: 0,
    rain: 0,
  },

  /* 1 — Paper. Close on the boat; the sea stops being polite. */
  {
    at: 1.12,
    palette: "noon",
    camera: [3.4, 0.95, 6.4],
    look: [-0.2, 1.38, 0],
    fov: 33,
    narrowX: 0.9,
    narrowY: 0.45,
    swell: 0.75,
    clouds: 0.36,
    stars: 0,
    sunDir: SUN_NOON,
    sunSize: 0.004,
    light: [0.35, 0.85, 0.4],
    paper: 0,
    foam: 0.08,
    glitter: 0.2,
    hazeNear: 34,
    hazeFar: 190,
    boat: { x: 0.6, z: 0, yaw: 0.72, scale: 1, opacity: 1 },
    ship: { x: 0, z: -60, yaw: 0, build: 1, opacity: 0 },
    wake: 0,
    beam: 0,
    rain: 0,
  },
  {
    at: 1.78,
    palette: "noon",
    camera: [4.6, 0.75, 5.2],
    look: [-0.5, 1.2, 0],
    fov: 35,
    narrowX: 0.9,
    narrowY: 0.45,
    swell: 1.75,
    clouds: 0.62,
    stars: 0,
    sunDir: SUN_NOON,
    sunSize: 0.004,
    light: [0.35, 0.85, 0.4],
    paper: 0,
    foam: 0.2,
    glitter: 0.1,
    hazeNear: 26,
    hazeFar: 150,
    boat: { x: 0.2, z: 0, yaw: 0.95, scale: 1, opacity: 1 },
    ship: { x: 0, z: -60, yaw: 0, build: 1, opacity: 0 },
    wake: 0,
    beam: 0,
    rain: 0,
  },

  /* 2 — Drawing board. Side elevation; the ship goes up piece by piece. */
  {
    at: 2.1,
    palette: "paper",
    camera: [0.45, 3.45, 19],
    look: [0.45, 3.45, 0],
    fov: 28,
    narrowX: 1.75,
    narrowY: 0,
    swell: 0,
    clouds: 0,
    stars: 0,
    sunDir: SUN_NOON,
    sunSize: 0.0001,
    light: [0.4, 0.75, 0.55],
    paper: 1,
    foam: 0,
    glitter: 0,
    hazeNear: 60,
    hazeFar: 260,
    boat: { x: -1.5, z: 3.1, yaw: 0.3, scale: 0.55, opacity: 1 },
    ship: { x: 2.2, z: 0, yaw: 0, build: 0, opacity: 1 },
    wake: 0,
    beam: 0,
    rain: 0,
  },
  {
    at: 2.86,
    palette: "paper",
    camera: [0.45, 3.45, 19],
    look: [0.45, 3.45, 0],
    fov: 28,
    narrowX: 1.75,
    narrowY: 0,
    swell: 0,
    clouds: 0,
    stars: 0,
    sunDir: SUN_NOON,
    sunSize: 0.0001,
    light: [0.4, 0.75, 0.55],
    paper: 1,
    foam: 0,
    glitter: 0,
    hazeNear: 60,
    hazeFar: 260,
    boat: { x: -1.5, z: 3.1, yaw: 0.3, scale: 0.55, opacity: 1 },
    ship: { x: 2.2, z: 0, yaw: 0, build: 1, opacity: 1 },
    wake: 0,
    beam: 0,
    rain: 0,
  },

  /* 3 — Weather. The same ship in the conditions nobody planned for. */
  {
    at: 3.18,
    palette: "storm",
    camera: [-8.5, 1.9, 10.5],
    look: [1.2, 2.2, -2],
    fov: 36,
    narrowX: 0,
    narrowY: 2.6,
    swell: 2.15,
    clouds: 0.95,
    stars: 0.5,
    sunDir: [0.6, 0.55, -0.6],
    sunSize: 0.0016,
    light: [-0.5, 0.65, 0.55],
    paper: 0,
    foam: 0.12,
    glitter: 0,
    hazeNear: 22,
    hazeFar: 130,
    boat: { x: -1.75, z: 0.1, yaw: 0, scale: 0.34, opacity: 1 },
    ship: { x: 0, z: 0, yaw: 0.28, build: 1, opacity: 1 },
    wake: 0.25,
    beam: 1,
    rain: 1,
  },
  {
    at: 3.84,
    palette: "storm",
    camera: [-6.2, 2.6, 12.5],
    look: [1.6, 2.0, -3],
    fov: 36,
    narrowX: 0,
    narrowY: 2.6,
    swell: 2.3,
    clouds: 0.95,
    stars: 0.5,
    sunDir: [0.6, 0.55, -0.6],
    sunSize: 0.0016,
    light: [-0.5, 0.65, 0.55],
    paper: 0,
    foam: 0.12,
    glitter: 0,
    hazeNear: 22,
    hazeFar: 130,
    boat: { x: -1.75, z: 0.1, yaw: 0, scale: 0.34, opacity: 1 },
    ship: { x: 0, z: 0, yaw: 0.34, build: 1, opacity: 1 },
    wake: 0.25,
    beam: 1,
    rain: 1,
  },

  /* 4 — Open water. Morning; the ship heads for the horizon. */
  {
    at: 4.18,
    palette: "sunrise",
    camera: [5.5, 2.4, 13.5],
    look: [-1.5, 3.5, -3],
    fov: 32,
    narrowX: 0,
    narrowY: 2.9,
    swell: 0.62,
    clouds: 0.46,
    stars: 0,
    sunDir: SUN_RISE,
    sunSize: 0.0085,
    light: [-0.45, 0.5, 0.55],
    paper: 0,
    foam: 0.07,
    glitter: 1,
    hazeNear: 34,
    hazeFar: 190,
    boat: { x: -1.75, z: 0.1, yaw: 0, scale: 0.34, opacity: 1 },
    ship: { x: 0, z: -1, yaw: 1.05, build: 1, opacity: 1 },
    wake: 1,
    beam: 0,
    rain: 0,
  },
  {
    at: 5,
    palette: "sunrise",
    camera: [7.5, 3.4, 19],
    look: [-9, 5.4, -12],
    fov: 32,
    narrowX: 0,
    narrowY: 1.6,
    swell: 0.55,
    clouds: 0.46,
    stars: 0,
    sunDir: SUN_RISE,
    sunSize: 0.0085,
    light: [-0.45, 0.5, 0.55],
    paper: 0,
    foam: 0.07,
    glitter: 1,
    hazeNear: 34,
    hazeFar: 190,
    boat: { x: -1.75, z: 0.1, yaw: 0, scale: 0.34, opacity: 1 },
    ship: { x: -7.5, z: -19, yaw: 1.2, build: 1, opacity: 1 },
    wake: 1,
    beam: 0,
    rain: 0,
  },
];

export const LAST_CHAPTER = FRAMES[FRAMES.length - 1]!.at;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp3(out: Vec3, a: Vec3, b: Vec3, t: number): void {
  out[0] = lerp(a[0], b[0], t);
  out[1] = lerp(a[1], b[1], t);
  out[2] = lerp(a[2], b[2], t);
}

/** Smooth in and out, so a move eases away from one frame and into the next. */
function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

export type Sample = Omit<Frame, "at" | "palette"> & {
  paletteFrom: (typeof PALETTES)[PaletteName];
  paletteTo: (typeof PALETTES)[PaletteName];
  paletteMix: number;
};

export function createSample(): Sample {
  const first = FRAMES[0]!;
  return {
    camera: [...first.camera],
    look: [...first.look],
    fov: first.fov,
    narrowX: first.narrowX,
    narrowY: first.narrowY,
    swell: first.swell,
    clouds: first.clouds,
    stars: first.stars,
    sunDir: [...first.sunDir],
    sunSize: first.sunSize,
    light: [...first.light],
    paper: first.paper,
    foam: first.foam,
    glitter: first.glitter,
    hazeNear: first.hazeNear,
    hazeFar: first.hazeFar,
    boat: { ...first.boat },
    ship: { ...first.ship },
    wake: first.wake,
    beam: first.beam,
    rain: first.rain,
    paletteFrom: PALETTES[first.palette],
    paletteTo: PALETTES[first.palette],
    paletteMix: 0,
  };
}

/** Writes the world's state at chapter coordinate `c` into `out`. Allocation-free. */
export function sampleTimeline(out: Sample, c: number): void {
  let index = 0;
  while (index < FRAMES.length - 2 && c >= FRAMES[index + 1]!.at) index++;
  const a = FRAMES[index]!;
  const b = FRAMES[index + 1]!;
  const raw = Math.min(1, Math.max(0, (c - a.at) / (b.at - a.at)));
  const t = ease(raw);

  lerp3(out.camera, a.camera, b.camera, t);
  lerp3(out.look, a.look, b.look, t);
  lerp3(out.sunDir, a.sunDir, b.sunDir, t);
  lerp3(out.light, a.light, b.light, t);
  out.fov = lerp(a.fov, b.fov, t);
  out.narrowX = lerp(a.narrowX, b.narrowX, t);
  out.narrowY = lerp(a.narrowY, b.narrowY, t);
  out.swell = lerp(a.swell, b.swell, t);
  out.clouds = lerp(a.clouds, b.clouds, t);
  out.stars = lerp(a.stars, b.stars, t);
  out.sunSize = lerp(a.sunSize, b.sunSize, t);
  out.paper = lerp(a.paper, b.paper, t);
  out.foam = lerp(a.foam, b.foam, t);
  out.glitter = lerp(a.glitter, b.glitter, t);
  out.hazeNear = lerp(a.hazeNear, b.hazeNear, t);
  out.hazeFar = lerp(a.hazeFar, b.hazeFar, t);
  out.wake = lerp(a.wake, b.wake, t);
  out.beam = lerp(a.beam, b.beam, t);
  out.rain = lerp(a.rain, b.rain, t);

  out.boat.x = lerp(a.boat.x, b.boat.x, t);
  out.boat.z = lerp(a.boat.z, b.boat.z, t);
  out.boat.yaw = lerp(a.boat.yaw, b.boat.yaw, t);
  out.boat.scale = lerp(a.boat.scale, b.boat.scale, t);
  out.boat.opacity = lerp(a.boat.opacity, b.boat.opacity, t);

  out.ship.x = lerp(a.ship.x, b.ship.x, t);
  out.ship.z = lerp(a.ship.z, b.ship.z, t);
  out.ship.yaw = lerp(a.ship.yaw, b.ship.yaw, t);
  // The build is linear in scroll: each part should arrive at the pace the
  // reader is moving, not ease in and out across the whole chapter.
  out.ship.build = lerp(a.ship.build, b.ship.build, raw);
  out.ship.opacity = lerp(a.ship.opacity, b.ship.opacity, t);

  out.paletteFrom = PALETTES[a.palette];
  out.paletteTo = PALETTES[b.palette];
  out.paletteMix = t;
}
