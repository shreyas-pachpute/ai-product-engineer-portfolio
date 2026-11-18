import * as THREE from "three";

/**
 * Materials for the world.
 *
 * Every material here writes TWO outputs per pixel:
 *
 *   location 0  the colour
 *   location 1  an "ink id": rgb identifies which region of the drawing
 *               this pixel belongs to, alpha is how strongly that region
 *               should be outlined
 *
 * The outlines themselves are not drawn here. A single post pass
 * (post.ts) looks at the id buffer and inks a line wherever neighbouring
 * pixels belong to different regions. That is what makes a boat, a
 * lighthouse, a cloud and a wave read as one illustration by one hand:
 * they are all outlined by the same pass, at the same weight, in the same
 * colour — none of them carries its own outline geometry.
 *
 * Shading is two flat tones, lit and shaded, split by a hard threshold.
 * There is no gradient across a face and no specular: a face is either in
 * the light or it is not, which is how a flat illustration is coloured.
 */

/** Uniforms shared by reference across every material, written once per frame. */
export const shared = {
  uTime: { value: 0 },
  /** Wave height multiplier. 0 is a flat sheet. */
  uSwell: { value: 1 },
  uLightDir: { value: new THREE.Vector3(0.5, 0.7, 0.4).normalize() },
  uShade: { value: new THREE.Vector3(0.6, 0.6, 0.75) },
  uAmbient: { value: new THREE.Vector3(1, 1, 1) },
  uHaze: { value: new THREE.Vector3(1, 0.8, 0.6) },
  uHazeNear: { value: 26 },
  uHazeFar: { value: 150 },
};

const TOON_VERTEX = /* glsl */ `
attribute vec3 aColor;
attribute vec3 aInk;

varying vec3 vColor;
varying vec3 vInk;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vLocal;

void main() {
  vColor = aColor;
  vInk = aInk;
  vLocal = position;
  // World-space normal. Objects are only ever scaled uniformly, so the
  // model matrix's upper 3x3 is enough.
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const TOON_FRAGMENT = /* glsl */ `
layout(location = 0) out highp vec4 pc_fragColor;
layout(location = 1) out highp vec4 gInk;

uniform vec3 uLightDir;
uniform vec3 uShade;
uniform vec3 uAmbient;
uniform vec3 uHaze;
uniform float uHazeNear;
uniform float uHazeFar;
uniform float uOpacity;
uniform float uWipe;
uniform float uGlow;

varying vec3 vColor;
varying vec3 vInk;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vLocal;

void main() {
  // Construction wipe: nothing past this point along the object's length
  // has been built yet.
  if (vLocal.x > uWipe) discard;
  if (uOpacity < 0.02) discard;

  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;

  float lit = smoothstep(-0.02, 0.05, dot(n, uLightDir));
  vec3 col = mix(vColor * uShade, vColor, lit) * uAmbient;
  // Emissive things (a lamp, a beam) ignore the light and the ambient.
  col = mix(col, vColor, uGlow);

  float haze = smoothstep(uHazeNear, uHazeFar, distance(vWorld, cameraPosition));
  col = mix(col, uHaze, haze * (1.0 - uGlow));

  pc_fragColor = vec4(col, 1.0);
  gInk = vec4(vInk, (1.0 - haze * 0.85) * uOpacity);
}
`;

export type ToonMaterial = THREE.ShaderMaterial & {
  uniforms: {
    uOpacity: { value: number };
    uWipe: { value: number };
    uGlow: { value: number };
  } & typeof shared;
};

/** A flat two-tone material for solid objects. */
export function createToonMaterial(
  options: { doubleSided?: boolean; glow?: number } = {},
): ToonMaterial {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: TOON_VERTEX,
    fragmentShader: TOON_FRAGMENT,
    side: options.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    uniforms: {
      ...shared,
      uOpacity: { value: 1 },
      // Far beyond any model's extent: no wipe unless a caller sets one.
      uWipe: { value: 1e6 },
      uGlow: { value: options.glow ?? 0 },
    },
  }) as ToonMaterial;
}

/* -------------------------------------------------------------------------
 * Geometry helper
 *
 * Models are assembled from flat-shaded parts. Each part has one colour and
 * one or more ink ids; `InkBuilder` accumulates them into a single
 * non-indexed geometry (so every triangle keeps its own face normal) with
 * the `aColor` / `aInk` attributes the toon material expects.
 * ---------------------------------------------------------------------- */

type Vec3 = readonly [number, number, number];

let inkCounter = 0;

/**
 * A fresh, well-separated id colour. Consecutive ids are spread with the
 * golden ratio so two regions that happen to be created back to back
 * (and so are probably neighbours on screen) never get similar values —
 * the outline pass thresholds on the *difference* between ids.
 */
export function nextInk(): Vec3 {
  inkCounter += 1;
  const a = (inkCounter * 0.61803398875) % 1;
  const b = (inkCounter * 0.38196601125 + 0.33) % 1;
  const c = (inkCounter * 0.7548776662 + 0.67) % 1;
  return [0.15 + a * 0.85, 0.15 + b * 0.85, 0.15 + c * 0.85];
}

export class InkBuilder {
  private readonly positions: number[] = [];
  private readonly colors: number[] = [];
  private readonly inks: number[] = [];

  /** One triangle, counter-clockwise when seen from outside. */
  tri(a: Vec3, b: Vec3, c: Vec3, color: Vec3, ink: Vec3): this {
    this.positions.push(...a, ...b, ...c);
    for (let i = 0; i < 3; i++) {
      this.colors.push(...color);
      this.inks.push(...ink);
    }
    return this;
  }

  /** A flat quad (a, b, c, d in order around the face). */
  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: Vec3, ink: Vec3): this {
    return this.tri(a, b, c, color, ink).tri(a, c, d, color, ink);
  }

  /**
   * Appends an existing geometry (a box, a cylinder, a lathe…) with one
   * colour. `ink` is either one id for the whole part — only its
   * silhouette is outlined — or "faces", which gives every flat facet its
   * own id so its creases are outlined too.
   */
  add(
    geometry: THREE.BufferGeometry,
    color: Vec3,
    ink: Vec3 | "faces",
    matrix?: THREE.Matrix4,
  ): this {
    const flat = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    if (matrix) flat.applyMatrix4(matrix);
    const position = flat.getAttribute("position");

    const facetInk = new Map<string, Vec3>();
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const normal = new THREE.Vector3();

    for (let i = 0; i < position.count; i += 3) {
      a.fromBufferAttribute(position, i);
      b.fromBufferAttribute(position, i + 1);
      c.fromBufferAttribute(position, i + 2);

      let id: Vec3;
      if (ink === "faces") {
        // Triangles that share a plane are one facet: key by the plane.
        normal.subVectors(b, a).cross(c.clone().sub(a)).normalize();
        const offset = normal.dot(a);
        const key = `${normal.x.toFixed(2)},${normal.y.toFixed(2)},${normal.z.toFixed(2)},${offset.toFixed(2)}`;
        id = facetInk.get(key) ?? nextInk();
        facetInk.set(key, id);
      } else {
        id = ink;
      }

      this.positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      for (let k = 0; k < 3; k++) {
        this.colors.push(...color);
        this.inks.push(...id);
      }
    }

    flat.dispose();
    geometry.dispose();
    return this;
  }

  /**
   * `smooth` keeps a part's own vertex normals averaged (for hulls and
   * sails, which should shade as one curved surface); otherwise every
   * triangle gets its face normal.
   */
  build(smooth = false): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.positions, 3),
    );
    geometry.setAttribute(
      "aColor",
      new THREE.Float32BufferAttribute(this.colors, 3),
    );
    geometry.setAttribute(
      "aInk",
      new THREE.Float32BufferAttribute(this.inks, 3),
    );
    if (smooth) {
      // Merge by position so shared vertices average their normals, then
      // split again: the toon shader needs per-vertex colour and ink.
      geometry.computeVertexNormals();
      smoothNormals(geometry);
    } else {
      geometry.computeVertexNormals();
    }
    geometry.computeBoundingSphere();
    return geometry;
  }
}

/** Averages normals across vertices that share a position. */
function smoothNormals(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const sums = new Map<string, THREE.Vector3>();
  const keyOf = (i: number) =>
    `${position.getX(i).toFixed(3)},${position.getY(i).toFixed(3)},${position.getZ(i).toFixed(3)}`;
  const n = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    n.fromBufferAttribute(normal, i);
    const key = keyOf(i);
    const sum = sums.get(key);
    if (sum) sum.add(n);
    else sums.set(key, n.clone());
  }
  for (let i = 0; i < position.count; i++) {
    const sum = sums.get(keyOf(i));
    if (!sum) continue;
    n.copy(sum).normalize();
    normal.setXYZ(i, n.x, n.y, n.z);
  }
  normal.needsUpdate = true;
}
