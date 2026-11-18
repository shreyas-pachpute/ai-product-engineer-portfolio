import * as THREE from "three";
import { shared } from "./materials";
import { WAVE_GLSL } from "./waves";

/**
 * Sky and sea — the two surfaces that fill every frame.
 *
 * Both are procedural: there is no texture, no image and no model file in
 * either. The sky is a gradient with a flat sun and hard-edged clouds cut
 * from noise; the sea is a displaced plane coloured in flat bands by wave
 * height. Each band, the sun and each cloud carry their own ink id, so the
 * look pass outlines them exactly as it outlines the boats — which is what
 * turns "wave height" into the contour linework of a woodblock sea.
 */

const NOISE_GLSL = /* glsl */ `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}
`;

/* ------------------------------------------------------------------ sky */

const SKY_VERTEX = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  // Rotation only: the dome is centred on the camera and never translates,
  // so it reads as infinitely far away.
  vec4 view = viewMatrix * vec4(position, 0.0);
  gl_Position = projectionMatrix * vec4(view.xyz, 1.0);
  gl_Position.z = gl_Position.w; // pinned to the far plane
}
`;

const SKY_FRAGMENT = /* glsl */ `
layout(location = 0) out highp vec4 pc_fragColor;
layout(location = 1) out highp vec4 gInk;

uniform vec3 uSkyTop;
uniform vec3 uSkyHorizon;
uniform vec3 uSun;
uniform vec3 uSunHalo;
uniform vec3 uCloud;
uniform vec3 uCloudShade;
uniform vec3 uSunDir;
uniform float uSunSize;
uniform float uClouds;
uniform float uStars;
uniform float uTime;

varying vec3 vDir;

${NOISE_GLSL}

void main() {
  vec3 dir = normalize(vDir);
  float elevation = dir.y;

  vec3 col = mix(uSkyHorizon, uSkyTop, pow(smoothstep(-0.03, 0.72, elevation), 0.85));
  vec3 ink = vec3(0.0);
  float inkStrength = 0.0;

  // Stars, for the night chapter. A sparse grid of single points.
  if (uStars > 0.01) {
    vec2 grid = dir.xz / (abs(dir.y) + 0.35) * 46.0;
    vec2 cell = floor(grid);
    float seed = hash21(cell);
    vec2 offset = vec2(hash21(cell + 3.1), hash21(cell + 7.7)) - 0.5;
    float star = smoothstep(0.09, 0.02, length(fract(grid) - 0.5 - offset * 0.6));
    col = mix(col, vec3(0.93, 0.97, 1.0), star * step(0.86, seed) * uStars * smoothstep(0.02, 0.25, elevation));
  }

  // The sun: a flat disc and one flat halo ring. No glow, no gradient.
  float toSun = dot(dir, normalize(uSunDir));
  float halo = smoothstep(1.0 - uSunSize * 2.3, 1.0 - uSunSize * 2.3 + 0.0012, toSun);
  float disc = smoothstep(1.0 - uSunSize, 1.0 - uSunSize + 0.0009, toSun);
  col = mix(col, uSunHalo, halo * 0.55);
  col = mix(col, uSun, disc);
  ink = mix(ink, vec3(0.9, 0.2, 0.4), halo);
  ink = mix(ink, vec3(0.2, 0.9, 0.6), disc);
  inkStrength = max(inkStrength, max(halo * 0.28, disc * 0.6));

  // Clouds: noise on a plane overhead, cut with a hard threshold.
  if (uClouds > 0.01 && elevation > 0.015) {
    vec2 p = dir.xz / (elevation + 0.16) * 0.62 + vec2(uTime * 0.006, 0.0);
    float n = fbm(p);
    float band = smoothstep(0.02, 0.12, elevation) * (1.0 - smoothstep(0.42, 0.7, elevation));
    float threshold = mix(0.74, 0.5, uClouds);
    float mask = step(threshold, n) * band;
    // The underside of each cloud is the same noise sampled a little lower.
    float under = step(threshold + 0.065, n);
    col = mix(col, mix(uCloudShade, uCloud, under), mask);
    ink = mix(ink, mix(vec3(0.5, 0.75, 0.2), vec3(0.75, 0.3, 0.85), under), mask);
    inkStrength = max(inkStrength, mask * 0.5);
  }

  pc_fragColor = vec4(col, 1.0);
  gInk = vec4(ink, inkStrength);
}
`;

export type SkyUniforms = {
  uSkyTop: { value: THREE.Vector3 };
  uSkyHorizon: { value: THREE.Vector3 };
  uSun: { value: THREE.Vector3 };
  uSunHalo: { value: THREE.Vector3 };
  uCloud: { value: THREE.Vector3 };
  uCloudShade: { value: THREE.Vector3 };
  uSunDir: { value: THREE.Vector3 };
  uSunSize: { value: number };
  uClouds: { value: number };
  uStars: { value: number };
};

export function createSky(): {
  mesh: THREE.Mesh;
  uniforms: SkyUniforms;
} {
  const uniforms: SkyUniforms = {
    uSkyTop: { value: new THREE.Vector3() },
    uSkyHorizon: { value: new THREE.Vector3() },
    uSun: { value: new THREE.Vector3() },
    uSunHalo: { value: new THREE.Vector3() },
    uCloud: { value: new THREE.Vector3() },
    uCloudShade: { value: new THREE.Vector3() },
    uSunDir: { value: new THREE.Vector3(0, 0.2, -1) },
    uSunSize: { value: 0.004 },
    uClouds: { value: 0.5 },
    uStars: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: SKY_VERTEX,
    fragmentShader: SKY_FRAGMENT,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: { ...uniforms, uTime: shared.uTime },
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

/* ------------------------------------------------------------------ sea */

const SEA_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uSwell;

varying vec3 vWorld;

${WAVE_GLSL}

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  // Flatten the swell with distance: far-off crests are smaller than a
  // pixel and would only shimmer.
  float calm = 1.0 - smoothstep(55.0, 170.0, distance(world.xz, cameraPosition.xz));
  world.y += waveHeight(world.xz, uTime) * uSwell * calm;
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const SEA_FRAGMENT = /* glsl */ `
layout(location = 0) out highp vec4 pc_fragColor;
layout(location = 1) out highp vec4 gInk;

uniform float uTime;
uniform float uSwell;
uniform vec3 uSeaDeep;
uniform vec3 uSeaMid;
uniform vec3 uSeaLight;
uniform vec3 uSeaFar;
uniform vec3 uFoam;
uniform vec3 uInkColor;
uniform float uPaper;
uniform float uFoamLevel;
uniform vec3 uSunDir;
uniform vec3 uSun;
uniform float uGlitter;
uniform vec4 uWake;      // ship x, z, heading (radians), strength

varying vec3 vWorld;

${WAVE_GLSL}

void main() {
  float dist = distance(vWorld, cameraPosition);
  float far = smoothstep(16.0, 150.0, dist);

  // Height is recomputed per pixel rather than interpolated from the
  // vertices, so the band edges are smooth curves and not polygon edges.
  float h = waveHeight(vWorld.xz, uTime) / WAVE_PEAK * 0.5 + 0.5;

  // Five flat bands, trough to crest. Fewer in the distance, where five
  // would alias into noise.
  float bands = mix(5.0, 2.0, smoothstep(30.0, 110.0, dist));
  float q = clamp(floor(h * bands) / (bands - 1.0), 0.0, 1.0);

  vec3 col = q < 0.5
    ? mix(uSeaDeep, uSeaMid, q * 2.0)
    : mix(uSeaMid, uSeaLight, q * 2.0 - 1.0);

  // Foam caps the highest crests, near the camera only.
  float foam = step(1.0 - uFoamLevel, h) * (1.0 - smoothstep(20.0, 70.0, dist));
  col = mix(col, uFoam, foam);

  // The sun's path on the water: flat dashes where the crests face it.
  vec2 toSun = normalize(uSunDir.xz + vec2(0.0001));
  vec2 view = normalize(vWorld.xz - cameraPosition.xz);
  float path = smoothstep(0.985, 0.9985, dot(view, toSun));
  float dash = step(0.62, h) * step(0.5, fract(vWorld.x * 0.55 + vWorld.z * 0.9 + uTime * 0.25));
  col = mix(col, uSun, path * dash * uGlitter * (1.0 - smoothstep(60.0, 150.0, dist)) * 0.85);

  // Wake: two foam lines spreading astern of the ship.
  float wake = 0.0;
  if (uWake.w > 0.01) {
    vec2 rel = vWorld.xz - uWake.xy;
    float c = cos(-uWake.z);
    float s = sin(-uWake.z);
    vec2 local = vec2(c * rel.x - s * rel.y, s * rel.x + c * rel.y); // +x is ahead of the ship
    float astern = -local.x;
    float spread = astern * 0.26 + 0.25;
    float arm = smoothstep(0.34, 0.0, abs(abs(local.y) - spread));
    wake = arm * smoothstep(0.4, 2.0, astern) * (1.0 - smoothstep(9.0, 26.0, astern)) * uWake.w;
    wake *= step(0.35, fract(astern * 0.6 - uTime * 0.6));
    col = mix(col, uFoam, wake);
  }

  col = mix(col, uSeaFar, far);

  // Drawing board: the sea is a sheet of paper with a drafting grid.
  if (uPaper > 0.001) {
    vec2 g = vWorld.xz;
    vec2 minor = abs(fract(g) - 0.5);
    vec2 major = abs(fract(g / 5.0) - 0.5) * 5.0;
    float w = fwidth(g.x) * 1.2 + 0.004;
    float line = max(
      max(1.0 - smoothstep(0.0, w, 0.5 - minor.x), 1.0 - smoothstep(0.0, w, 0.5 - minor.y)) * 0.1,
      max(1.0 - smoothstep(0.0, w * 1.6, 2.5 - major.x), 1.0 - smoothstep(0.0, w * 1.6, 2.5 - major.y)) * 0.22
    );
    col = mix(col, uInkColor, line * uPaper * (1.0 - smoothstep(14.0, 60.0, dist)));
  }

  // Each band is its own ink region, so the look pass draws the contour
  // between bands. Strength falls off with distance and with the swell —
  // a flat sea has no lines to draw.
  vec3 id = vec3(0.12 + q * 0.62, 0.3 + foam * 0.5, 0.74 - q * 0.3 + wake * 0.2);
  float strength = (1.0 - smoothstep(10.0, 62.0, dist)) * 0.5 * smoothstep(0.0, 0.25, uSwell) * (1.0 - uPaper);

  pc_fragColor = vec4(col, 1.0);
  gInk = vec4(id, strength);
}
`;

export type SeaUniforms = {
  uSeaDeep: { value: THREE.Vector3 };
  uSeaMid: { value: THREE.Vector3 };
  uSeaLight: { value: THREE.Vector3 };
  uSeaFar: { value: THREE.Vector3 };
  uFoam: { value: THREE.Vector3 };
  uInkColor: { value: THREE.Vector3 };
  uSunDir: { value: THREE.Vector3 };
  uSun: { value: THREE.Vector3 };
  uPaper: { value: number };
  uFoamLevel: { value: number };
  uGlitter: { value: number };
  uWake: { value: THREE.Vector4 };
};

export function createSea(segments: number): {
  mesh: THREE.Mesh;
  uniforms: SeaUniforms;
} {
  const uniforms: SeaUniforms = {
    uSeaDeep: { value: new THREE.Vector3() },
    uSeaMid: { value: new THREE.Vector3() },
    uSeaLight: { value: new THREE.Vector3() },
    uSeaFar: { value: new THREE.Vector3() },
    uFoam: { value: new THREE.Vector3() },
    uInkColor: { value: new THREE.Vector3() },
    uSunDir: { value: new THREE.Vector3(0, 0.2, -1) },
    uSun: { value: new THREE.Vector3(1, 1, 1) },
    uPaper: { value: 0 },
    uFoamLevel: { value: 0.1 },
    uGlitter: { value: 1 },
    uWake: { value: new THREE.Vector4(0, 0, 0, 0) },
  };

  const geometry = new THREE.PlaneGeometry(520, 520, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: SEA_VERTEX,
    fragmentShader: SEA_FRAGMENT,
    uniforms: { ...uniforms, uTime: shared.uTime, uSwell: shared.uSwell },
  });

  const mesh = new THREE.Mesh(geometry, material);
  // The plane is displaced in the shader; its CPU-side bounds are a flat
  // sheet and would be culled incorrectly at grazing camera angles.
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}
