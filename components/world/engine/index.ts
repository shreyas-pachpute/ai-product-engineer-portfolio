import * as THREE from "three";
import { createSea, createSky } from "./environment";
import { shared, type ToonMaterial } from "./materials";
import {
  createBuoy,
  createIsland,
  createLighthouse,
  createPaperBoat,
  createShip,
  type ShipPart,
} from "./models";
import { emptyPalette, mixPalette } from "./palette";
import { LookPass } from "./post";
import { LAST_CHAPTER, createSample, sampleTimeline } from "./timeline";
import { waveHeight, waveSlope } from "./waves";

/**
 * The world: one scene, one camera, one render loop.
 *
 * It knows nothing about React or the DOM beyond the canvas it is given.
 * The page tells it one thing — the chapter coordinate (see timeline.ts) —
 * and it reports back the few screen positions the page needs to pin HTML
 * to (the anatomy labels, the horizon for the intro).
 *
 * WHAT RUNS PER FRAME
 *   1. the chapter coordinate is eased toward its target, so a jerky
 *      scroll still moves the camera smoothly;
 *   2. the timeline is sampled into one plain object;
 *   3. that object is written into uniforms and transforms;
 *   4. the scene renders into the two-attachment target, and the look
 *      pass draws the frame.
 * Nothing allocates in that path: every vector and palette is reused.
 *
 * QUALITY
 * A device gets the same world at a lower resolution, never a different
 * one. The pixel ratio starts at a cap and steps down if frames run long;
 * the sea's mesh density and multisampling are chosen once from the tier.
 */

export type WorldQuality = "high" | "low";

export type AnchorState = {
  id: ShipPart;
  /** CSS pixels from the canvas's top-left. */
  x: number;
  y: number;
  /** 0–1: whether the part it points at has been built yet. */
  visible: number;
};

export type WorldReadout = {
  anchors: AnchorState[];
  /** Screen position of the paper boat and of the horizon, for the intro hand-off. */
  boat: { x: number; y: number };
  horizonY: number;
  chapter: number;
};

export type World = {
  /** Where the page is, in chapters. */
  setChapter(value: number, immediate?: boolean): void;
  setSize(width: number, height: number): void;
  /**
   * Compiles every shader the crossing will need, up front and off the
   * main thread where the browser allows it. Resolves when the world can
   * draw any chapter without stopping to compile.
   */
  warm(): Promise<void>;
  /** Reduced motion: time stops; the world still follows the scroll. */
  setStill(still: boolean): void;
  setRunning(running: boolean): void;
  /** Drops a paper boat where the pointer met the water. */
  tap(clientX: number, clientY: number): boolean;
  readout: WorldReadout;
  onFrame: ((readout: WorldReadout) => void) | null;
  dispose(): void;
};

/** When each part of the ship counts as built, in build progress. */
const PART_BUILT: Record<ShipPart, number> = {
  keel: 0.14,
  ballast: 0.46,
  hull: 0.6,
  stores: 0.72,
  compass: 0.82,
  rigging: 0.95,
};

const PART_ORDER: ShipPart[] = [
  "keel",
  "ballast",
  "hull",
  "stores",
  "compass",
  "rigging",
];

const MAX_EXTRA_BOATS = 8;

/** Hands the main thread back to the browser for a moment. */
function breathe(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Builds the world. Async only so it can pause between its heavier steps:
 * building every model in one go is a single ~100ms task, which is a
 * visibly dropped frame on whatever the page is doing at the time. In
 * pieces, each step fits inside a frame.
 */
export async function createWorld(
  canvas: HTMLCanvasElement,
  quality: WorldQuality,
): Promise<World | null> {
  // The context is asked for directly first. A device without WebGL2 then
  // gets a quiet `null` (and the page its drawn backdrop) instead of a
  // renderer that logs errors on its way to failing.
  const attributes = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  } as const;
  const context = canvas.getContext(
    "webgl2",
    attributes,
  ) as WebGL2RenderingContext | null;
  if (!context) return null;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, context, ...attributes });
  } catch {
    return null;
  }

  // Flat illustration: palette values go to the screen untouched.
  THREE.ColorManagement.enabled = false;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.autoClear = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1.6, 0.1, 900);
  const look = new LookPass(quality === "high" ? 4 : 0);

  await breathe();
  const sky = createSky();
  scene.add(sky.mesh);
  const sea = createSea(quality === "high" ? 230 : 130);
  scene.add(sea.mesh);

  await breathe();
  const paperBoat = createPaperBoat();
  scene.add(paperBoat);

  const ship = createShip();
  scene.add(ship.group);
  const shipMaterials: ToonMaterial[] = [];
  ship.group.traverse((child) => {
    if (child instanceof THREE.Mesh)
      shipMaterials.push(child.material as ToonMaterial);
  });

  await breathe();
  const lighthouse = createLighthouse();
  // Placed so the storm camera frames it and the harbour camera does not:
  // the lighthouse belongs to the weather, not to the calm.
  lighthouse.group.position.set(31, 0, -31);
  lighthouse.group.scale.setScalar(1.3);
  scene.add(lighthouse.group);

  const buoys = [
    { mesh: createBuoy(), x: -7.5, z: -6 },
    { mesh: createBuoy(), x: 9, z: -13 },
  ];
  for (const buoy of buoys) scene.add(buoy.mesh);

  const islands = [
    { mesh: createIsland(3, 24, 5.2), x: -62, z: -112 },
    { mesh: createIsland(8, 15, 3.4), x: -30, z: -124 },
    { mesh: createIsland(5, 30, 6.4), x: 98, z: -128 },
  ];
  for (const island of islands) {
    island.mesh.position.set(island.x, -0.4, island.z);
    scene.add(island.mesh);
  }

  /* Rain: slanted strokes in a box that follows the camera. */
  const rainCount = quality === "high" ? 520 : 260;
  const rainGeometry = new THREE.BufferGeometry();
  // Both ends of a stroke carry the same base position and differ only in
  // `aEnd`, so the fall-and-wrap in the shader moves a stroke as a unit.
  // (Wrapping each vertex on its own stretches a stroke the full height
  // of the box whenever its two ends wrap on different frames.)
  const rainPositions = new Float32Array(rainCount * 6);
  const rainSeeds = new Float32Array(rainCount * 2);
  const rainEnds = new Float32Array(rainCount * 2);
  for (let i = 0; i < rainCount; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 12543.123) % 1;
    const z = (Math.sin(i * 39.425) * 31871.77) % 1;
    const px = x * 30;
    const py = Math.abs(y) * 22;
    const pz = z * 30;
    rainPositions.set([px, py, pz, px, py, pz], i * 6);
    rainSeeds.set([Math.abs(x), Math.abs(x)], i * 2);
    rainEnds.set([0, 1], i * 2);
  }
  rainGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(rainPositions, 3),
  );
  rainGeometry.setAttribute("aSeed", new THREE.BufferAttribute(rainSeeds, 1));
  rainGeometry.setAttribute("aEnd", new THREE.BufferAttribute(rainEnds, 1));
  const rainMaterial = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: {
      uTime: shared.uTime,
      uAmount: { value: 0 },
      uColor: { value: new THREE.Vector3(0.72, 0.87, 0.92) },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      attribute float aEnd;
      uniform float uTime;
      out float vSeed;
      void main() {
        vSeed = aSeed;
        vec3 p = position;
        float fall = uTime * (15.0 + aSeed * 8.0) + aSeed * 40.0;
        p.y = mod(p.y - fall, 22.0) - 4.0;
        p.x = mod(p.x - fall * 0.27 + 15.0, 30.0) - 15.0;
        p += aEnd * vec3(-0.24, -0.9, 0.0);
        vec4 world = vec4(p + vec3(cameraPosition.x, 0.0, cameraPosition.z - 14.0), 1.0);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      layout(location = 0) out highp vec4 pc_fragColor;
      layout(location = 1) out highp vec4 gInk;
      uniform float uAmount;
      uniform vec3 uColor;
      in float vSeed;
      void main() {
        // The rain thickens as the weather arrives: a stroke only falls
        // once the amount has passed its own threshold.
        if (vSeed > uAmount) discard;
        pc_fragColor = vec4(uColor, 1.0);
        gInk = vec4(0.0);
      }
    `,
  });
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial);
  rain.frustumCulled = false;
  scene.add(rain);

  /* Extra paper boats, folded by tapping the water in chapter 1. */
  const extraBoats: {
    mesh: THREE.Mesh<THREE.BufferGeometry, ToonMaterial>;
    x: number;
    z: number;
    yaw: number;
    born: number;
    active: boolean;
  }[] = [];
  let nextExtra = 0;

  /* State. */
  const sample = createSample();
  const palette = emptyPalette();
  const readout: WorldReadout = {
    anchors: PART_ORDER.map((id) => ({ id, x: 0, y: 0, visible: 0 })),
    boat: { x: 0, y: 0 },
    horizonY: 0,
    chapter: 0,
  };

  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  const maxPixelRatio = quality === "high" ? 1.5 : 1.25;
  let chapterTarget = 0;
  let chapter = 0;
  let time = 0;
  let last = 0;
  let still = false;
  let running = false;
  let frameId = 0;
  let disposed = false;
  let slowFrames = 0;
  let measured = 0;
  let warmed = false;

  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const seaPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const pointerNdc = new THREE.Vector2();

  function applyResolution(): void {
    const w = Math.max(2, Math.round(width * pixelRatio));
    const h = Math.max(2, Math.round(height * pixelRatio));
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    // Line weight is authored in CSS pixels, so it holds across densities.
    look.setSize(w, h, 1.55 * pixelRatio);
  }

  function setSize(w: number, h: number): void {
    if (w <= 0 || h <= 0) return;
    width = w;
    height = h;
    pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    camera.aspect = w / h;
    applyResolution();
    if (warmed && !running) renderFrame(performance.now());
  }

  /** Floats an object on the swell: height from the wave, tilt from its slope. */
  function float(
    object: THREE.Object3D,
    x: number,
    z: number,
    yaw: number,
    swell: number,
    draft: number,
    tiltGain: number,
  ): void {
    const h = waveHeight(x, z, time, swell);
    const slope = waveSlope(x, z, time, swell);
    // Slope along the hull, and across it.
    const fx = Math.cos(yaw);
    const fz = -Math.sin(yaw);
    const along = slope.dx * fx + slope.dz * fz;
    const across = slope.dx * -fz + slope.dz * fx;
    object.position.set(x, h + draft, z);
    object.rotation.set(
      -Math.atan(across) * tiltGain,
      yaw,
      Math.atan(along) * tiltGain,
      "YXZ",
    );
  }

  function project(world: THREE.Vector3, out: { x: number; y: number }): void {
    tmp2.copy(world).project(camera);
    out.x = (tmp2.x * 0.5 + 0.5) * width;
    out.y = (1 - (tmp2.y * 0.5 + 0.5)) * height;
  }

  function renderFrame(now: number): void {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;

    if (still) {
      chapter = chapterTarget;
    } else {
      time += dt;
      // Critically damped follow: the camera never lags by more than a
      // fraction of a second, and never overshoots.
      chapter += (chapterTarget - chapter) * (1 - Math.exp(-dt * 5.5));
      if (Math.abs(chapterTarget - chapter) < 0.0004) chapter = chapterTarget;
    }

    sampleTimeline(sample, chapter);
    mixPalette(
      palette,
      sample.paletteFrom,
      sample.paletteTo,
      sample.paletteMix,
    );

    /* Shared uniforms. */
    shared.uTime.value = time;
    shared.uSwell.value = sample.swell;
    shared.uLightDir.value
      .set(sample.light[0], sample.light[1], sample.light[2])
      .normalize();
    shared.uShade.value.fromArray(palette.shade);
    shared.uAmbient.value.fromArray(palette.ambient);
    shared.uHaze.value.fromArray(palette.haze);
    shared.uHazeNear.value = sample.hazeNear;
    shared.uHazeFar.value = sample.hazeFar;

    /* Sky. */
    sky.uniforms.uSkyTop.value.fromArray(palette.skyTop);
    sky.uniforms.uSkyHorizon.value.fromArray(palette.skyHorizon);
    sky.uniforms.uSun.value.fromArray(palette.sun);
    sky.uniforms.uSunHalo.value.fromArray(palette.sunHalo);
    sky.uniforms.uCloud.value.fromArray(palette.cloud);
    sky.uniforms.uCloudShade.value.fromArray(palette.cloudShade);
    sky.uniforms.uSunDir.value
      .set(sample.sunDir[0], sample.sunDir[1], sample.sunDir[2])
      .normalize();
    sky.uniforms.uSunSize.value = sample.sunSize;
    sky.uniforms.uClouds.value = sample.clouds;
    sky.uniforms.uStars.value = sample.stars;

    /* Sea. */
    sea.uniforms.uSeaDeep.value.fromArray(palette.seaDeep);
    sea.uniforms.uSeaMid.value.fromArray(palette.seaMid);
    sea.uniforms.uSeaLight.value.fromArray(palette.seaLight);
    sea.uniforms.uSeaFar.value.fromArray(palette.seaFar);
    sea.uniforms.uFoam.value.fromArray(palette.foam);
    sea.uniforms.uInkColor.value.fromArray(palette.ink);
    sea.uniforms.uSun.value.fromArray(palette.sun);
    sea.uniforms.uSunDir.value.copy(sky.uniforms.uSunDir.value);
    sea.uniforms.uPaper.value = sample.paper;
    sea.uniforms.uFoamLevel.value = sample.foam;
    sea.uniforms.uGlitter.value = sample.glitter;

    /* Camera. Narrow screens widen the lens so the subject stays in frame. */
    const aspect = width / height;
    const reference = 1.6;
    let fov = sample.fov;
    if (aspect < reference) {
      const horizontal =
        2 * Math.atan(Math.tan((fov * Math.PI) / 360) * reference);
      fov = Math.min(
        78,
        (2 *
          Math.atan(Math.tan(horizontal / 2) / Math.max(aspect, 0.42)) *
          180) /
          Math.PI,
      );
      // A pure width-match zooms out too far on a phone; meet it halfway.
      fov = sample.fov + (fov - sample.fov) * 0.62;
    }
    camera.fov = fov;
    // 0 on any landscape frame, 1 on an upright one, blending across the
    // nearly-square shapes in between. The page's CSS switches between its
    // wide and tall layouts at the same point (aspect 11:10), so the type
    // and the camera always agree on where the subject is.
    const narrow = Math.min(1, Math.max(0, (1.2 - aspect) / 0.25));
    const shift = sample.narrowX * narrow;
    camera.position.set(
      sample.camera[0] + shift,
      sample.camera[1],
      sample.camera[2],
    );
    // The camera rides the swell a little, so the horizon is never dead level.
    if (!still) {
      camera.position.y +=
        waveHeight(sample.camera[0], sample.camera[2], time, sample.swell) *
        0.16;
    }
    camera.lookAt(
      sample.look[0] + shift,
      sample.look[1] + sample.narrowY * narrow,
      sample.look[2],
    );
    if (!still)
      camera.rotation.z +=
        Math.sin(time * 0.31) * 0.004 * Math.min(2, sample.swell);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    sky.mesh.position.copy(camera.position);

    const onPaper = sample.paper;

    /* Ship. Heavier: it follows the swell, but stiffly. */
    float(
      ship.group,
      sample.ship.x,
      sample.ship.z,
      sample.ship.yaw,
      sample.swell,
      -0.02 + onPaper * 0.64,
      0.55,
    );
    ship.setBuild(sample.ship.build);
    ship.group.visible = sample.ship.opacity > 0.02;
    for (const material of shipMaterials)
      material.uniforms.uOpacity.value = sample.ship.opacity;
    ship.group.updateMatrixWorld(true);
    sea.uniforms.uWake.value.set(
      sample.ship.x,
      sample.ship.z,
      sample.ship.yaw + Math.PI,
      sample.wake,
    );

    /* Paper boat. A demo rides every wave it meets: it tilts hard. */
    paperBoat.scale.setScalar(sample.boat.scale);
    // Between the drawing board and the sea the boat changes where it
    // lives (on the paper, then stowed aboard). It fades through that
    // hand-off instead of jumping.
    paperBoat.material.uniforms.uOpacity.value =
      sample.boat.opacity * Math.min(1, Math.abs(onPaper - 0.5) * 4);
    if (sample.boat.scale < 0.5 && onPaper < 0.5) {
      // Stowed aboard: it sails with the ship, on the foredeck.
      paperBoat.position
        .set(sample.boat.x, 1.36, sample.boat.z)
        .applyMatrix4(ship.group.matrixWorld);
      paperBoat.quaternion.copy(ship.group.quaternion);
    } else {
      float(
        paperBoat,
        sample.boat.x,
        sample.boat.z,
        sample.boat.yaw + (still ? 0 : Math.sin(time * 0.4) * 0.07),
        sample.swell,
        0.03 + onPaper * 0.12,
        1.25,
      );
    }

    /* Lighthouse, buoys, islands: on the water, not on the paper. */
    const atSea = onPaper < 0.5;
    lighthouse.group.visible = atSea;
    lighthouse.beam.visible = sample.beam > 0.02;
    // The lamp scans an arc of open water to one side of the ship rather
    // than turning full circle, so the beam never crosses the page's text.
    lighthouse.beam.rotation.y =
      -0.35 + (still ? 0 : Math.sin(time * 0.5) * 0.96);
    lighthouse.beam.material.uniforms.uOpacity.value = sample.beam;
    for (const buoy of buoys) {
      buoy.mesh.visible = atSea;
      float(buoy.mesh, buoy.x, buoy.z, 0, sample.swell, -0.05, 0.9);
    }
    for (const island of islands) island.mesh.visible = atSea;

    rain.visible = sample.rain > 0.02 && atSea;
    rainMaterial.uniforms.uAmount!.value = sample.rain;

    /* Extra paper boats live in chapter 1 and fade as it ends. */
    const extraFade = 1 - Math.min(1, Math.max(0, (chapter - 1.82) / 0.2));
    for (const extra of extraBoats) {
      if (!extra.active) continue;
      const age = time - extra.born;
      const arrive = Math.min(1, age / 0.5);
      extra.mesh.visible = extraFade > 0.02;
      extra.mesh.scale.setScalar(0.62 * (1 - Math.pow(1 - arrive, 3)));
      extra.mesh.material.uniforms.uOpacity.value = extraFade;
      float(
        extra.mesh,
        extra.x + age * 0.05,
        extra.z,
        extra.yaw + Math.sin(age * 0.5) * 0.2,
        sample.swell,
        0.02,
        1.35,
      );
    }

    /* Draw. */
    look.material.uniforms.uInk!.value.fromArray(palette.ink);
    look.material.uniforms.uTime!.value = time;
    renderer.setRenderTarget(look.target);
    renderer.render(scene, camera);
    look.render(renderer);

    /* Report. */
    readout.chapter = chapter;
    project(paperBoat.position, readout.boat);
    tmp.set(camera.position.x, 0, camera.position.z - 480);
    const horizon = { x: 0, y: 0 };
    project(tmp, horizon);
    readout.horizonY = horizon.y;
    for (const anchor of readout.anchors) {
      tmp.copy(ship.anchors[anchor.id]).applyMatrix4(ship.group.matrixWorld);
      project(tmp, anchor);
      const built = (sample.ship.build - PART_BUILT[anchor.id]) / 0.05;
      anchor.visible =
        Math.min(1, Math.max(0, built)) * Math.min(1, onPaper * 1.4);
    }
    world.onFrame?.(readout);
  }

  function loop(now: number): void {
    if (disposed || !running) return;
    const before = performance.now();
    renderFrame(now);
    frameId = requestAnimationFrame(loop);

    // Adaptive resolution: if the first seconds run long, step the pixel
    // ratio down once or twice rather than let the page stutter.
    if (measured < 240) {
      measured++;
      if (performance.now() - before > 14) slowFrames++;
      if (measured === 120 || measured === 240) {
        if (slowFrames > 40 && pixelRatio > 0.8) {
          pixelRatio = Math.max(0.8, pixelRatio - 0.3);
          applyResolution();
        }
        slowFrames = 0;
      }
    }
  }

  const world: World = {
    readout,
    onFrame: null,

    async warm() {
      if (warmed || disposed) return;
      // Without this, a shader is compiled the first time something using
      // it is drawn — the ship, the rain, the beam — and each of those is
      // a dropped frame in the middle of a scroll. So: show everything
      // once, ask for all the programs together, and wait for them.
      const hidden: THREE.Object3D[] = [];
      scene.traverse((child) => {
        if (!child.visible) {
          hidden.push(child);
          child.visible = true;
        }
      });
      try {
        renderer.setRenderTarget(look.target);
        camera.updateProjectionMatrix();
        await renderer.compileAsync(scene, camera);
        await look.compile(renderer);
      } catch {
        // Compilation will simply happen on first use instead.
      }
      for (const child of hidden) child.visible = false;
      if (disposed) return;
      warmed = true;
      renderFrame(performance.now());
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
      if (!hit || hit.distanceTo(camera.position) > 34) return false;

      let extra = extraBoats[nextExtra];
      if (!extra) {
        const mesh = createPaperBoat();
        scene.add(mesh);
        extra = { mesh, x: 0, z: 0, yaw: 0, born: 0, active: false };
        extraBoats[nextExtra] = extra;
      }
      extra.x = hit.x;
      extra.z = hit.z;
      extra.yaw = (nextExtra * 2.399) % (Math.PI * 2);
      extra.born = time;
      extra.active = true;
      nextExtra = (nextExtra + 1) % MAX_EXTRA_BOATS;
      return true;
    },

    dispose() {
      disposed = true;
      running = false;
      cancelAnimationFrame(frameId);
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
      look.dispose();
      renderer.dispose();
    },
  };

  return world;
}
