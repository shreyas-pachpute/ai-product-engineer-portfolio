import * as THREE from "three";
import { ATMOSPHERE_GLSL } from "./atmosphere";
import {
  MAX_WAVES,
  WAVES_GLSL,
  WAVES_SLOPE_GLSL,
  WAVE_FREQUENCY_STEP,
} from "./waves";

/**
 * The sea.
 *
 * GEOMETRY
 * One mesh, centred under the camera and laid out in rings whose radius
 * grows geometrically: a few millimetres apart at the lens, kilometres
 * apart at the horizon. Every vertex therefore covers about the same
 * amount of screen, whether the camera is a hand's width above a paper
 * boat or fifty metres from a ship, and the same mesh serves both. The
 * vertex shader lifts each vertex to the wave height at its position.
 *
 * SHADING
 * Water has almost no colour of its own. What you see is:
 *
 *   - the sky, mirrored — weakly looking straight down, almost completely
 *     at a glancing angle (Fresnel). The reflection reads the same
 *     atmosphere and the same clouds the sky is drawn from;
 *   - the sun (or moon), reflected off whichever wave facets happen to
 *     point the right way: the glitter path;
 *   - a little light that went in and scattered back out, blue-green, and
 *     brighter through the thin tops of waves between you and the sun;
 *   - foam, where the surface breaks or a hull disturbs it.
 *
 * The surface normal is computed per pixel from the wave function itself,
 * using only the waves big enough to see at that distance. The ones too
 * small to resolve are not thrown away — they widen the highlight instead
 * — which is what stops distant water from sparkling like noise.
 */

const VERTEX = /* glsl */ `
${WAVES_GLSL}
uniform float uRMin;
uniform float uRMax;
uniform float uSpacing;
uniform int uGeoIterations;
varying vec3 vWorld;

void main() {
  // position.x: which ring (0 at the centre, 1 at the horizon); .y: angle.
  float r = position.x <= 0.0 ? 0.0 : uRMin * pow(uRMax / uRMin, position.x);
  float a = position.y * 6.28318530718;
  vec2 xz = cameraPosition.xz + r * vec2(cos(a), sin(a));
  // Leave out waves shorter than the mesh can represent out here.
  float visible = floor(log(uSeaLength / max(2.5 * r * uSpacing, 1e-5)) / log(${WAVE_FREQUENCY_STEP}));
  int iterations = int(clamp(visible, 0.0, float(uGeoIterations)));
  float h = seaHeight(xz, iterations);
  vWorld = vec3(xz.x, h, xz.y);
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
${ATMOSPHERE_GLSL}
${WAVES_GLSL}
${WAVES_SLOPE_GLSL}

uniform sampler2D tSky;
uniform sampler2D tClouds;
uniform sampler2D tMirror;
uniform mat4 uMirrorMatrix;
uniform float uMirror;
uniform mat4 uViewRotation;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uMieColor;
uniform vec3 uAmbient;
uniform vec3 uCloudAmbient;
uniform float uCloudCover;
uniform float uLightVisible;
uniform vec3 uWaterColor;
uniform vec3 uGlowColor;
uniform float uFoam;
uniform float uFoamLevel;
uniform float uRain;
uniform float uFogDensity;
uniform vec3 uFogColor;
uniform float uFogSky;
uniform float uPixelAngle;
uniform int uNormIterations;
uniform vec4 uHull;
uniform vec4 uHullSize;
uniform vec4 uRipples[3];
uniform float uTime;
varying vec3 vWorld;

vec3 atmosphere(vec3 dir) {
  vec4 lut = texture2D(tSky, skyUv(dir));
  return lut.rgb + lut.a * uMieColor * miePhase(dot(dir, uLightDir));
}

float hash21(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

/* Bubbly, cellular breakup for foam. */
float foamPattern(vec2 p) {
  float n = noise2(p) * 0.5 + noise2(p * 2.3 + 7.1) * 0.3 + noise2(p * 5.1 - 3.7) * 0.2;
  float cells = abs(noise2(p * 3.0 + 11.0) - 0.5) * 2.0;
  return n * 0.65 + (1.0 - cells) * 0.35;
}

void main() {
  vec3 toEye = cameraPosition - vWorld;
  float dist = length(toEye);
  vec3 V = toEye / dist;

  // How much water one pixel covers here, in metres.
  float footprint = dist * uPixelAngle / max(V.y, 0.06);
  float resolvable = floor(log(uSeaLength / (2.0 * footprint)) / log(${WAVE_FREQUENCY_STEP}));
  int iterations = int(clamp(resolvable, 3.0, float(uNormIterations)));
  vec3 surface = seaSurface(vWorld.xz, iterations);
  vec3 N = normalize(vec3(-surface.y, 1.0, -surface.z));

  // Waves too small to draw at this distance become roughness instead.
  float lost = clamp(1.0 - (resolvable - 3.0) / (float(uNormIterations) - 3.0), 0.0, 1.0);
  float roughness = mix(0.03, 0.26, lost * lost) + uRain * 0.06;
  N = normalize(mix(N, vec3(0.0, 1.0, 0.0), lost * 0.6));

  // Rain: rings too small to model, so they simply break the surface up.
  if (uRain > 0.01) {
    vec2 rp = vWorld.xz * 3.1;
    vec2 jitter = vec2(noise2(rp + uTime * 3.0), noise2(rp * 1.3 - uTime * 2.7)) - 0.5;
    N = normalize(N + vec3(jitter.x, 0.0, jitter.y) * 0.22 * uRain * (1.0 - lost));
  }

  // Rings spreading from where something small broke the surface (a paper
  // boat going under). Each is (x, z, age in seconds, strength): a short
  // packet of ripples a few centimetres long, moving out at the speed
  // ripples that size travel, widening and dying as it goes.
  float bubbles = 0.0;
  float fine = clamp(1.0 - footprint * 70.0, 0.0, 1.0);
  for (int i = 0; i < 3; i++) {
    vec4 ring = uRipples[i];
    if (ring.w > 0.001 && fine > 0.0) {
      vec2 away = vWorld.xz - ring.xy;
      float r = length(away) + 1e-4;
      float front = ring.z * 0.26;
      float width = 0.03 + ring.z * 0.05;
      float packet = exp(-pow((r - front) / width, 2.0));
      float slope = cos((r - front) * 150.0) * packet * ring.w * 0.6 / (1.0 + ring.z * 1.5);
      N.xz += away / r * slope * fine;
      bubbles = max(bubbles, ring.w * smoothstep(0.075, 0.0, r) * exp(-ring.z * 2.0));
    }
  }
  N = normalize(N);

  float NdotV = max(dot(N, V), 0.0);
  float fresnel = 0.02 + 0.98 * pow(1.0 - NdotV, 5.0);
  fresnel *= 1.0 - roughness * 1.4;

  /* Reflection: the sky, then the clouds in front of it. */
  vec3 R = reflect(-V, N);
  R.y = abs(R.y) + 0.002;
  R = normalize(R);
  vec3 reflection = atmosphere(R);
  // Find the reflected direction on screen, to pick up the clouds drawn there.
  vec4 clip = uViewRotation * vec4(R, 0.0);
  vec2 suv = clip.xy / max(clip.w, 1e-4) * 0.5 + 0.5;
  vec2 edge = smoothstep(vec2(0.0), vec2(0.08), suv) * smoothstep(vec2(0.0), vec2(0.08), 1.0 - suv);
  float onScreen = step(0.0, clip.w) * edge.x * edge.y;
  vec4 clouds = mix(
    vec4(uCloudAmbient * uCloudCover, 1.0 - uCloudCover * 0.92),
    texture2D(tClouds, suv),
    onScreen
  );
  reflection = reflection * clouds.a + clouds.rgb;

  // The ship, mirrored (drawn separately into its own small buffer).
  if (uMirror > 0.5) {
    vec4 mp = uMirrorMatrix * vec4(vWorld.x, 0.0, vWorld.z, 1.0);
    // The waves bend the image: mostly along the line of sight, which is
    // what stretches a reflection into a wavering column.
    vec2 muv = mp.xy / mp.w + N.xz * vec2(0.035, 0.11) * (1.0 - lost);
    vec4 mirror = textureLod(tMirror, muv, 0.0);
    reflection = mix(reflection, mirror.rgb, mirror.a * (1.0 - lost * 0.7));
  }

  /* The light itself, off the facets that face the right way. */
  vec3 L = uLightDir;
  vec3 H = normalize(V + L);
  float NdotH = max(dot(N, H), 0.0);
  float alpha = max(roughness * roughness, 0.0005);
  float denom = NdotH * NdotH * (alpha * alpha - 1.0) + 1.0;
  float D = alpha * alpha / (ATM_PI * denom * denom);
  float VdotH = max(dot(V, H), 0.0);
  float specF = 0.02 + 0.98 * pow(1.0 - VdotH, 5.0);
  float spec = min(D * specF * 0.25 / max(VdotH * VdotH, 0.05), 3000.0);
  vec3 glitter = uLightColor * spec * max(dot(N, L), 0.0) * uLightVisible;

  /* Light that entered the water and came back. */
  float lightIn = max(L.y, 0.0) * uLightVisible;
  vec3 body = uWaterColor / ATM_PI * (uAmbient + uLightColor * lightIn);
  // ...and more of it through thin crests that stand between eye and light.
  vec3 flatL = normalize(vec3(L.x, 0.0, L.z) + 1e-5);
  float toward = pow(max(dot(-V, flatL), 0.0), 3.0);
  float crest = smoothstep(-0.15, 0.55, vWorld.y / max(uSeaHeight, 1e-5));
  body += uGlowColor * uLightColor * (toward * crest * (1.0 - L.y) * 0.09 * uLightVisible);

  vec3 colour = mix(body, reflection, clamp(fresnel, 0.0, 1.0)) + glitter;

  /* Foam: on breaking crests, and where the hull works the water. */
  float level = vWorld.y / max(uSeaHeight, 1e-5) + 0.465;
  vec2 fp = vWorld.xz * (22.0 / uSeaLength) + vec2(uTime * 0.03, -uTime * 0.02);
  float pattern = foamPattern(fp);
  float foam = smoothstep(uFoamLevel, uFoamLevel + 0.22, level + (pattern - 0.5) * 0.5) * uFoam;
  // Air that went down with the paper, coming back up.
  if (bubbles > 0.002) {
    foam = max(foam, bubbles * (0.35 + 0.65 * foamPattern(vWorld.xz * 60.0 + uTime * 0.4)));
  }

  if (uHull.w > 0.0) {
    // Ship-local position: x along the hull (bow forward), z across it.
    vec2 rel = vWorld.xz - uHull.xy;
    float c = cos(uHull.z);
    float s = sin(uHull.z);
    vec2 local = vec2(rel.x * c + rel.y * s, -rel.x * s + rel.y * c);
    float along = local.x / uHullSize.x;
    float across = local.y / uHullSize.y;
    // A ring of worked water round the hull.
    float hullDistance = length(vec2(along, across));
    float contact = smoothstep(1.55, 1.0, hullDistance) * smoothstep(0.78, 1.0, hullDistance);
    foam = max(foam, contact * (0.45 + 0.55 * pattern) * uHull.w);
    // The wake: a churned band astern that widens and fades.
    float astern = -local.x - uHullSize.x * 0.8;
    if (astern > 0.0 && uHullSize.z > 0.0) {
      float width = uHullSize.y * (0.9 + astern / (uHullSize.x * 1.6));
      float band = smoothstep(width, width * 0.35, abs(local.y));
      float fade = exp(-astern / (uHullSize.x * 7.0));
      float churn = foamPattern(vec2(local.x * 0.35 + uTime * 0.6, local.y * 0.5));
      foam = max(foam, band * fade * smoothstep(0.25, 0.75, churn) * uHullSize.z);
      // ...and the two arms of the bow wave.
      float arm = abs(abs(local.y) - (astern + uHullSize.x * 1.8) * 0.33);
      foam = max(foam, smoothstep(uHullSize.y * 0.5, 0.0, arm) * fade * 0.5 * pattern * uHullSize.z);
    }
  }

  vec3 foamColour = vec3(0.86, 0.9, 0.92) / ATM_PI *
    (uAmbient + uLightColor * (0.35 + 0.65 * max(dot(N, L), 0.0)) * uLightVisible);
  colour = mix(colour, foamColour, clamp(foam, 0.0, 1.0));

  /* Distance: everything fades to the colour of the air at the horizon. */
  float fog = 1.0 - exp(-dist * uFogDensity);
  vec3 horizon = atmosphere(normalize(vec3(-V.x, 0.015, -V.z)));
  horizon = mix(horizon, uFogColor, uFogSky);
  colour = mix(colour, horizon, fog);

  gl_FragColor = vec4(colour, 1.0);
}
`;

export type Ocean = {
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
};

export function createOcean(rings: number, segments: number): Ocean {
  // A grid in (ring, angle) space; the vertex shader bends it into a disc.
  const positions = new Float32Array((rings + 1) * (segments + 1) * 3);
  let p = 0;
  for (let r = 0; r <= rings; r++) {
    for (let s = 0; s <= segments; s++) {
      positions[p++] = r / rings;
      positions[p++] = s / segments;
      positions[p++] = 0;
    }
  }
  const indices = new Uint32Array(rings * segments * 6);
  let i = 0;
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * (segments + 1) + s;
      const b = a + segments + 1;
      indices[i++] = a;
      indices[i++] = b;
      indices[i++] = a + 1;
      indices[i++] = a + 1;
      indices[i++] = b;
      indices[i++] = b + 1;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  const uniforms: Record<string, THREE.IUniform> = {
    uWaves: { value: new Float32Array(MAX_WAVES * 4) },
    uSeaK: { value: 1 },
    uSeaLength: { value: 1 },
    uSeaHeight: { value: 0.02 },
    uRMin: { value: 0.01 },
    uRMax: { value: 4000 },
    uSpacing: { value: (2 * Math.PI) / segments },
    uGeoIterations: { value: 12 },
    uNormIterations: { value: 24 },
    tSky: { value: null },
    tClouds: { value: null },
    tMirror: { value: null },
    uMirrorMatrix: { value: new THREE.Matrix4() },
    uMirror: { value: 0 },
    uViewRotation: { value: new THREE.Matrix4() },
    uLightDir: { value: new THREE.Vector3(0, 1, 0) },
    uLightColor: { value: new THREE.Vector3(1, 1, 1) },
    uMieColor: { value: new THREE.Vector3(1, 1, 1) },
    uAmbient: { value: new THREE.Vector3(1, 1, 1) },
    uCloudAmbient: { value: new THREE.Vector3(1, 1, 1) },
    uCloudCover: { value: 0 },
    uLightVisible: { value: 1 },
    uWaterColor: { value: new THREE.Vector3(0.012, 0.05, 0.065) },
    uGlowColor: { value: new THREE.Vector3(0.05, 0.6, 0.5) },
    uFoam: { value: 0 },
    uFoamLevel: { value: 0.8 },
    uRain: { value: 0 },
    uFogDensity: { value: 0.00004 },
    uFogColor: { value: new THREE.Vector3(1, 1, 1) },
    uFogSky: { value: 0 },
    uPixelAngle: { value: 0.001 },
    uHull: { value: new THREE.Vector4(0, 0, 0, 0) },
    uHullSize: { value: new THREE.Vector4(15, 4, 0, 0) },
    uRipples: {
      value: [
        new THREE.Vector4(0, 0, 0, 0),
        new THREE.Vector4(0, 0, 0, 0),
        new THREE.Vector4(0, 0, 0, 0),
      ],
    },
    uTime: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  return { mesh, uniforms };
}
