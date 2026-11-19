/**
 * The crossing, as a shot list.
 *
 * The page's scroll position is one number, the chapter coordinate (0 at
 * the top, 5 at the bottom). Every property of the world — where the
 * camera is, where the sun is, how much cloud, how rough the sea, how much
 * of the ship there is — is a function of that number, given by the
 * keyframes below and interpolated between them. Scroll anywhere, in
 * either direction, and the world is exactly what the keyframes say.
 *
 * Everything is in real units: metres, degrees, and physical light. The
 * look of each scene is a consequence of where the light is and what the
 * air and water are doing, not of colours chosen per scene.
 *
 *   0  Harbour      first light; a paper boat on still water, close up
 *   1  Paper        full day; the wind rises and the boat is in trouble
 *   2  Drawing board   fog; a ship takes shape in it, from the keel up
 *   3  Weather      night, storm; the ship works through a heavy sea
 *   4  Open water   sunrise; the ship sails for the horizon
 *   6–10            fixed shots for the other pages (see the end of the list)
 *
 * FRAMING
 * The camera looks slightly up in every scene, which puts the horizon
 * about 60% of the way down the screen. The top of the frame is sky, and
 * that is where the page sets its text.
 */

type Vec3 = [number, number, number];

export type Frame = {
  at: number;

  /* Camera */
  camera: Vec3;
  look: Vec3;
  fov: number;
  /** Sideways and upward shift of the aim on a portrait screen, metres. */
  narrowX: number;
  narrowY: number;
  near: number;
  far: number;

  /* Light: where it is, how strong, and whether it is the moon. */
  elevation: number;
  azimuth: number;
  intensity: number;
  moon: number;
  /** Exposure compensation in stops, on top of automatic exposure. */
  ev: number;
  stars: number;

  /* Air */
  /** Fog density per metre. */
  fog: number;
  /** 0–1: how far the fog has swallowed the sky itself. */
  fogSky: number;

  /* Cloud */
  cover: number;
  cloudDensity: number;
  cloudBase: number;
  cloudTop: number;
  /** Lightning activity, 0–1. */
  storm: number;

  /* Sea */
  /** Length of the longest wave and overall height, metres. */
  seaLength: number;
  seaHeight: number;
  seaSpread: number;
  /** Direction the wind blows toward, degrees. */
  wind: number;
  foam: number;
  foamLevel: number;
  rain: number;

  /* Actors */
  boat: { x: number; z: number; yaw: number; opacity: number };
  ship: {
    x: number;
    z: number;
    yaw: number;
    speed: number;
    reveal: number;
    opacity: number;
  };
  beam: number;

  /* Grade */
  contrast: number;
  saturation: number;
};

const BOAT_HERE = { x: 0, z: 0, yaw: 0.35, opacity: 1 };
const BOAT_GONE = { x: 0, z: 0, yaw: 0.35, opacity: 0 };
const SHIP_AWAY = { x: 0, z: 0, yaw: 0, speed: 0, reveal: 0, opacity: 0 };

export const FRAMES: Frame[] = [
  /* 0 — Harbour. First light, a paper boat, close enough to touch. */
  {
    at: 0,
    camera: [-0.12, 0.1, 0.8],
    look: [-0.07, 0.132, 0],
    fov: 27,
    narrowX: 0.07,
    narrowY: 0.03,
    near: 0.02,
    far: 9000,
    elevation: 4.5,
    azimuth: -47,
    intensity: 20,
    moon: 0,
    ev: 0.15,
    stars: 0,
    fog: 0.00006,
    fogSky: 0,
    cover: 0.36,
    cloudDensity: 0.011,
    cloudBase: 1500,
    cloudTop: 3200,
    storm: 0,
    seaLength: 0.85,
    seaHeight: 0.012,
    seaSpread: 1.35,
    wind: 205,
    foam: 0,
    foamLevel: 0.9,
    rain: 0,
    boat: BOAT_HERE,
    ship: SHIP_AWAY,
    beam: 0,
    contrast: 1.04,
    saturation: 1.02,
  },
  {
    at: 0.82,
    camera: [-0.04, 0.09, 0.68],
    look: [-0.06, 0.122, 0],
    fov: 27,
    narrowX: 0.06,
    narrowY: 0.03,
    near: 0.02,
    far: 9000,
    elevation: 7,
    azimuth: -47,
    intensity: 20,
    moon: 0,
    ev: 0.15,
    stars: 0,
    fog: 0.00006,
    fogSky: 0,
    cover: 0.36,
    cloudDensity: 0.011,
    cloudBase: 1500,
    cloudTop: 3200,
    storm: 0,
    seaLength: 0.9,
    seaHeight: 0.014,
    seaSpread: 1.35,
    wind: 205,
    foam: 0,
    foamLevel: 0.9,
    rain: 0,
    boat: BOAT_HERE,
    ship: SHIP_AWAY,
    beam: 0,
    contrast: 1.04,
    saturation: 1.02,
  },

  /* 1 — Paper. Midday. The wind gets up and the sea stops being polite. */
  {
    at: 1.12,
    camera: [0.36, 0.07, 0.5],
    look: [-0.1, 0.112, 0],
    fov: 30,
    narrowX: 0.06,
    narrowY: 0.03,
    near: 0.02,
    far: 9000,
    elevation: 38,
    azimuth: -100,
    intensity: 20,
    moon: 0,
    ev: -0.1,
    stars: 0,
    fog: 0.00005,
    fogSky: 0,
    cover: 0.42,
    cloudDensity: 0.012,
    cloudBase: 1300,
    cloudTop: 3300,
    storm: 0,
    seaLength: 1.3,
    seaHeight: 0.03,
    seaSpread: 1.2,
    wind: 215,
    foam: 0,
    foamLevel: 0.9,
    rain: 0,
    boat: { x: 0, z: 0, yaw: 0.6, opacity: 1 },
    ship: SHIP_AWAY,
    beam: 0,
    contrast: 1.05,
    saturation: 1,
  },
  {
    at: 1.78,
    camera: [0.44, 0.085, 0.42],
    look: [-0.11, 0.118, 0],
    fov: 32,
    narrowX: 0.05,
    narrowY: 0.03,
    near: 0.02,
    far: 9000,
    elevation: 34,
    azimuth: -100,
    intensity: 20,
    moon: 0,
    ev: -0.1,
    stars: 0,
    fog: 0.00009,
    fogSky: 0,
    cover: 0.78,
    cloudDensity: 0.015,
    cloudBase: 1000,
    cloudTop: 3300,
    storm: 0,
    seaLength: 2.3,
    seaHeight: 0.105,
    seaSpread: 1,
    wind: 215,
    foam: 0.3,
    foamLevel: 0.74,
    rain: 0,
    boat: { x: 0, z: 0, yaw: 0.9, opacity: 1 },
    ship: SHIP_AWAY,
    beam: 0,
    contrast: 1.05,
    saturation: 0.98,
  },

  /* A fog bank rolls over everything: the cut between the two scales. */
  {
    at: 1.95,
    camera: [3, 5, 40],
    look: [2, 9, 0],
    fov: 30,
    narrowX: 0,
    narrowY: 0,
    near: 0.3,
    far: 20000,
    elevation: 36,
    azimuth: 118,
    intensity: 20,
    moon: 0,
    ev: -0.2,
    stars: 0,
    fog: 2.2,
    fogSky: 1,
    cover: 1,
    cloudDensity: 0.006,
    cloudBase: 300,
    cloudTop: 1100,
    storm: 0,
    seaLength: 6,
    seaHeight: 0.08,
    seaSpread: 1.2,
    wind: 215,
    foam: 0,
    foamLevel: 0.9,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: 0, z: 0, yaw: 0, speed: 0, reveal: 0, opacity: 1 },
    beam: 0,
    contrast: 1.02,
    saturation: 0.9,
  },

  /* 2 — Drawing board. Still water and fog; the ship resolves, keel first. */
  {
    at: 2.1,
    camera: [6, 8.5, 86],
    look: [-8.5, 13.5, 0],
    fov: 30,
    narrowX: 10.5,
    narrowY: 0,
    near: 1,
    far: 20000,
    elevation: 34,
    azimuth: 118,
    intensity: 20,
    moon: 0,
    ev: -0.25,
    stars: 0,
    fog: 0.0085,
    fogSky: 0.85,
    cover: 0.9,
    cloudDensity: 0.005,
    cloudBase: 300,
    cloudTop: 1100,
    storm: 0,
    seaLength: 9,
    seaHeight: 0.07,
    seaSpread: 1.3,
    wind: 215,
    foam: 0,
    foamLevel: 0.9,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: 0, z: 0, yaw: 0, speed: 0, reveal: 0, opacity: 1 },
    beam: 0,
    contrast: 1.03,
    saturation: 0.92,
  },
  {
    at: 2.78,
    camera: [6, 8.5, 84],
    look: [-8.5, 13.5, 0],
    fov: 30,
    narrowX: 10.5,
    narrowY: 0,
    near: 1,
    far: 20000,
    elevation: 34,
    azimuth: 118,
    intensity: 20,
    moon: 0,
    ev: 0.1,
    stars: 0,
    fog: 0.0028,
    fogSky: 0.42,
    cover: 0.62,
    cloudDensity: 0.005,
    cloudBase: 300,
    cloudTop: 1100,
    storm: 0,
    seaLength: 9,
    seaHeight: 0.07,
    seaSpread: 1.3,
    wind: 215,
    foam: 0,
    foamLevel: 0.9,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: 0, z: 0, yaw: 0, speed: 0, reveal: 1, opacity: 1 },
    beam: 0,
    contrast: 1.03,
    saturation: 0.92,
  },
  /* The finished ship holds for a beat before the weather arrives. */
  {
    at: 2.9,
    camera: [6, 8.5, 84],
    look: [-8.5, 13.5, 0],
    fov: 30,
    narrowX: 10.5,
    narrowY: 0,
    near: 1,
    far: 20000,
    elevation: 34,
    azimuth: 118,
    intensity: 20,
    moon: 0,
    ev: 0.1,
    stars: 0,
    fog: 0.0028,
    fogSky: 0.42,
    cover: 0.62,
    cloudDensity: 0.005,
    cloudBase: 300,
    cloudTop: 1100,
    storm: 0,
    seaLength: 9,
    seaHeight: 0.07,
    seaSpread: 1.3,
    wind: 215,
    foam: 0,
    foamLevel: 0.9,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: 0, z: 0, yaw: 0, speed: 0, reveal: 1, opacity: 1 },
    beam: 0,
    contrast: 1.03,
    saturation: 0.92,
  },

  /* 3 — Weather. Night, a gale, a lighthouse somewhere to leeward. */
  {
    at: 3.18,
    camera: [-58, 7.5, 50],
    look: [2, 15.5, 0],
    fov: 34,
    narrowX: 0,
    narrowY: 6,
    near: 1,
    far: 20000,
    elevation: 38,
    azimuth: 140,
    intensity: 1.4,
    moon: 1,
    ev: -1.9,
    stars: 0.6,
    fog: 0.0011,
    fogSky: 0.25,
    cover: 0.8,
    cloudDensity: 0.034,
    cloudBase: 450,
    cloudTop: 3200,
    storm: 1,
    seaLength: 72,
    seaHeight: 9.5,
    seaSpread: 0.75,
    wind: 205,
    foam: 0.95,
    foamLevel: 0.6,
    rain: 1,
    boat: BOAT_GONE,
    ship: { x: 0, z: 0, yaw: 0.25, speed: 2.2, reveal: 1, opacity: 1 },
    beam: 1,
    contrast: 1.1,
    saturation: 0.62,
  },
  {
    at: 3.84,
    camera: [-46, 9, 60],
    look: [3, 15.5, 0],
    fov: 34,
    narrowX: 0,
    narrowY: 6,
    near: 1,
    far: 20000,
    elevation: 38,
    azimuth: 140,
    intensity: 1.4,
    moon: 1,
    ev: -1.9,
    stars: 0.6,
    fog: 0.0011,
    fogSky: 0.25,
    cover: 0.8,
    cloudDensity: 0.034,
    cloudBase: 450,
    cloudTop: 3200,
    storm: 1,
    seaLength: 72,
    seaHeight: 9.5,
    seaSpread: 0.75,
    wind: 205,
    foam: 0.95,
    foamLevel: 0.6,
    rain: 1,
    boat: BOAT_GONE,
    ship: { x: 4, z: 1, yaw: 0.3, speed: 2.2, reveal: 1, opacity: 1 },
    beam: 1,
    contrast: 1.1,
    saturation: 0.62,
  },

  /* 4 — Open water. The sun comes up and the ship heads for it. */
  {
    at: 4.18,
    camera: [40, 6.5, 50],
    look: [-4, 15, -6],
    fov: 32,
    narrowX: 0,
    narrowY: 26,
    near: 1,
    far: 20000,
    elevation: 4,
    azimuth: -110,
    intensity: 20,
    moon: 0,
    ev: 0.4,
    stars: 0,
    fog: 0.00007,
    fogSky: 0,
    cover: 0.44,
    cloudDensity: 0.012,
    cloudBase: 1400,
    cloudTop: 3400,
    storm: 0,
    seaLength: 52,
    seaHeight: 1.25,
    seaSpread: 0.95,
    wind: 215,
    foam: 0.4,
    foamLevel: 0.78,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: 0, z: -2, yaw: 2.24, speed: 4.5, reveal: 1, opacity: 1 },
    beam: 0,
    contrast: 1.05,
    saturation: 1.03,
  },
  {
    at: 5,
    camera: [70, 11, 96],
    look: [-28, 19, -34],
    fov: 32,
    narrowX: 0,
    /* On a tall screen the camera tips up: the ship sails out low in the
       frame, under the last chapter's text instead of behind it. */
    narrowY: 70,
    near: 1,
    far: 20000,
    elevation: 8,
    azimuth: -110,
    intensity: 20,
    moon: 0,
    ev: 0.4,
    stars: 0,
    fog: 0.00007,
    fogSky: 0,
    cover: 0.44,
    cloudDensity: 0.012,
    cloudBase: 1400,
    cloudTop: 3400,
    storm: 0,
    seaLength: 52,
    seaHeight: 1.2,
    seaSpread: 0.95,
    wind: 215,
    foam: 0.4,
    foamLevel: 0.78,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: -62, z: -80, yaw: 2.24, speed: 4.5, reveal: 1, opacity: 1 },
    beam: 0,
    contrast: 1.05,
    saturation: 1.03,
  },

  /*
   * Past the end of the crossing: one fixed shot for each of the other
   * pages. The scroll never reaches these; a page cuts straight to its own.
   */

  /* 6 — Skills. Under the rigging, looking up, on a fair day. */
  {
    at: 6,
    camera: [-13, 6.5, 13],
    look: [5, 20, 0],
    fov: 44,
    narrowX: 0,
    narrowY: 0,
    near: 0.5,
    far: 20000,
    elevation: 44,
    azimuth: 62,
    intensity: 20,
    moon: 0,
    ev: 0,
    stars: 0,
    fog: 0.00006,
    fogSky: 0,
    cover: 0.34,
    cloudDensity: 0.012,
    cloudBase: 1400,
    cloudTop: 3300,
    storm: 0,
    seaLength: 46,
    seaHeight: 0.9,
    seaSpread: 1,
    wind: 215,
    foam: 0.3,
    foamLevel: 0.8,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: 0, z: 0, yaw: 0, speed: 3, reveal: 1, opacity: 1 },
    beam: 0,
    contrast: 1.05,
    saturation: 1,
  },

  /* 7 — Experience. Astern, late in the day, the wake running back. The
     camera looks to port of her, so she sits to the right of the log. */
  {
    at: 7,
    camera: [-74, 15, 9],
    look: [-6, 12, -24],
    fov: 34,
    narrowX: 0,
    narrowY: 0,
    near: 1,
    far: 20000,
    elevation: 9,
    azimuth: -24,
    intensity: 20,
    moon: 0,
    ev: 0.3,
    stars: 0,
    fog: 0.00007,
    fogSky: 0,
    cover: 0.4,
    cloudDensity: 0.012,
    cloudBase: 1400,
    cloudTop: 3400,
    storm: 0,
    seaLength: 50,
    seaHeight: 1.1,
    seaSpread: 0.95,
    wind: 200,
    foam: 0.4,
    foamLevel: 0.78,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: 0, z: 0, yaw: 0, speed: 5, reveal: 1, opacity: 1 },
    beam: 1,
    contrast: 1.05,
    saturation: 1.02,
  },

  /* 8 — Achievements. A lighthouse on a clear night. */
  {
    at: 8,
    camera: [300, 5, -34],
    look: [372, 24, -112],
    fov: 36,
    narrowX: 0,
    narrowY: 0,
    near: 1,
    far: 20000,
    elevation: 30,
    azimuth: 150,
    intensity: 1.6,
    moon: 1,
    ev: -1.7,
    stars: 1,
    fog: 0.0006,
    fogSky: 0.1,
    cover: 0.3,
    cloudDensity: 0.012,
    cloudBase: 1200,
    cloudTop: 3000,
    storm: 0,
    seaLength: 34,
    seaHeight: 1.3,
    seaSpread: 0.9,
    wind: 205,
    foam: 0.45,
    foamLevel: 0.74,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: 0, z: 0, yaw: 0, speed: 0, reveal: 1, opacity: 0 },
    beam: 1,
    contrast: 1.08,
    saturation: 0.7,
  },

  /* 9 — Education. Before sunrise; the paper boat, where it all starts. */
  {
    at: 9,
    camera: [0.22, 0.1, 0.84],
    look: [-0.13, 0.132, 0],
    fov: 28,
    narrowX: 0.05,
    narrowY: 0.02,
    near: 0.02,
    far: 9000,
    elevation: 2.2,
    azimuth: -80,
    intensity: 20,
    moon: 0,
    ev: 0.3,
    stars: 0,
    fog: 0.00006,
    fogSky: 0,
    cover: 0.3,
    cloudDensity: 0.011,
    cloudBase: 1600,
    cloudTop: 3200,
    storm: 0,
    seaLength: 0.8,
    seaHeight: 0.009,
    seaSpread: 1.35,
    wind: 200,
    foam: 0,
    foamLevel: 0.9,
    rain: 0,
    boat: { x: 0, z: 0, yaw: 2.2, opacity: 1 },
    ship: SHIP_AWAY,
    beam: 0,
    contrast: 1.04,
    saturation: 1.02,
  },

  /* 10 — Projects. Broadside on a bright afternoon, under way. */
  {
    at: 10,
    camera: [34, 7, 80],
    look: [-22, 14, 0],
    fov: 32,
    /* Wide: she lies to the right of the register. Tall: centred below it. */
    narrowX: 24,
    narrowY: 0,
    near: 1,
    far: 20000,
    elevation: 31,
    azimuth: 104,
    intensity: 20,
    moon: 0,
    ev: 0,
    stars: 0,
    fog: 0.00007,
    fogSky: 0,
    cover: 0.38,
    cloudDensity: 0.012,
    cloudBase: 1400,
    cloudTop: 3400,
    storm: 0,
    seaLength: 48,
    seaHeight: 1,
    seaSpread: 1,
    wind: 210,
    foam: 0.35,
    foamLevel: 0.8,
    rain: 0,
    boat: BOAT_GONE,
    ship: { x: 0, z: 0, yaw: 0, speed: 4, reveal: 1, opacity: 1 },
    beam: 0,
    contrast: 1.05,
    saturation: 1.02,
  },
];

export const LAST_CHAPTER = FRAMES[FRAMES.length - 1]!.at;

export type Sample = Omit<Frame, "at">;

export function createSample(): Sample {
  const first = FRAMES[0]!;
  return {
    ...first,
    camera: [...first.camera],
    look: [...first.look],
    boat: { ...first.boat },
    ship: { ...first.ship },
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** For quantities that span orders of magnitude (fog, wave size). */
function lerpLog(a: number, b: number, t: number): number {
  return Math.exp(lerp(Math.log(a), Math.log(b), t));
}

/** Ease in and out, so nothing in the world starts or stops abruptly. */
function ease(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

const NUMERIC: (keyof Frame)[] = [
  "fov",
  "narrowX",
  "narrowY",
  "elevation",
  "azimuth",
  "moon",
  "ev",
  "stars",
  "fogSky",
  "cover",
  "cloudBase",
  "cloudTop",
  "storm",
  "seaSpread",
  "wind",
  "foam",
  "foamLevel",
  "rain",
  "beam",
  "contrast",
  "saturation",
];

const LOGARITHMIC: (keyof Frame)[] = [
  "near",
  "far",
  "intensity",
  "fog",
  "cloudDensity",
  "seaLength",
  "seaHeight",
];

/** Writes the world's state at chapter coordinate `c` into `out`. */
export function sampleTimeline(out: Sample, c: number): void {
  let index = 0;
  while (index < FRAMES.length - 2 && c >= FRAMES[index + 1]!.at) index++;
  const a = FRAMES[index]!;
  const b = FRAMES[index + 1]!;
  const raw = Math.min(1, Math.max(0, (c - a.at) / (b.at - a.at)));
  const t = ease(raw);
  const target = out as unknown as Record<string, number>;
  const from = a as unknown as Record<string, number>;
  const to = b as unknown as Record<string, number>;

  for (const key of NUMERIC) target[key] = lerp(from[key]!, to[key]!, t);
  for (const key of LOGARITHMIC) target[key] = lerpLog(from[key]!, to[key]!, t);

  // The camera's distance changes by orders of magnitude between the
  // close-ups and the ship; moving it geometrically keeps the move even.
  for (let i = 0; i < 3; i++) {
    out.camera[i] = lerp(a.camera[i]!, b.camera[i]!, t);
    out.look[i] = lerp(a.look[i]!, b.look[i]!, t);
  }

  out.boat.x = lerp(a.boat.x, b.boat.x, t);
  out.boat.z = lerp(a.boat.z, b.boat.z, t);
  out.boat.yaw = lerp(a.boat.yaw, b.boat.yaw, t);
  out.boat.opacity = lerp(a.boat.opacity, b.boat.opacity, t);

  out.ship.x = lerp(a.ship.x, b.ship.x, t);
  out.ship.z = lerp(a.ship.z, b.ship.z, t);
  out.ship.yaw = lerp(a.ship.yaw, b.ship.yaw, t);
  out.ship.speed = lerp(a.ship.speed, b.ship.speed, t);
  out.ship.opacity = lerp(a.ship.opacity, b.ship.opacity, t);
  // The ship is revealed at the reader's pace, not eased across the chapter.
  out.ship.reveal = lerp(a.ship.reveal, b.ship.reveal, raw);
}
