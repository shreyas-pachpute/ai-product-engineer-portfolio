import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * The things on the water: the paper boat, the ship, the lighthouse, rain.
 *
 * All of them use physically based materials lit by the same sun (or moon)
 * and the same sky colour as the sea, so nothing looks pasted in.
 */

type V = [number, number, number];

/* -------------------------------------------------------------------------
   Cutting things off at a height.

   Two things need it: the ship is revealed from the keel up, and the
   mirrored pass must not draw anything below the waterline. three.js has
   clipping planes for this, but every combination of planes is a separate
   shader, compiled the first time it is drawn — which was a third of a
   second of frozen page the moment the ship appeared, and again when the
   lighthouse did. So the cut is written into the materials instead: two
   heights, read from uniforms, and one shader for every pass, compiled
   once, before anything is on screen.
   ------------------------------------------------------------------------- */

/** Fragments below this world height are dropped. Raised to 0 for the mirror. */
export const WATER_CLIP = { value: -1e6 };
const NO_REVEAL = { value: 1e6 };

export function clipped(
  material: THREE.Material,
  key: string,
  reveal: { value: number } = NO_REVEAL,
): void {
  const previous = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    shader.uniforms.uWaterClip = WATER_CLIP;
    shader.uniforms.uRevealY = reveal;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vClipY;")
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvClipY = (modelMatrix * vec4(transformed, 1.0)).y;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uWaterClip;\nuniform float uRevealY;\nvarying float vClipY;",
      )
      .replace(
        "void main() {",
        "void main() {\n  if (vClipY < uWaterClip || vClipY > uRevealY) discard;",
      );
  };
  // Materials that differ only by this patch must not share a program.
  material.customProgramCacheKey = () => key;
}

/* -------------------------------------------------------------------------
   Paper boat. Real size: 24 cm from bow to stern.
   ------------------------------------------------------------------------- */

export const BOAT_LENGTH = 0.24;

/**
 * A sheet of ruled notebook paper, drawn once into a canvas: off-white,
 * faintly mottled, blue lines 8 mm apart and a red margin. It is what
 * makes the boat read as something somebody folded at a desk.
 */
function createPaperTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#f3f0e8";
  context.fillRect(0, 0, size, size);
  // Fibre: thousands of faint specks, lighter and darker than the sheet.
  for (let n = 0; n < 9000; n++) {
    const shade = Math.random() < 0.5 ? 255 : 150;
    context.fillStyle = `rgba(${shade}, ${shade}, ${shade - 8}, ${0.03 + Math.random() * 0.05})`;
    context.fillRect(
      Math.random() * size,
      Math.random() * size,
      1 + Math.random() * 2,
      1,
    );
  }
  // Ruled lines. The texture spans 12.8 cm of paper, so 16 lines = 8 mm.
  context.strokeStyle = "rgba(96, 128, 178, 0.55)";
  context.lineWidth = 1.4;
  for (let line = 0; line < 16; line++) {
    const y = (line + 0.5) * (size / 16);
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(size, y);
    context.stroke();
  }
  context.strokeStyle = "rgba(196, 82, 76, 0.5)";
  context.beginPath();
  context.moveTo(size * 0.14, 0);
  context.lineTo(size * 0.14, size);
  context.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

let paperTexture: THREE.CanvasTexture | null = null;

export function createPaperBoat(): THREE.Mesh<
  THREE.BufferGeometry,
  THREE.MeshStandardMaterial
> {
  const bow: V = [1.6, 0.5, 0];
  const stern: V = [-1.6, 0.5, 0];
  const rimL: V = [0, 0.42, 0.64];
  const rimR: V = [0, 0.42, -0.64];
  const keelF: V = [0.98, -0.14, 0];
  const keelB: V = [-0.98, -0.14, 0];
  const apex: V = [0, 1.32, 0];
  const tentF: V = [0.52, 0.36, 0];
  const tentB: V = [-0.52, 0.36, 0];
  const faces: [V, V, V][] = [
    [bow, keelF, rimL],
    [keelF, keelB, rimL],
    [keelB, stern, rimL],
    [bow, rimR, keelF],
    [keelF, rimR, keelB],
    [keelB, rimR, stern],
    [bow, rimL, tentF],
    [bow, tentF, rimR],
    [stern, tentB, rimL],
    [stern, rimR, tentB],
    [tentF, rimL, apex],
    [tentB, apex, rimL],
    [tentF, apex, rimR],
    [tentB, rimR, apex],
  ];
  const scale = BOAT_LENGTH / 3.2;

  /*
   * Each flat panel is split into a small grid of triangles so it can bow
   * slightly, the way a folded sheet never lies quite flat. Panels do not
   * share vertices, so every fold stays a hard crease.
   */
  const SPLIT = 5;
  const positions: number[] = [];
  const uvs: number[] = [];
  const point = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();
  const normal = new THREE.Vector3();
  faces.forEach((face, f) => {
    const a = new THREE.Vector3(...face[0]);
    const b = new THREE.Vector3(...face[1]);
    const c = new THREE.Vector3(...face[2]);
    edge1.subVectors(b, a);
    edge2.subVectors(c, a);
    normal.crossVectors(edge1, edge2).normalize();
    // Axes in the panel's own plane, for laying the ruled lines across it.
    const u = edge1.clone().normalize();
    const v = new THREE.Vector3().crossVectors(normal, u);
    // Each panel shows the sheet at a different angle, as after folding.
    const turn = (f * 1.9) % (Math.PI * 2);
    const bulge = 0.02 * (f % 2 === 0 ? 1 : -1);
    const corner = (
      s: number,
      t: number,
    ): [THREE.Vector3, [number, number]] => {
      point.copy(a).addScaledVector(edge1, s).addScaledVector(edge2, t);
      // Greatest in the middle of the panel, zero along its edges.
      const lift = s * t * (1 - s - t) * 27 * bulge;
      point.addScaledVector(normal, lift);
      const lu = point.dot(u) * scale;
      const lv = point.dot(v) * scale;
      const tu = (lu * Math.cos(turn) - lv * Math.sin(turn)) / 0.128 + f * 0.37;
      const tv = (lu * Math.sin(turn) + lv * Math.cos(turn)) / 0.128 + f * 0.61;
      return [point.clone().multiplyScalar(scale), [tu, tv]];
    };
    for (let row = 0; row < SPLIT; row++) {
      for (let col = 0; col < SPLIT - row; col++) {
        const s0 = col / SPLIT;
        const t0 = row / SPLIT;
        const s1 = (col + 1) / SPLIT;
        const t1 = (row + 1) / SPLIT;
        const tri = [corner(s0, t0), corner(s1, t0), corner(s0, t1)];
        if (col < SPLIT - row - 1)
          tri.push(corner(s1, t0), corner(s1, t1), corner(s0, t1));
        for (const [position, uv] of tri) {
          positions.push(position.x, position.y, position.z);
          uvs.push(uv[0], uv[1]);
        }
      }
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array(uvs), 2),
  );
  geometry.computeVertexNormals();

  // Paper: matte, nearly white, and thin enough to glow a little when the
  // light is behind it. Darker and greyer where it has soaked up water.
  paperTexture ??= createPaperTexture();
  const material = new THREE.MeshStandardMaterial({
    map: paperTexture,
    roughness: 0.86,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
  });
  material.userData.light = { value: new THREE.Vector3(0, 1, 0) };
  material.userData.lightColour = { value: new THREE.Vector3(1, 1, 1) };
  // What is happening to this boat as it goes down (see fates.ts):
  // x how far the water has climbed the paper, y how limp it has gone,
  // z how far it has folded across the middle. All zero while it floats.
  material.userData.fate = { value: new THREE.Vector4(0, 0, 0, 0) };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSunDir = material.userData.light;
    shader.uniforms.uSunColour = material.userData.lightColour;
    shader.uniforms.uFate = material.userData.fate;
    // The fold: bow and stern hinge up about the keel amidships. The same
    // angle turns the positions and the normals.
    const fold = /* glsl */ `
      float foldAngle = uFate.z * sign(position.x) * smoothstep(0.0, 0.018, abs(position.x));
      float foldC = cos(foldAngle);
      float foldS = sin(foldAngle);
      mat2 foldTurn = mat2(foldC, foldS, -foldS, foldC);`;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform vec4 uFate;\nvarying float vHeight;",
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
        {${fold}
          objectNormal.xy = foldTurn * objectNormal.xy;
          // Lying flat, every panel faces up or down.
          objectNormal = normalize(mix(objectNormal, vec3(0.0, objectNormal.y < 0.0 ? -1.0 : 1.0, 0.0), uFate.y * 0.85));
        }`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vHeight = position.y;
        {${fold}
          // Soaked through, the paper gives up its folds and lies down.
          transformed.y = mix(transformed.y, 0.003 + transformed.y * 0.06, uFate.y);
          transformed.xz *= 1.0 + 0.2 * uFate.y;
          vec2 hinge = vec2(0.0, -0.0105);
          transformed.xy = hinge + foldTurn * (transformed.xy - hinge);
        }`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uSunDir;
        uniform vec3 uSunColour;
        uniform vec4 uFate;
        varying float vHeight;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          // Light through the sheet: the side facing away from the sun
          // still catches some of it. uSunDir is in view space.
          float through = max(dot(-normal, uSunDir), 0.0);
          totalEmissiveRadiance += diffuseColor.rgb * uSunColour * through * 0.13;
          // Wet paper: darker and a little translucent. Along the
          // waterline while it floats; all the way up once it is soaked.
          float wetLine = uFate.x * 0.125;
          float wet = 1.0 - smoothstep(wetLine - 0.006, wetLine + 0.012, vHeight);
          diffuseColor.rgb *= mix(1.0, mix(0.62, 0.5, uFate.x), wet);
          roughnessFactor = mix(roughnessFactor, 0.45, wet);
        }`,
      );
  };
  clipped(material, "paper");
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "paper-boat";
  mesh.castShadow = true;
  return mesh;
}

/* -------------------------------------------------------------------------
   The ship.

   "Dutch Ship Large 01" from Poly Haven (CC0): a 34-metre wooden sailing
   ship, modelled and textured by hand. See public/world/CREDITS.txt.
   It arrives as three meshes — hull, rigging, sails — each with its own
   colour, normal and roughness/metalness maps.
   ------------------------------------------------------------------------- */

export type ShipPart =
  "keel" | "ballast" | "hull" | "stores" | "compass" | "rigging";

/** Model-space facts, measured from the file. Lengths in metres. */
export const SHIP = {
  /** Lowest point of the keel, and the tip of the main mast. */
  keelY: -1.92,
  topY: 30.2,
  /** Where the hull sits in still water. */
  waterline: 0.35,
  halfLength: 15.2,
  halfBeam: 4.2,
  /** Centre of the hull along its length (the model is not centred). */
  centreX: 2.15,
} as const;

/** Points on the ship the page pins its numbered callouts to. */
export const SHIP_ANCHORS: Record<ShipPart, THREE.Vector3> = {
  keel: new THREE.Vector3(-4.5, -1.6, 0),
  ballast: new THREE.Vector3(3.5, -0.9, 0),
  hull: new THREE.Vector3(10.5, 3.2, 4.0),
  stores: new THREE.Vector3(1.5, 6.2, 0),
  compass: new THREE.Vector3(-8.5, 9.4, 0),
  rigging: new THREE.Vector3(4.5, 21.5, 0),
};

export type Ship = {
  group: THREE.Group;
  /** The light, in view space, and its colour: for the sails' glow. */
  light: { value: THREE.Vector3 };
  lightColour: { value: THREE.Vector3 };
  /** Resolves when the model has loaded (or failed; then it stays empty). */
  ready: Promise<boolean>;
  /** 0–1: how much of the ship has been revealed, from the keel up. */
  setReveal(progress: number): void;
  setOpacity(opacity: number): void;
  dispose(): void;
};

export function createShip(url: string, anisotropy: number): Ship {
  const group = new THREE.Group();
  group.name = "ship";
  // The height above which the ship is not there yet.
  const revealY = { value: 1e6 };
  const materials: THREE.MeshStandardMaterial[] = [];
  const light = { value: new THREE.Vector3(0, 1, 0) };
  const lightColour = { value: new THREE.Vector3(1, 1, 1) };
  let reveal = 1;

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const ready = loader
    .loadAsync(url)
    .then((gltf) => {
      gltf.scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const material = child.material as THREE.MeshStandardMaterial;
        // The file marks everything double-sided; only the sails need it,
        // and culling back faces on the rest is cheaper and avoids
        // lighting the inside of the planking.
        const sails = material.name.includes("sails");
        material.side = sails ? THREE.DoubleSide : THREE.FrontSide;
        if (sails) {
          // Sailcloth is thin. With the sun behind it, it does not go
          // black: it lights up, warm, from the far side.
          material.onBeforeCompile = (shader) => {
            shader.uniforms.uSunDir = light;
            shader.uniforms.uSunColour = lightColour;
            shader.fragmentShader = shader.fragmentShader
              .replace(
                "#include <common>",
                `#include <common>
                uniform vec3 uSunDir;
                uniform vec3 uSunColour;`,
              )
              .replace(
                "#include <emissivemap_fragment>",
                `#include <emissivemap_fragment>
                totalEmissiveRadiance += diffuseColor.rgb * vec3(1.0, 0.9, 0.72) * uSunColour * max(dot(-normal, uSunDir), 0.0) * 0.2;`,
              );
          };
        }
        material.envMapIntensity = 1;
        clipped(material, sails ? "sails" : "ship", revealY);
        for (const map of [
          material.map,
          material.normalMap,
          material.roughnessMap,
        ]) {
          if (map) map.anisotropy = anisotropy;
        }
        materials.push(material);
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
      });
      group.add(gltf.scene);
      return true;
    })
    .catch(() => false);

  return {
    group,
    light,
    lightColour,
    ready,
    setReveal(progress) {
      reveal = Math.min(1, Math.max(0, progress));
      // A world height, so it follows the ship as she rides the water.
      const y = SHIP.keelY - 0.5 + (SHIP.topY + 1.5 - SHIP.keelY) * reveal;
      revealY.value = reveal >= 0.999 ? 1e6 : group.position.y + y;
    },
    setOpacity(opacity) {
      group.visible = opacity > 0.01;
    },
    dispose() {
      group.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const material = child.material as THREE.MeshStandardMaterial;
        material.map?.dispose();
        material.normalMap?.dispose();
        material.roughnessMap?.dispose();
        material.dispose();
      });
    },
  };
}

/* -------------------------------------------------------------------------
   Lighthouse: a painted masonry tower on a rock, a long way off.
   ------------------------------------------------------------------------- */

export type Lighthouse = {
  group: THREE.Group;
  beam: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  lamp: THREE.MeshStandardMaterial;
};

export function createLighthouse(): Lighthouse {
  const group = new THREE.Group();
  group.name = "lighthouse";
  const paint = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.78,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x1b1f22,
    roughness: 0.6,
    metalness: 0.4,
  });
  const rock = new THREE.MeshStandardMaterial({
    color: 0x2a2b2a,
    roughness: 0.95,
    flatShading: true,
  });
  clipped(paint, "lighthouse");
  clipped(dark, "lighthouse");
  clipped(rock, "lighthouse");

  // Rock: a lumpy mound, wider than it is tall.
  const rockGeometry = new THREE.IcosahedronGeometry(1, 3);
  const rp = rockGeometry.attributes.position!;
  for (let i = 0; i < rp.count; i++) {
    const x = rp.getX(i);
    const y = rp.getY(i);
    const z = rp.getZ(i);
    const lump =
      1 +
      0.22 * Math.sin(x * 5.1 + z * 3.3) +
      0.14 * Math.sin(y * 7.7 + x * 4.1) +
      0.1 * Math.sin(z * 9.3);
    rp.setXYZ(i, x * 15 * lump, y * 5.5 * lump - 1.2, z * 12 * lump);
  }
  rockGeometry.computeVertexNormals();
  group.add(new THREE.Mesh(rockGeometry, rock));

  // Tower: white with two red bands.
  const height = 27;
  const tower = new THREE.CylinderGeometry(2.3, 3.6, height, 40, 24, false);
  const tp = tower.attributes.position!;
  const colours = new Float32Array(tp.count * 3);
  for (let i = 0; i < tp.count; i++) {
    const t = (tp.getY(i) + height / 2) / height;
    const band = (t > 0.3 && t < 0.5) || (t > 0.72 && t < 0.9);
    const weather = 0.9 + 0.1 * Math.sin(tp.getX(i) * 7 + tp.getY(i) * 2.3);
    colours.set(
      band
        ? [0.48 * weather, 0.06, 0.05]
        : [0.82 * weather, 0.81 * weather, 0.77 * weather],
      i * 3,
    );
  }
  tower.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  const towerMesh = new THREE.Mesh(tower, paint);
  towerMesh.position.y = 3 + height / 2;
  group.add(towerMesh);

  const gallery = new THREE.Mesh(
    new THREE.CylinderGeometry(3.1, 3.1, 0.5, 40),
    dark,
  );
  gallery.position.y = 3 + height + 0.25;
  group.add(gallery);

  // The lantern: glass round a lamp.
  const lamp = new THREE.MeshStandardMaterial({
    color: 0x111111,
    emissive: new THREE.Color(1, 0.86, 0.6),
    emissiveIntensity: 0,
    roughness: 0.3,
  });
  clipped(lamp, "lighthouse");
  const lantern = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.7, 2.6, 24),
    lamp,
  );
  lantern.position.y = 3 + height + 1.8;
  group.add(lantern);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.8, 24), dark);
  roof.position.y = 3 + height + 4;
  group.add(roof);

  /*
   * The beam: two opposite shafts of lit air. Each is a narrow cone, and a
   * cone of lit haze is brightest where the eye looks through the most of
   * it — down its middle — and vanishes at its edges. The shader does
   * exactly that with the cone's surface normal, which is what stops it
   * looking like a solid wedge.
   */
  const length = 520;
  const shafts: number[] = [];
  const segments = 24;
  for (const side of [1, -1]) {
    for (let seg = 0; seg < segments; seg++) {
      const a0 = (seg / segments) * Math.PI * 2;
      const a1 = ((seg + 1) / segments) * Math.PI * 2;
      const r = length * 0.012;
      const am = (a0 + a1) / 2;
      // position (3), distance along the shaft (1), outward direction (2).
      shafts.push(0, 0, 0, 0, Math.cos(am), Math.sin(am));
      shafts.push(
        side * length,
        Math.cos(a0) * r,
        Math.sin(a0) * r,
        1,
        Math.cos(a0),
        Math.sin(a0),
      );
      shafts.push(
        side * length,
        Math.cos(a1) * r,
        Math.sin(a1) * r,
        1,
        Math.cos(a1),
        Math.sin(a1),
      );
    }
  }
  const beamBuffer = new THREE.InterleavedBuffer(new Float32Array(shafts), 6);
  const beamGeometry = new THREE.BufferGeometry();
  beamGeometry.setAttribute(
    "position",
    new THREE.InterleavedBufferAttribute(beamBuffer, 3, 0),
  );
  beamGeometry.setAttribute(
    "aAlong",
    new THREE.InterleavedBufferAttribute(beamBuffer, 1, 3),
  );
  beamGeometry.setAttribute(
    "aOut",
    new THREE.InterleavedBufferAttribute(beamBuffer, 2, 4),
  );
  const beamMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uStrength: { value: 0 },
      uColour: { value: new THREE.Vector3(1, 0.88, 0.62) },
    },
    vertexShader: /* glsl */ `
      attribute float aAlong;
      attribute vec2 aOut;
      varying float vAlong;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vAlong = aAlong;
        vNormal = normalize(normalMatrix * vec3(0.0, aOut));
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uStrength;
      uniform vec3 uColour;
      varying float vAlong;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float through = abs(dot(normalize(vNormal), normalize(vView)));
        float fade = pow(1.0 - vAlong, 3.0);
        gl_FragColor = vec4(uColour * (uStrength * fade * through * through), 1.0);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const beam = new THREE.Mesh(beamGeometry, beamMaterial);
  beam.position.y = 3 + height + 1.8;
  beam.frustumCulled = false;
  beam.renderOrder = 5;
  group.add(beam);

  return { group, beam, lamp };
}

/* -------------------------------------------------------------------------
   Rain: streaks in a box of air that travels with the camera.
   ------------------------------------------------------------------------- */

export type Rain = {
  mesh: THREE.LineSegments<THREE.BufferGeometry, THREE.ShaderMaterial>;
  uniforms: Record<string, THREE.IUniform>;
};

export function createRain(count: number): Rain {
  const positions = new Float32Array(count * 6);
  const ends = new Float32Array(count * 2);
  const seeds = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = Math.random();
    const y = Math.random();
    const z = Math.random();
    positions.set([x, y, z, x, y, z], i * 6);
    ends.set([0, 1], i * 2);
    const seed = Math.random();
    seeds.set([seed, seed], i * 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aEnd", new THREE.BufferAttribute(ends, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const uniforms: Record<string, THREE.IUniform> = {
    uTime: { value: 0 },
    uAmount: { value: 0 },
    uColour: { value: new THREE.Vector3(1, 1, 1) },
    uBox: { value: new THREE.Vector3(34, 26, 34) },
    uWind: { value: new THREE.Vector3(-5, -12, 1.5) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      attribute float aEnd;
      attribute float aSeed;
      uniform float uTime;
      uniform vec3 uBox;
      uniform vec3 uWind;
      varying float vAlpha;
      varying float vSeed;
      void main() {
        // Each drop falls along the wind and wraps round a box centred on
        // the camera, so the rain is always wherever you are looking.
        vec3 fall = uWind * (0.8 + 0.4 * aSeed);
        vec3 p = position * uBox + fall * (uTime + aSeed * 30.0);
        p = mod(p, uBox) - 0.5 * uBox;
        // The streak is the distance a drop travels during one exposure.
        p -= fall * 0.07 * aEnd;
        vec3 world = cameraPosition + p;
        vec4 mv = viewMatrix * vec4(world, 1.0);
        vAlpha = (1.0 - aEnd) * smoothstep(uBox.z * 0.5, uBox.z * 0.2, -mv.z) * smoothstep(0.5, 2.5, -mv.z);
        vSeed = aSeed;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform vec3 uColour;
      uniform float uAmount;
      varying float vAlpha;
      varying float vSeed;
      void main() {
        if (vSeed > uAmount) discard;
        gl_FragColor = vec4(uColour * vAlpha, 1.0);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.LineSegments(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}
