import * as THREE from "three";
import {
  BOAT_LENGTH,
  SHIP,
  SHIP_ANCHORS,
  WATER_CLIP,
  createLighthouse,
  createPaperBoat,
  createRain,
  createShip,
  type ShipPart,
} from "./actors";
import { SkyView, lightTransmittance, skyRadiance } from "./atmosphere";
import { Clouds } from "./clouds";
import {
  FATE_COUNT,
  FATE_TOLD,
  clearFatePose,
  createFatePose,
  createFateState,
  resetFateState,
  stepFate,
  type FateState,
} from "./fates";
import { Film } from "./film";
import { MAX_EXTRA_BOATS } from "./limits";
import { createOcean } from "./ocean";
import { createSky } from "./sky";
import { LAST_CHAPTER, createSample, sampleTimeline } from "./timeline";
import { WaveTable, type Sea } from "./waves";

/**
 * The world: one scene, one camera, one render loop.
 *
 * It knows nothing about React or the page beyond the canvas it is given.
 * The page tells it one thing — the chapter coordinate (see timeline.ts) —
 * and it reports back the few screen positions the page pins HTML to.
 *
 * ONE LIGHT
 * Each frame starts from a single fact: where the sun (or moon) is. From
 * that the atmosphere model gives the colour of the light after its trip
 * through the air and the colour of the sky it leaves behind; those two
 * numbers light the sea, the clouds, the fog, the ship and the paper boat.
 * Nothing in the scene has a colour of its own that was picked to match.
 * Exposure is set from the same numbers, the way a camera meters a scene.
 *
 * PER FRAME
 *   1. ease the chapter coordinate toward the scroll position;
 *   2. sample the timeline;
 *   3. work out the light, the ambient sky and the exposure;
 *   4. refresh the sky lookup (only if the light moved) and march the
 *      clouds at low resolution;
 *   5. float the boats on the same wave function the sea is drawn with
 *      (and, for a paper boat the reader has leaned on, sink it: fates.ts);
 *   6. draw the scene into a high-dynamic-range buffer, then develop it
 *      (film.ts) onto the canvas.
 *
 * QUALITY
 * A slower device gets the same world with less of everything expensive:
 * fewer wave octaves, fewer cloud steps, a smaller buffer, no shadow map.
 * If the first seconds still run long, resolution steps down again. The
 * frame rate is the one thing not allowed to give.
 */

export type WorldQuality = "high" | "medium" | "low";

/** The knobs a quality tier turns. */
export type Tier = {
  /** Cap on device pixel ratio. */
  dpr: number;
  /** Multisampling of the scene buffer. */
  samples: number;
  /** Sea mesh density. */
  rings: number;
  segments: number;
  /** Wave octaves used to move the surface, and to shade it. */
  geo: number;
  norm: number;
  /** Cloud buffer size relative to the screen, and steps per ray. */
  cloudScale: number;
  cloudSteps: number;
  /** Shadow map size (0 = none). */
  shadow: number;
  /** Size of the mirrored-reflection buffer relative to the screen (0 = none). */
  mirror: number;
  bloom: boolean;
  rain: number;
};

const QUALITY: Record<WorldQuality, Tier> = {
  high: {
    dpr: 1.5,
    samples: 4,
    rings: 240,
    segments: 320,
    geo: 12,
    norm: 24,
    cloudScale: 0.5,
    cloudSteps: 48,
    shadow: 2048,
    mirror: 0.5,
    bloom: true,
    rain: 9000,
  },
  medium: {
    dpr: 1.25,
    samples: 2,
    rings: 200,
    segments: 256,
    geo: 11,
    norm: 20,
    cloudScale: 0.5,
    cloudSteps: 40,
    shadow: 1024,
    mirror: 0.4,
    bloom: true,
    rain: 6000,
  },
  low: {
    dpr: 1,
    samples: 0,
    rings: 150,
    segments: 200,
    geo: 9,
    norm: 14,
    cloudScale: 0.4,
    cloudSteps: 28,
    shadow: 0,
    mirror: 0,
    bloom: false,
    rain: 3000,
  },
};

export type AnchorState = {
  id: ShipPart;
  /** CSS pixels from the canvas's top-left. */
  x: number;
  y: number;
  /** 0–1: whether the part it points at is there yet. */
  visible: number;
};

/** One paper boat, as the page needs to know it. All positions in CSS pixels. */
export type BoatState = {
  /** Where it sits on the water, and the tip of its sail. */
  x: number;
  y: number;
  tipX: number;
  tipY: number;
  /** Half its length on screen. */
  size: number;
  /** 0 not there; 1 afloat, and can be leaned on; 2 going down. */
  phase: 0 | 1 | 2;
};

export type WorldReadout = {
  anchors: AnchorState[];
  boat: { x: number; y: number };
  /** The paper fleet. Slot 0 is the first boat; the reader folded the rest. */
  boats: BoatState[];
  /**
   * The last boat to go down: `serial` counts up each time one is past
   * saving, with which of the six ways it went and where on screen.
   */
  told: { serial: number; kind: number; x: number; y: number };
  /** Boats afloat now, boats sunk so far, and which ways have been seen (a bit each). */
  fleet: { afloat: number; sunk: number; found: number };
  horizonY: number;
  chapter: number;
};

export type World = {
  /** Where the page is, in chapters. */
  setChapter(value: number, immediate?: boolean): void;
  setSize(width: number, height: number): void;
  /** Compiles shaders and bakes the cloud noise before the first frame. */
  warm(): Promise<void>;
  /** Reduced motion: time stops; the world still follows the scroll. */
  setStill(still: boolean): void;
  setRunning(running: boolean): void;
  /** Drops a paper boat where the pointer met the water. */
  tap(clientX: number, clientY: number): boolean;
  /** Leans on a paper boat: it goes down in one of six ways (fates.ts). */
  lean(slot: number, kind: number): boolean;
  readout: WorldReadout;
  onFrame: ((readout: WorldReadout) => void) | null;
  dispose(): void;
};

const PART_ORDER: ShipPart[] = [
  "keel",
  "ballast",
  "hull",
  "stores",
  "compass",
  "rigging",
];

/**
 * How far the reveal has to have risen (0–1) before each part's callout
 * appears. The same numbers are in lib/site.ts (ANATOMY[].built), where
 * they decide when the page inks in that part's line; keep the two equal.
 * Each is a little after the moment the part itself clears the fog.
 */
const PART_BUILT: Record<ShipPart, number> = {
  keel: 0.06,
  ballast: 0.14,
  hull: 0.26,
  stores: 0.36,
  compass: 0.46,
  rigging: 0.78,
};

type RGB = [number, number, number];

function luminance(c: readonly number[]): number {
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/*
 * Fog for the solid objects. three.js's built-in fog thickens with the
 * square of distance; the sea and sky here use the physical law (light
 * surviving falls off exponentially with distance), so the built-in chunk
 * is replaced to match. Without this the ship would stay crisp and dark
 * while the water around it faded into the mist.
 */
THREE.ShaderChunk.fog_fragment = /* glsl */ `
#ifdef USE_FOG
  float fogFactor = 1.0 - exp(-fogDensity * vFogDepth);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
#endif
`;

/** Hands the main thread back to the browser for a moment. */
function breathe(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** A value that follows a target like a mass on a damped spring. */
class Spring {
  value = 0;
  velocity = 0;
  constructor(
    private readonly frequency: number,
    private readonly damping: number,
  ) {}
  step(target: number, dt: number): number {
    const w = this.frequency;
    this.velocity +=
      ((target - this.value) * w * w - 2 * this.damping * w * this.velocity) *
      dt;
    this.value += this.velocity * dt;
    return this.value;
  }
  snap(target: number): void {
    this.value = target;
    this.velocity = 0;
  }
}

export async function createWorld(
  canvas: HTMLCanvasElement,
  quality: WorldQuality,
  /** For benchmarking: replaces individual settings of the tier. */
  overrides: Partial<Tier> = {},
): Promise<World | null> {
  const attributes = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  } as const;
  // Asked for directly first, so a device without WebGL2 is a quiet `null`.
  const context = canvas.getContext(
    "webgl2",
    attributes,
  ) as WebGL2RenderingContext | null;
  if (!context) return null;
  // The scene is rendered in floating point; without this there is no world.
  if (
    !context.getExtension("EXT_color_buffer_float") &&
    !context.getExtension("EXT_color_buffer_half_float")
  ) {
    return null;
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, context, ...attributes });
  } catch {
    return null;
  }
  const q: Tier = { ...QUALITY[quality], ...overrides };
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.shadowMap.enabled = q.shadow > 0;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Drawn once per frame, by hand: the scene is rendered twice (once
  // mirrored) and the shadows are the same in both.
  renderer.shadowMap.autoUpdate = false;
  renderer.info.autoReset = true;

  const scene = new THREE.Scene();
  const fog = new THREE.FogExp2(0xffffff, 0);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(30, 1.6, 0.02, 9000);

  /* The mirror: the solid objects, drawn from a camera reflected in the
     water's surface, for the sea to show as their reflection. */
  const mirrorCamera = new THREE.PerspectiveCamera();
  const mirrorTarget = new THREE.WebGLRenderTarget(4, 4, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
  });
  const mirrorMatrix = new THREE.Matrix4();
  const film = new Film(q.samples, q.bloom);
  const skyView = new SkyView();
  const clouds = new Clouds(q.cloudScale, q.cloudSteps);

  await breathe();
  const sky = createSky();
  scene.add(sky.mesh);
  const ocean = createOcean(q.rings, q.segments);
  ocean.uniforms.uGeoIterations!.value = q.geo;
  ocean.uniforms.uNormIterations!.value = q.norm;
  scene.add(ocean.mesh);
  sky.uniforms.tSky!.value = skyView.texture;
  ocean.uniforms.tSky!.value = skyView.texture;

  await breathe();
  const boat = createPaperBoat();
  scene.add(boat);
  const ship = createShip(
    "/world/ship.glb",
    Math.min(8, renderer.capabilities.getMaxAnisotropy()),
  );
  scene.add(ship.group);
  const lighthouse = createLighthouse();
  lighthouse.group.position.set(390, 0, -130);
  scene.add(lighthouse.group);
  const rain = createRain(q.rain);
  scene.add(rain.mesh);

  /* The two lights the solid objects are lit by. Both are set every frame
     from the atmosphere, never by hand. */
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.castShadow = q.shadow > 0;
  if (q.shadow > 0) {
    sun.shadow.mapSize.set(q.shadow, q.shadow);
    sun.shadow.camera.left = -26;
    sun.shadow.camera.right = 26;
    sun.shadow.camera.top = 34;
    sun.shadow.camera.bottom = -8;
    sun.shadow.camera.near = 20;
    sun.shadow.camera.far = 220;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.06;
  }
  scene.add(sun);
  scene.add(sun.target);
  const ambientLight = new THREE.HemisphereLight(0xffffff, 0x202830, 1);
  scene.add(ambientLight);

  /*
   * The paper fleet: the boat the story is about (slot 0, placed by the
   * timeline) and the ones the reader folds by tapping the water. Any of
   * them can be leaned on, and then it goes down (fates.ts).
   */
  type PaperBoat = {
    mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    active: boolean;
    x: number;
    z: number;
    yaw: number;
    /** When it was folded: it grows from nothing over half a second. */
    born: number;
    /** Which way it is going down, or -1 while it floats. */
    fate: number;
    since: number;
    /** Whether the page has been told this one is lost. */
    told: boolean;
    /** Which way this boat goes over, +1 or -1. */
    side: number;
    state: FateState;
    /** The first boat only: when the next one is folded in its place. */
    refoldAt: number;
  };
  const fleet: PaperBoat[] = [];
  function enlist(
    mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>,
  ): PaperBoat {
    const paper: PaperBoat = {
      mesh,
      active: false,
      x: 0,
      z: 0,
      yaw: 0,
      born: -10,
      fate: -1,
      since: 0,
      told: false,
      side: 1,
      state: createFateState(),
      refoldAt: 0,
    };
    fleet.push(paper);
    return paper;
  }
  enlist(boat).active = true;
  let nextExtra = 0;
  const fate = createFatePose();
  /** Mist asked for by a sinking boat; applied to the next frame's air. */
  let mist = 0;
  /** Rings on the water where boats went under: newest overwrites oldest. */
  const ripples = [0, 1, 2].map(() => ({
    x: 0,
    z: 0,
    born: -100,
    strength: 0,
  }));
  let nextRipple = 0;
  const toldPoint = new THREE.Vector3();
  const edgePoint = { x: 0, y: 0 };
  const tipPoint = { x: 0, y: 0 };

  /* State. */
  const sample = createSample();
  const sea: Sea = { length: 1, height: 0.01, wind: 0, spread: 1 };
  const waves = new WaveTable();
  const readout: WorldReadout = {
    anchors: PART_ORDER.map((id) => ({ id, x: 0, y: 0, visible: 0 })),
    boat: { x: 0, y: 0 },
    boats: Array.from({ length: MAX_EXTRA_BOATS + 1 }, () => ({
      x: 0,
      y: 0,
      tipX: 0,
      tipY: 0,
      size: 0,
      phase: 0 as const,
    })),
    told: { serial: 0, kind: 0, x: 0, y: 0 },
    fleet: { afloat: 1, sunk: 0, found: 0 },
    horizonY: 0,
    chapter: 0,
  };

  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let chapterTarget = 0;
  let chapter = 0;
  let time = 0;
  let last = 0;
  let still = false;
  let running = false;
  let frameId = 0;
  let disposed = false;
  let warmed = false;
  let flash = 0;
  let nextFlash = 4;

  const lightDir = new THREE.Vector3(0, 1, 0);
  const transmittance: RGB = [1, 1, 1];
  const lightColour: RGB = [1, 1, 1];
  const ambient: RGB = [1, 1, 1];
  const clearAmbient: RGB = [1, 1, 1];
  const zenith: RGB = [0, 0, 0];
  const horizonSky: RGB = [0, 0, 0];
  const scratch: RGB = [0, 0, 0];
  let ambientKey = "";

  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const viewRotation = new THREE.Matrix4();
  const rotationOnly = new THREE.Matrix4();
  const raycaster = new THREE.Raycaster();
  const seaPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const pointerNdc = new THREE.Vector2();
  const horizonPoint = { x: 0, y: 0 };

  /* Motion with weight: each floating body follows the water through
     springs, heavy and slow for the ship, light and quick for paper. */
  const shipHeave = new Spring(1.5, 0.55);
  const shipPitch = new Spring(1.25, 0.4);
  const shipRoll = new Spring(0.95, 0.3);
  const boatHeave = new Spring(16, 0.5);
  const boatPitch = new Spring(13, 0.42);
  const boatRoll = new Spring(11, 0.38);

  function applyResolution(): void {
    const w = Math.max(2, Math.round(width * pixelRatio));
    const h = Math.max(2, Math.round(height * pixelRatio));
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    film.setSize(w, h);
    clouds.setSize(w, h);
    if (q.mirror > 0) {
      mirrorTarget.setSize(
        Math.max(4, Math.round(w * q.mirror)),
        Math.max(4, Math.round(h * q.mirror)),
      );
    }
    sky.uniforms.uResolution!.value.set(w, h);
  }

  function setSize(w: number, h: number): void {
    if (w <= 0 || h <= 0) return;
    width = w;
    height = h;
    pixelRatio = Math.min(window.devicePixelRatio || 1, q.dpr);
    camera.aspect = w / h;
    applyResolution();
    if (warmed && !running) renderFrame(performance.now());
  }

  function project(world: THREE.Vector3, out: { x: number; y: number }): void {
    tmp2.copy(world).project(camera);
    out.x = (tmp2.x * 0.5 + 0.5) * width;
    out.y = (1 - (tmp2.y * 0.5 + 0.5)) * height;
  }

  /**
   * Height, pitch and roll of a body on the water: the sea is sampled at
   * its bow, stern and either side, and the hull is laid across them.
   */
  function restingPose(
    x: number,
    z: number,
    yaw: number,
    halfLength: number,
    halfBeam: number,
    iterations: number,
    out: { heave: number; pitch: number; roll: number },
  ): void {
    const fx = Math.cos(yaw);
    const fz = -Math.sin(yaw);
    const bow = waves.heightAt(
      x + fx * halfLength,
      z + fz * halfLength,
      iterations,
    );
    const stern = waves.heightAt(
      x - fx * halfLength,
      z - fz * halfLength,
      iterations,
    );
    const port = waves.heightAt(
      x + fz * halfBeam,
      z - fx * halfBeam,
      iterations,
    );
    const starboard = waves.heightAt(
      x - fz * halfBeam,
      z + fx * halfBeam,
      iterations,
    );
    out.heave = (bow + stern + port + starboard) * 0.25;
    out.pitch = Math.atan2(bow - stern, 2 * halfLength);
    out.roll = Math.atan2(starboard - port, 2 * halfBeam);
  }
  const pose = { heave: 0, pitch: 0, roll: 0 };

  function fateOf(paper: PaperBoat): THREE.Vector4 {
    return (paper.mesh.material.userData.fate as { value: THREE.Vector4 })
      .value;
  }

  /** Afloat again, as new: folded at `born`. */
  function restore(paper: PaperBoat, born: number): void {
    paper.active = true;
    paper.fate = -1;
    paper.told = false;
    paper.refoldAt = 0;
    paper.born = born;
    resetFateState(paper.state);
    fateOf(paper).set(0, 0, 0, 0);
  }

  /** Gone. The first boat is always followed by another: anyone can fold one. */
  function drown(paper: PaperBoat, first: boolean): void {
    paper.active = false;
    paper.fate = -1;
    paper.mesh.visible = false;
    resetFateState(paper.state);
    fateOf(paper).set(0, 0, 0, 0);
    if (first) paper.refoldAt = time + 1.2;
  }

  /** The moment a boat is past saving: the page says what would have held. */
  function tell(kind: number, x: number, z: number): void {
    toldPoint.set(x, waves.heightAt(x, z, q.geo) + 0.02, z);
    readout.told.serial++;
    readout.told.kind = kind;
    readout.fleet.sunk++;
    readout.fleet.found |= 1 << kind;
  }

  function ripple(x: number, z: number, strength: number): void {
    const ring = ripples[nextRipple]!;
    ring.x = x;
    ring.z = z;
    ring.born = time;
    ring.strength = strength;
    nextRipple = (nextRipple + 1) % ripples.length;
  }

  function renderFrame(now: number): void {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    const previousChapter = chapter;
    if (still) {
      chapter = chapterTarget;
    } else {
      time += dt;
      chapter += (chapterTarget - chapter) * (1 - Math.exp(-dt * 4.5));
      if (Math.abs(chapterTarget - chapter) < 0.0004) chapter = chapterTarget;
    }
    const changing = Math.abs(chapter - previousChapter) > 1e-5;
    sampleTimeline(sample, chapter);
    // Mist called down on a paper boat: the same fog as the bank between
    // chapters, thickening from the horizon inward, for a few seconds.
    if (mist > 0.001) {
      sample.fog = Math.exp(
        Math.log(sample.fog) + (Math.log(7) - Math.log(sample.fog)) * mist,
      );
      sample.fogSky += (0.94 - sample.fogSky) * smoothstep(0.5, 1, mist);
    }

    /* ---- Light ---------------------------------------------------------- */
    const elevation = (sample.elevation * Math.PI) / 180;
    const azimuth = (sample.azimuth * Math.PI) / 180;
    lightDir.set(
      Math.cos(elevation) * Math.cos(azimuth),
      Math.sin(elevation),
      Math.cos(elevation) * Math.sin(azimuth),
    );
    lightTransmittance(transmittance, Math.sin(elevation));
    // Moonlight is sunlight off grey rock: the same light, dimmer and a little cool.
    const tint: RGB = [1 - 0.22 * sample.moon, 1 - 0.1 * sample.moon, 1];
    for (let c = 0; c < 3; c++)
      lightColour[c] = transmittance[c]! * tint[c]! * sample.intensity;

    // Ambient sky, from the same model the sky is drawn with. Only redone
    // when the light has actually moved.
    const key = `${sample.elevation.toFixed(2)}|${sample.azimuth.toFixed(1)}|${sample.intensity.toFixed(3)}`;
    if (key !== ambientKey) {
      ambientKey = key;
      const light: [number, number, number] = [
        lightDir.x,
        lightDir.y,
        lightDir.z,
      ];
      skyRadiance(zenith, [0, 1, 0], light, sample.intensity);
      horizonSky[0] = horizonSky[1] = horizonSky[2] = 0;
      for (let i = 0; i < 4; i++) {
        const a = azimuth + (i * Math.PI) / 2 + Math.PI / 4;
        skyRadiance(
          scratch,
          [0.94 * Math.cos(a), 0.342, 0.94 * Math.sin(a)],
          light,
          sample.intensity,
        );
        for (let c = 0; c < 3; c++) horizonSky[c]! += scratch[c]! * 0.25;
      }
      // Irradiance on a level surface from a sky of this radiance.
      for (let c = 0; c < 3; c++)
        clearAmbient[c] =
          Math.PI * (0.45 * zenith[c]! + 0.55 * horizonSky[c]!) * tint[c]!;
    }

    // Cloud and fog between the light and the scene.
    const overcast = smoothstep(0.55, 0.97, sample.cover);
    const lightVisible = (1 - overcast) * Math.exp(-sample.fogSky * 2.6);
    const sinElevation = Math.max(0, Math.sin(elevation));
    // What the cloud layer lets through arrives from everywhere, and grey.
    const diffuse =
      luminance(lightColour) *
      sinElevation *
      (0.42 * overcast + 0.3 * sample.fogSky * (1 - overcast));
    for (let c = 0; c < 3; c++) {
      ambient[c] =
        clearAmbient[c]! * (1 - 0.55 * overcast) +
        diffuse * (0.92 + 0.08 * tint[c]!);
    }

    /* Lightning: a double flash, at irregular intervals, only in the storm. */
    if (!still && sample.storm > 0.2) {
      nextFlash -= dt;
      if (nextFlash <= 0) {
        flash = 1;
        nextFlash = 3.5 + Math.random() * 7;
      }
      flash *= Math.exp(-dt * 9);
      if (flash > 0.25 && flash < 0.32 && Math.random() < 0.5) flash = 0.8;
    } else {
      flash = 0;
    }
    // A flash lights the scene to several times its ambient level: enough
    // to see everything for an instant, not enough to white the frame out.
    const flashLight = flash * sample.storm * 7 * luminance(ambient);
    for (let c = 0; c < 3; c++)
      ambient[c]! += flashLight * (c === 2 ? 1 : 0.85);

    const fogColour: RGB = [
      ambient[0]! / Math.PI,
      ambient[1]! / Math.PI,
      ambient[2]! / Math.PI,
    ];

    /*
     * Exposure, metered the way a camera would: mostly on the brightness
     * of the sky near the horizon (which fills the frame), partly on a
     * mid-grey surface lit by this sky and sun. Lightning is left out, so
     * a flash over-exposes instead of dimming the scene.
     */
    const card =
      (0.4 / Math.PI) *
      (luminance(ambient) -
        flashLight * 0.9 +
        luminance(lightColour) * sinElevation * lightVisible);
    const clearSky = 0.7 * luminance(horizonSky) + 0.3 * luminance(zenith);
    const skyBrightness =
      clearSky * (1 - sample.fogSky) * (1 - 0.6 * overcast) +
      (luminance(fogColour) - flashLight * 0.28) *
        Math.max(sample.fogSky, 0.6 * overcast);
    const metered = 0.55 * skyBrightness + 0.45 * card;
    const exposure = (0.2 / Math.max(metered, 1e-5)) * Math.pow(2, sample.ev);

    skyView.update(renderer, lightDir, sample.intensity);

    /* ---- Sea state ------------------------------------------------------ */
    sea.length = sample.seaLength;
    sea.height = sample.seaHeight;
    sea.wind = (sample.wind * Math.PI) / 180;
    sea.spread = sample.seaSpread;
    waves.update(sea, time);

    /* ---- Camera --------------------------------------------------------- */
    const aspect = width / height;
    const narrow = Math.min(1, Math.max(0, (1.2 - aspect) / 0.25));
    let fov = sample.fov;
    if (aspect < 1.6) {
      const horizontal = 2 * Math.atan(Math.tan((fov * Math.PI) / 360) * 1.6);
      const fitted =
        (2 *
          Math.atan(Math.tan(horizontal / 2) / Math.max(aspect, 0.42)) *
          180) /
        Math.PI;
      fov = sample.fov + (Math.min(78, fitted) - sample.fov) * 0.62;
    }
    camera.fov = fov;
    camera.near = sample.near;
    camera.far = sample.far;
    const shiftX = sample.narrowX * narrow;
    camera.position.set(
      sample.camera[0] + shiftX,
      sample.camera[1],
      sample.camera[2],
    );
    // A scale for incidental movement: how far the camera is from its subject.
    const reach = Math.hypot(
      sample.camera[0] - sample.look[0],
      sample.camera[1] - sample.look[1],
      sample.camera[2] - sample.look[2],
    );
    if (!still) {
      // Never perfectly locked off: a slow drift, as from a hand or a hull.
      camera.position.x += Math.sin(time * 0.23) * reach * 0.004;
      camera.position.y += Math.sin(time * 0.31 + 1.3) * reach * 0.0025;
    }
    // Keep the lens out of the water.
    const waterAtCamera = waves.heightAt(
      camera.position.x,
      camera.position.z,
      q.geo,
    );
    camera.position.y = Math.max(
      camera.position.y,
      waterAtCamera + reach * 0.035 + sample.near * 2,
    );
    camera.lookAt(
      sample.look[0] + shiftX,
      sample.look[1] + sample.narrowY * narrow,
      sample.look[2],
    );
    if (!still) camera.rotation.z += Math.sin(time * 0.19) * 0.003;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    camera.matrixWorld.extractBasis(right, up, forward);
    forward.negate();
    const tanHalf = Math.tan((fov * Math.PI) / 360);
    // Projection x view, without the camera's position: directions only.
    rotationOnly.copy(camera.matrixWorldInverse).setPosition(0, 0, 0);
    viewRotation.multiplyMatrices(camera.projectionMatrix, rotationOnly);

    /* ---- Clouds --------------------------------------------------------- */
    const cu = clouds.material.uniforms;
    cu.uCamRight!.value.copy(right);
    cu.uCamUp!.value.copy(up);
    cu.uCamForward!.value.copy(forward);
    cu.uTan!.value.set(tanHalf * aspect, tanHalf);
    cu.uCamPos!.value.copy(camera.position);
    cu.uCover!.value = sample.cover;
    cu.uDensity!.value = sample.cloudDensity;
    cu.uBase!.value = sample.cloudBase;
    cu.uTop!.value = sample.cloudTop;
    cu.uWind!.value.set(time * 9, 0, time * 3.5);
    cu.uLightDir!.value.copy(lightDir);
    cu.uLightColor!.value.set(lightColour[0], lightColour[1], lightColour[2]);
    cu.uAmbientTop!.value.set(
      zenith[0] * 1.6 + flashLight * 0.05,
      zenith[1] * 1.6 + flashLight * 0.05,
      zenith[2] * 1.6 + flashLight * 0.06,
    );
    cu.uAmbientBottom!.value.set(
      horizonSky[0] * 0.7,
      horizonSky[1] * 0.7,
      horizonSky[2] * 0.7,
    );
    cu.uHaze!.value.set(horizonSky[0], horizonSky[1], horizonSky[2]);
    cu.uFlash!.value = flash * sample.storm * 2.5;
    clouds.render(renderer, viewRotation, changing || flash > 0.02);

    /* ---- Sky ------------------------------------------------------------ */
    const peak = Math.max(
      transmittance[0],
      transmittance[1],
      transmittance[2],
      1e-4,
    );
    const su = sky.uniforms;
    su.tClouds!.value = clouds.texture;
    su.uCamRight!.value.copy(right);
    su.uCamUp!.value.copy(up);
    su.uCamForward!.value.copy(forward);
    su.uTan!.value.set(tanHalf * aspect, tanHalf);
    su.uLightDir!.value.copy(lightDir);
    su.uMieColor!.value.set(
      (transmittance[0] / peak) * tint[0],
      (transmittance[1] / peak) * tint[1],
      (transmittance[2] / peak) * tint[2],
    );
    // The disc is far brighter than anything else; this is enough to bloom.
    const disc = sample.moon > 0.5 ? 90 : 420;
    su.uDiscColor!.value.set(
      lightColour[0] * disc,
      lightColour[1] * disc,
      lightColour[2] * disc,
    );
    su.uDiscCos!.value = Math.cos(
      ((sample.moon > 0.5 ? 0.42 : 0.3) * Math.PI) / 180,
    );
    su.uMoon!.value = sample.moon;
    su.uStars!.value = sample.stars * 0.012 * sample.intensity;
    su.uFogColor!.value.set(fogColour[0], fogColour[1], fogColour[2]);
    su.uFogSky!.value = sample.fogSky;
    su.uTime!.value = time;

    /* ---- Ocean ---------------------------------------------------------- */
    const ou = ocean.uniforms;
    ou.uWaves!.value = waves.waves;
    ou.uSeaK!.value = waves.k0;
    ou.uSeaLength!.value = sea.length;
    ou.uSeaHeight!.value = sea.height;
    ou.uTime!.value = time;
    ou.uRMin!.value = Math.max(
      0.002,
      (camera.position.y - waterAtCamera) * 0.05,
    );
    ou.uRMax!.value = sample.far * 0.97;
    ou.tClouds!.value = clouds.texture;
    ou.uViewRotation!.value.copy(viewRotation);
    ou.uLightDir!.value.copy(lightDir);
    ou.uLightColor!.value.set(lightColour[0], lightColour[1], lightColour[2]);
    ou.uMieColor!.value.copy(su.uMieColor!.value);
    ou.uAmbient!.value.set(ambient[0], ambient[1], ambient[2]);
    ou.uCloudAmbient!.value.set(
      ambient[0] / Math.PI,
      ambient[1] / Math.PI,
      ambient[2] / Math.PI,
    );
    ou.uCloudCover!.value = sample.cover;
    ou.uLightVisible!.value = lightVisible;
    ou.uFoam!.value = sample.foam;
    ou.uFoamLevel!.value = sample.foamLevel;
    ou.uRain!.value = sample.rain;
    ou.uFogDensity!.value = sample.fog;
    ou.uFogColor!.value.set(fogColour[0], fogColour[1], fogColour[2]);
    ou.uFogSky!.value = sample.fogSky;
    ou.uPixelAngle!.value = (2 * tanHalf) / Math.max(1, height * pixelRatio);

    /* ---- Solid-object lighting ----------------------------------------- */
    const lightPeak = Math.max(
      lightColour[0],
      lightColour[1],
      lightColour[2],
      1e-5,
    );
    sun.color.setRGB(
      lightColour[0] / lightPeak,
      lightColour[1] / lightPeak,
      lightColour[2] / lightPeak,
    );
    sun.intensity = lightPeak * lightVisible + flashLight * 0.4;
    const ambientPeak = Math.max(ambient[0], ambient[1], ambient[2], 1e-5);
    ambientLight.color.setRGB(
      ambient[0] / ambientPeak,
      ambient[1] / ambientPeak,
      ambient[2] / ambientPeak,
    );
    // Light bounced up off the water: dimmer and blue-green.
    // The sea throws a good deal of the sky back up at whatever floats on it.
    ambientLight.groundColor.setRGB(
      (ambient[0] / ambientPeak) * 0.4,
      (ambient[1] / ambientPeak) * 0.45,
      (ambient[2] / ambientPeak) * 0.47,
    );
    // At night the eye opens up to shadow detail more than a meter does.
    ambientLight.intensity = ambientPeak * (1 + 1.4 * sample.moon);
    // Distant objects fade to the air in front of them: the fog's own
    // colour when there is fog, the horizon's otherwise.
    fog.density = sample.fog;
    fog.color.setRGB(
      horizonSky[0] + (fogColour[0] - horizonSky[0]) * sample.fogSky,
      horizonSky[1] + (fogColour[1] - horizonSky[1]) * sample.fogSky,
      horizonSky[2] + (fogColour[2] - horizonSky[2]) * sample.fogSky,
    );

    /* ---- Ship ----------------------------------------------------------- */
    const s = sample.ship;
    const shipShown = s.opacity > 0.01 && s.reveal > 0.001;
    ship.setOpacity(shipShown ? 1 : 0);
    if (shipShown) {
      // A ship this size does not feel the small waves: only the long ones.
      restingPose(
        s.x,
        s.z,
        s.yaw,
        SHIP.halfLength * 0.8,
        SHIP.halfBeam * 0.85,
        5,
        pose,
      );
      if (still || !last) {
        shipHeave.snap(pose.heave);
        shipPitch.snap(pose.pitch);
        shipRoll.snap(pose.roll);
      } else {
        shipHeave.step(pose.heave, dt);
        shipPitch.step(pose.pitch, dt);
        shipRoll.step(pose.roll, dt);
      }
      ship.group.position.set(s.x, shipHeave.value - SHIP.waterline, s.z);
      ship.group.rotation.set(
        shipRoll.value * 1.15,
        s.yaw,
        shipPitch.value,
        "YZX",
      );
      ship.group.updateMatrixWorld(true);
      ship.setReveal(s.reveal);
      ship.light.value
        .copy(lightDir)
        .transformDirection(camera.matrixWorldInverse);
      ship.lightColour.value.set(
        lightColour[0] * lightVisible,
        lightColour[1] * lightVisible,
        lightColour[2] * lightVisible,
      );
      ou.uHull!.value.set(s.x, s.z, -s.yaw, s.reveal > 0.05 ? 1 : 0);
      ou.uHullSize!.value.set(
        SHIP.halfLength,
        SHIP.halfBeam,
        Math.min(1, s.speed / 4),
        0,
      );
      if (q.shadow > 0) {
        sun.target.position.set(s.x, 8, s.z);
        sun.position.copy(sun.target.position).addScaledVector(lightDir, 110);
        sun.target.updateMatrixWorld();
      }
    } else {
      ou.uHull!.value.set(0, 0, 0, 0);
    }
    // The light casts shadows for the whole session or not at all: turning
    // it on and off would change which shader every lit material needs,
    // and that swap is a dropped frame. The map itself is only redrawn
    // while there is a ship in the light to cast one.
    const shadowsNow = shadowsOn && shipShown && lightVisible > 0.04;

    /* ---- Paper boats ---------------------------------------------------- */
    const b = sample.boat;
    // Leaning on boats belongs to the paper chapter.
    const inPlay = chapter > 0.9 && chapter < 1.9;
    // The boats the reader folded live in that chapter and fade as it ends.
    const extraFade = 1 - Math.min(1, Math.max(0, (chapter - 1.82) / 0.1));
    const windX = Math.cos(sea.wind);
    const windZ = Math.sin(sea.wind);
    let mistWanted = 0;
    let afloat = 0;
    for (let slot = 0; slot < fleet.length; slot++) {
      const paper = fleet[slot]!;
      const mesh = paper.mesh;
      const lead = slot === 0;
      readout.boats[slot]!.phase = 0;

      if (lead) {
        // The story needs its boat: a sinking is abandoned if the reader
        // leaves the chapter, and after one, another boat is folded.
        if (!inPlay && (paper.fate >= 0 || paper.refoldAt > 0)) {
          restore(paper, -10);
        } else if (paper.refoldAt > 0 && time >= paper.refoldAt) {
          restore(paper, time);
        }
      }
      const opacity = lead ? b.opacity : extraFade;
      if (!paper.active || opacity <= 0.02) {
        mesh.visible = false;
        continue;
      }

      const age = time - paper.born;
      const arrive = still ? 1 : Math.min(1, age / 0.5);
      let x = lead ? b.x : paper.x;
      let z = lead ? b.z : paper.z;
      let yaw = lead
        ? b.yaw + (still ? 0 : Math.sin(time * 0.45) * 0.12)
        : paper.yaw + Math.sin(age * 0.5) * 0.2;

      clearFatePose(fate);
      if (paper.fate >= 0) {
        const u = time - paper.since;
        stepFate(
          paper.fate,
          u,
          dt,
          yaw,
          windX,
          windZ,
          paper.side,
          paper.state,
          fate,
        );
        x += paper.state.x;
        z += paper.state.z;
        yaw += paper.state.yaw;
        mistWanted = Math.max(mistWanted, fate.mist);
        if (fate.ring > 0) {
          const reach = fate.ringAt * BOAT_LENGTH * 0.4;
          ripple(
            x + Math.cos(yaw) * reach,
            z - Math.sin(yaw) * reach,
            fate.ring,
          );
        }
        if (!paper.told && u >= FATE_TOLD[paper.fate]!) {
          paper.told = true;
          tell(paper.fate, x, z);
        }
        if (fate.done) {
          drown(paper, lead);
          continue;
        }
      }
      afloat++;

      restingPose(
        x,
        z,
        yaw,
        BOAT_LENGTH * 0.42,
        BOAT_LENGTH * 0.17,
        q.geo,
        pose,
      );
      let heave = pose.heave;
      let pitch = pose.pitch;
      let roll = pose.roll;
      if (lead) {
        // The boat in close-up follows the water through springs, so it
        // has a little weight. The others are far enough off not to need it.
        if (still || !last) {
          boatHeave.snap(pose.heave);
          boatPitch.snap(pose.pitch);
          boatRoll.snap(pose.roll);
        } else {
          boatHeave.step(pose.heave, dt);
          boatPitch.step(pose.pitch, dt);
          boatRoll.step(pose.roll, dt);
        }
        heave = boatHeave.value;
        pitch = boatPitch.value;
        roll = boatRoll.value;
      }
      mesh.visible = !fate.hidden;
      mesh.position.set(x, heave + 0.004 - fate.sink + fate.lift, z);
      mesh.rotation.set(
        roll * 1.2 * fate.follow + fate.roll,
        yaw,
        pitch * 1.2 * fate.follow + fate.pitch,
        "YZX",
      );
      mesh.scale.setScalar(1 - Math.pow(1 - arrive, 3));
      mesh.material.opacity = opacity;
      fateOf(paper).set(fate.soak, fate.limp, fate.bend, 0);
      readout.boats[slot]!.phase =
        paper.fate >= 0 ? 2 : inPlay && arrive >= 1 && opacity > 0.9 ? 1 : 0;
    }
    mist = mistWanted;
    readout.fleet.afloat = afloat;
    if (afloat > 0) {
      // The paper's light-through term works in view space. Every boat
      // shares these two uniforms.
      (boat.material.userData.light as { value: THREE.Vector3 }).value
        .copy(lightDir)
        .transformDirection(camera.matrixWorldInverse);
      (
        boat.material.userData.lightColour as { value: THREE.Vector3 }
      ).value.set(
        (lightColour[0] * lightVisible) / Math.PI,
        (lightColour[1] * lightVisible) / Math.PI,
        (lightColour[2] * lightVisible) / Math.PI,
      );
    }
    for (let i = 0; i < ripples.length; i++) {
      const ring = ripples[i]!;
      const ringAge = time - ring.born;
      const live =
        ringAge < 6 ? ring.strength * (1 - smoothstep(4, 6, ringAge)) : 0;
      (ou.uRipples!.value as THREE.Vector4[])[i]!.set(
        ring.x,
        ring.z,
        ringAge,
        live,
      );
    }

    /* ---- Lighthouse and rain ------------------------------------------- */
    lighthouse.group.visible = sample.beam > 0.01;
    if (lighthouse.group.visible) {
      lighthouse.beam.rotation.y = still ? 0.9 : time * 0.55;
      // A shaft of lit rain, a few times brighter than the air round it.
      lighthouse.beam.material.uniforms.uStrength!.value =
        sample.beam * 2.2 * luminance(fogColour);
      lighthouse.lamp.emissiveIntensity = sample.beam * 60 * sample.intensity;
    }
    rain.mesh.visible = sample.rain > 0.02;
    if (rain.mesh.visible) {
      rain.uniforms.uTime!.value = time;
      rain.uniforms.uAmount!.value = sample.rain;
      rain.uniforms.uColour!.value.set(
        fogColour[0] * 1.5,
        fogColour[1] * 1.5,
        fogColour[2] * 1.6,
      );
    }

    /* ---- Develop -------------------------------------------------------- */
    const fu = film.output.uniforms;
    fu.uExposure!.value = exposure;
    fu.uTime!.value = time;
    fu.uContrast!.value = sample.contrast;
    fu.uSaturation!.value = sample.saturation;
    renderer.shadowMap.needsUpdate = shadowsNow;

    /* The mirror pass: boats, ship and lighthouse only, seen from below. */
    const mirrored = mirrorOn && (shipShown || afloat > 0);
    if (mirrored) {
      mirrorCamera.fov = camera.fov;
      mirrorCamera.aspect = camera.aspect;
      mirrorCamera.near = camera.near;
      mirrorCamera.far = camera.far;
      mirrorCamera.position.set(
        camera.position.x,
        -camera.position.y,
        camera.position.z,
      );
      tmp.copy(camera.position).add(forward);
      tmp.y = -tmp.y;
      mirrorCamera.up.set(up.x, -up.y, up.z);
      mirrorCamera.lookAt(tmp);
      mirrorCamera.updateProjectionMatrix();
      mirrorCamera.updateMatrixWorld();
      // World position -> where to look that point up in the mirror image.
      mirrorMatrix
        .set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)
        .multiply(mirrorCamera.projectionMatrix)
        .multiply(mirrorCamera.matrixWorldInverse);
      sky.mesh.visible = false;
      ocean.mesh.visible = false;
      const rainWas = rain.mesh.visible;
      rain.mesh.visible = false;
      lighthouse.beam.visible = false;
      // Nothing below the waterline belongs in a reflection.
      WATER_CLIP.value = 0;
      renderer.setRenderTarget(mirrorTarget);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene, mirrorCamera);
      WATER_CLIP.value = -1e6;
      renderer.shadowMap.needsUpdate = false;
      sky.mesh.visible = true;
      ocean.mesh.visible = true;
      rain.mesh.visible = rainWas;
      lighthouse.beam.visible = true;
      ou.tMirror!.value = mirrorTarget.texture;
      ou.uMirrorMatrix!.value.copy(mirrorMatrix);
    }
    ou.uMirror!.value = mirrored ? 1 : 0;

    renderer.setRenderTarget(film.scene);
    renderer.render(scene, camera);
    film.render(renderer);

    /* ---- Report --------------------------------------------------------- */
    readout.chapter = chapter;
    project(boat.position, readout.boat);
    for (let slot = 0; slot < fleet.length; slot++) {
      const state = readout.boats[slot]!;
      const mesh = fleet[slot]!.mesh;
      // The first boat is always reported while it is in view: the opening
      // (lib/intro.ts) hands over to it wherever it is.
      if (state.phase === 0 && !(slot === 0 && mesh.visible)) continue;
      project(mesh.position, state);
      // Behind the camera or off the screen: not there to be pressed.
      if (
        tmp2.z > 1 ||
        state.x < -40 ||
        state.x > width + 40 ||
        state.y < -40 ||
        state.y > height + 40
      ) {
        state.phase = 0;
        continue;
      }
      tmp.set(0, 0.099, 0).applyMatrix4(mesh.matrixWorld);
      project(tmp, tipPoint);
      state.tipX = tipPoint.x;
      state.tipY = tipPoint.y;
      tmp.copy(mesh.position).addScaledVector(right, BOAT_LENGTH * 0.5);
      project(tmp, edgePoint);
      state.size = Math.abs(edgePoint.x - state.x);
    }
    project(toldPoint, readout.told);
    tmp.set(
      camera.position.x + forward.x * 4000,
      0,
      camera.position.z + forward.z * 4000,
    );
    project(tmp, horizonPoint);
    readout.horizonY = horizonPoint.y;
    for (const anchor of readout.anchors) {
      tmp.copy(SHIP_ANCHORS[anchor.id]).applyMatrix4(ship.group.matrixWorld);
      project(tmp, anchor);
      const shown = (s.reveal - PART_BUILT[anchor.id]) / 0.04;
      anchor.visible = shipShown
        ? Math.min(1, Math.max(0, shown)) *
          smoothstep(1.92, 2.02, chapter) *
          (1 - smoothstep(2.96, 3.04, chapter))
        : 0;
    }
    world.onFrame?.(readout);
  }

  /*
   * The governor. Frame pacing is measured where it shows — the gap between
   * one animation frame and the next — and if too many frames in a row are
   * late, the world gives something up: first resolution, then cloud
   * detail and the mirrored reflection, then shadows and wave detail. It
   * never climbs back, so it cannot oscillate; a device settles within a
   * few seconds at the best quality it can hold at full frame rate.
   */
  let level = 0;
  let windowFrames = 0;
  let windowSlow = 0;
  let badWindows = 0;
  let previousNow = 0;
  /** Frames to ignore after starting: shaders and textures are still arriving. */
  let settling = 150;
  let mirrorOn = q.mirror > 0;
  let shadowsOn = q.shadow > 0;

  function degrade(): void {
    level++;

    if (level === 1) {
      pixelRatio = Math.max(0.75, pixelRatio * 0.8);
      applyResolution();
    } else if (level === 2) {
      clouds.material.uniforms.uSteps!.value = Math.max(
        16,
        Math.round(q.cloudSteps * 0.62),
      );
      mirrorOn = false;
    } else if (level === 3) {
      pixelRatio = Math.max(0.6, pixelRatio * 0.8);
      applyResolution();
      // The shadow map stops being redrawn; the light keeps its shadow
      // support so nothing has to recompile.
      shadowsOn = false;
      ocean.uniforms.uNormIterations!.value = Math.max(10, q.norm - 8);
    } else if (level === 4) {
      pixelRatio = Math.max(0.5, pixelRatio * 0.8);
      applyResolution();
      clouds.material.uniforms.uSteps!.value = 14;
    }
  }

  function loop(now: number): void {
    if (disposed || !running) return;
    const gap = previousNow ? now - previousNow : 0;
    previousNow = now;
    renderFrame(now);
    frameId = requestAnimationFrame(loop);

    // Ignore the long gap after a pause; count frames that missed a 60 Hz beat.
    if (settling > 0) {
      settling--;
    } else if (gap > 0 && gap < 250 && level < 4) {
      windowFrames++;
      if (gap > 21) windowSlow++;
      if (windowFrames >= 75) {
        // One bad stretch can be anything (a download, another tab). Two in
        // a row is this device telling us it cannot keep up.
        badWindows = windowSlow > windowFrames * 0.3 ? badWindows + 1 : 0;
        if (badWindows >= 2) {
          degrade();
          badWindows = 0;
        }
        windowFrames = 0;
        windowSlow = 0;
      }
    }
  }

  /**
   * Gets the ship ready while it is still out of sight.
   *
   * Left alone, everything the ship needs would be done in the one frame
   * where it first appears: its shaders compiled, nine textures sent to
   * the GPU, 110,000 triangles uploaded. That is most of a second with the page frozen, in
   * the middle of a scroll. Here the same work is done in advance and in
   * pieces: shaders compile in the background, textures go up one per
   * frame, and a final one-pixel render takes care of the rest.
   */
  async function prepareShip(): Promise<void> {
    const group = ship.group;
    const wasVisible = group.visible;
    const nextFrame = () =>
      new Promise<void>((resolve) => setTimeout(resolve, 34));

    // Shaders. compileAsync collects materials when called and then waits
    // off the main thread, so the ship only needs to be visible for the call.
    try {
      group.visible = true;
      renderer.setRenderTarget(film.scene);
      const programs = renderer.compileAsync(scene, camera);
      renderer.setRenderTarget(null);
      group.visible = wasVisible;
      await programs;
    } catch {
      group.visible = wasVisible;
    }
    if (disposed) return;

    // Textures, one per frame.
    const textures: THREE.Texture[] = [];
    group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const material = child.material as THREE.MeshStandardMaterial;
      for (const map of [
        material.map,
        material.normalMap,
        material.roughnessMap,
        material.metalnessMap,
      ]) {
        if (map && !textures.includes(map)) textures.push(map);
      }
    });
    for (const texture of textures) {
      renderer.initTexture(texture);
      await nextFrame();
      if (disposed) return;
    }

    // Geometry and the shadow pass: draw the ship once into a single pixel.
    const pixel = new THREE.WebGLRenderTarget(1, 1, {
      depthBuffer: true,
      type: THREE.HalfFloatType,
    });
    const hidden: THREE.Object3D[] = [];
    for (const child of scene.children) {
      if (child !== group && !(child instanceof THREE.Light) && child.visible) {
        hidden.push(child);
        child.visible = false;
      }
    }
    group.visible = true;
    renderer.shadowMap.needsUpdate = shadowsOn;
    renderer.setRenderTarget(pixel);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    group.visible = wasVisible;
    for (const child of hidden) child.visible = true;
    pixel.dispose();
    if (!running && !disposed) renderFrame(performance.now());
  }

  const world: World = {
    readout,
    onFrame: null,

    async warm() {
      if (warmed || disposed) return;
      // Every shader is compiled up front and in the background, so no
      // chapter pauses to compile one in the middle of a scroll.
      const hidden: THREE.Object3D[] = [];
      scene.traverse((child) => {
        if (!child.visible) {
          hidden.push(child);
          child.visible = true;
        }
      });
      const pending: Promise<unknown>[] = [];
      try {
        renderer.setRenderTarget(film.scene);
        camera.updateProjectionMatrix();
        pending.push(renderer.compileAsync(scene, camera));
      } catch {
        // Compilation will happen on first use instead.
      }
      renderer.setRenderTarget(null);
      for (const child of hidden) child.visible = false;
      pending.push(
        film.compile(renderer),
        skyView.compile(renderer),
        clouds.bake(renderer),
      );
      await Promise.all(pending).catch(() => undefined);
      if (disposed) return;
      warmed = true;
      renderFrame(performance.now());
      // The ship arrives over the network, some time later.
      void ship.ready.then((ok) =>
        ok && !disposed ? prepareShip() : undefined,
      );
    },

    setChapter(value, immediate = false) {
      chapterTarget = Math.min(LAST_CHAPTER, Math.max(0, value));
      if (immediate) chapter = chapterTarget;
      if (warmed && !running) renderFrame(performance.now());
    },

    setSize,

    setStill(value) {
      still = value;
      if (warmed && !running) renderFrame(performance.now());
    },

    setRunning(value) {
      if (value === running || disposed || !warmed) return;
      running = value;
      if (running) {
        last = 0;
        previousNow = 0;
        settling = Math.max(settling, 30);
        frameId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(frameId);
      }
    },

    tap(clientX, clientY) {
      // Only while the paper boat is the subject.
      if (chapter < 0.9 || chapter > 1.85) return false;
      const rect = canvas.getBoundingClientRect();
      pointerNdc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -(((clientY - rect.top) / rect.height) * 2 - 1),
      );
      raycaster.setFromCamera(pointerNdc, camera);
      const hit = raycaster.ray.intersectPlane(seaPlane, tmp);
      if (!hit || hit.distanceTo(camera.position) > 3.5) return false;

      // A free place if there is one; otherwise the oldest boat is refolded.
      let slot = -1;
      for (let i = 1; i <= MAX_EXTRA_BOATS; i++) {
        const taken = fleet[i];
        if (!taken || !taken.active) {
          slot = i;
          break;
        }
      }
      if (slot < 0) {
        slot = 1 + nextExtra;
        nextExtra = (nextExtra + 1) % MAX_EXTRA_BOATS;
      }
      let paper = fleet[slot];
      if (!paper) {
        const mesh = createPaperBoat();
        // Lit by the same uniforms as the first boat.
        mesh.material.userData.light = boat.material.userData.light;
        mesh.material.userData.lightColour = boat.material.userData.lightColour;
        scene.add(mesh);
        paper = enlist(mesh);
      }
      restore(paper, time);
      paper.x = hit.x;
      paper.z = hit.z;
      paper.yaw = (slot * 2.399) % (Math.PI * 2);
      if (warmed && !running) renderFrame(performance.now());
      return true;
    },

    lean(slot, kind) {
      const paper = fleet[slot];
      if (!paper || !paper.active || paper.fate >= 0) return false;
      if (chapter < 0.9 || chapter > 1.85) return false;
      if (!Number.isInteger(kind) || kind < 0 || kind >= FATE_COUNT)
        return false;
      if (still) {
        // Reduced motion: no performance. The boat is gone, the page says
        // what would have held it, and (for the first boat) another is
        // folded a moment later.
        tell(kind, paper.mesh.position.x, paper.mesh.position.z);
        drown(paper, false);
        if (slot === 0) {
          setTimeout(() => {
            if (disposed || paper.active) return;
            restore(paper, -10);
            if (warmed && !running) renderFrame(performance.now());
          }, 1400);
        }
        if (warmed && !running) renderFrame(performance.now());
        return true;
      }
      paper.fate = kind;
      paper.since = time;
      paper.told = false;
      paper.side = Math.random() < 0.5 ? -1 : 1;
      resetFateState(paper.state);
      return true;
    },

    dispose() {
      disposed = true;
      running = false;
      cancelAnimationFrame(frameId);
      ship.dispose();
      scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh ||
          child instanceof THREE.LineSegments
        ) {
          child.geometry.dispose();
          const material = child.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      sun.shadow.map?.dispose();
      mirrorTarget.dispose();
      clouds.dispose();
      skyView.dispose();
      film.dispose();
      renderer.dispose();
    },
  };

  return world;
}
