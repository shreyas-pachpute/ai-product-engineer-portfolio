import * as THREE from "three";
import { ATMOSPHERE_GLSL } from "./atmosphere";

/**
 * The sky dome: what is drawn behind everything.
 *
 * Per pixel it works out which direction the camera is looking, reads the
 * colour of the air in that direction from the atmosphere lookup, adds the
 * haze's glow round the light, draws the disc of the sun or moon and (at
 * night) the stars, and finally lays the clouds over all of it.
 */

const VERTEX = /* glsl */ `
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
${ATMOSPHERE_GLSL}
uniform sampler2D tSky;
uniform sampler2D tClouds;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamForward;
uniform vec2 uTan;
uniform vec2 uResolution;
uniform vec3 uLightDir;
uniform vec3 uMieColor;
uniform vec3 uDiscColor;
uniform float uDiscCos;
uniform float uMoon;
uniform float uStars;
uniform vec3 uFogColor;
uniform float uFogSky;
uniform float uTime;
varying vec2 vNdc;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec3 dir = normalize(uCamForward + uCamRight * vNdc.x * uTan.x + uCamUp * vNdc.y * uTan.y);
  // Below the horizon the sea covers the dome; keep the colour continuous.
  vec3 up = normalize(vec3(dir.x, max(dir.y, 0.0), dir.z));

  vec4 lut = texture2D(tSky, skyUv(up));
  float cosTheta = dot(dir, uLightDir);
  vec3 colour = lut.rgb + lut.a * uMieColor * miePhase(cosTheta);

  // Stars: one per cell of a fine grid on the sphere, most cells empty.
  if (uStars > 0.001) {
    vec3 cell = dir * 190.0;
    vec3 id = floor(cell);
    float seed = hash13(id);
    float size = length(fract(cell) - 0.5);
    float star = step(0.992, seed) * smoothstep(0.32, 0.0, size);
    float twinkle = 0.75 + 0.25 * sin(uTime * (1.5 + seed * 3.0) + seed * 40.0);
    colour += vec3(0.9, 0.95, 1.0) * star * twinkle * uStars * (0.3 + 4.0 * fract(seed * 91.7));
  }

  // The disc of the sun or moon, with a soft edge one pixel wide.
  float edge = fwidth(cosTheta) + 1e-7;
  float disc = smoothstep(uDiscCos - edge, uDiscCos + edge, cosTheta);
  if (disc > 0.0) {
    // The moon is a lit ball, not a lamp: darker toward the limb and mottled.
    float limb = clamp((cosTheta - uDiscCos) / (1.0 - uDiscCos), 0.0, 1.0);
    float mottle = 0.78 + 0.22 * hash13(floor(dir * 2600.0));
    float shade = mix(0.72 + 0.28 * sqrt(limb), (0.6 + 0.4 * sqrt(limb)) * mottle, uMoon);
    colour += uDiscColor * disc * shade;
  }

  // Thick fog replaces the sky near the horizon.
  float low = 1.0 - smoothstep(0.0, 0.5, up.y);
  colour = mix(colour, uFogColor, uFogSky * mix(0.55, 1.0, low));

  // The cloud buffer is half size; four taps round each pixel hide both
  // the upscale and what is left of the sampling pattern.
  vec2 cuv = gl_FragCoord.xy / uResolution;
  vec2 ct = 1.5 / uResolution;
  vec4 clouds = 0.25 * (
    texture2D(tClouds, cuv + vec2(-ct.x, -ct.y)) + texture2D(tClouds, cuv + vec2(ct.x, -ct.y)) +
    texture2D(tClouds, cuv + vec2(-ct.x, ct.y)) + texture2D(tClouds, cuv + vec2(ct.x, ct.y)));
  colour = colour * mix(1.0, clouds.a, 1.0 - uFogSky * 0.85) + clouds.rgb * (1.0 - uFogSky * 0.85);

  gl_FragColor = vec4(colour, 1.0);
}
`;

export type Sky = {
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
};

export function createSky(): Sky {
  const uniforms: Record<string, THREE.IUniform> = {
    tSky: { value: null },
    tClouds: { value: null },
    uCamRight: { value: new THREE.Vector3() },
    uCamUp: { value: new THREE.Vector3() },
    uCamForward: { value: new THREE.Vector3() },
    uTan: { value: new THREE.Vector2() },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uLightDir: { value: new THREE.Vector3(0, 1, 0) },
    uMieColor: { value: new THREE.Vector3(1, 1, 1) },
    uDiscColor: { value: new THREE.Vector3(1, 1, 1) },
    uDiscCos: { value: Math.cos((0.27 * Math.PI) / 180) },
    uMoon: { value: 0 },
    uStars: { value: 0 },
    uFogColor: { value: new THREE.Vector3(1, 1, 1) },
    uFogSky: { value: 0 },
    uTime: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });
  // One triangle that covers the screen.
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
      3,
    ),
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}
