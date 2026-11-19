import * as THREE from "three";

/**
 * Film: everything between the 3D scene and the screen.
 *
 * The scene is rendered in physical units, where the sun's reflection is
 * thousands of times brighter than a shadow. A screen can show a range of
 * about a hundred to one. How that range is squeezed is most of what makes
 * an image read as a photograph rather than as computer graphics:
 *
 *   1. Bloom. Very bright things bleed a little light into their
 *      surroundings, as they do in any lens. Done by repeatedly halving
 *      the image and adding the blurred copies back.
 *   2. Exposure, then a film-like tone curve (AgX). Highlights roll off
 *      and lose saturation as they brighten, the way film and eyes do,
 *      instead of clipping to flat patches of pure colour.
 *   3. A light grade: a touch of contrast and a slight colour separation
 *      between shadows and highlights.
 *   4. Vignette, fine grain, and dither (so smooth skies do not band).
 */

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/* Halve the image. The first halving also tames isolated very bright
   pixels, so a single glinting wavelet cannot flicker the whole bloom. */
const DOWN_FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D tInput;
uniform vec2 uTexel;
uniform float uFirst;
varying vec2 vUv;

vec3 tap(vec2 offset) {
  vec3 c = texture2D(tInput, vUv + offset * uTexel).rgb;
  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  return c * mix(1.0, 1.0 / (1.0 + luma * 0.25), uFirst);
}

void main() {
  vec3 c = tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));
  gl_FragColor = vec4(c * 0.25, 1.0);
}
`;

const UP_FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D tInput;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(tInput, vUv + vec2(-1.0, -1.0) * uTexel).rgb
    + texture2D(tInput, vUv + vec2(1.0, -1.0) * uTexel).rgb
    + texture2D(tInput, vUv + vec2(-1.0, 1.0) * uTexel).rgb
    + texture2D(tInput, vUv + vec2(1.0, 1.0) * uTexel).rgb;
  gl_FragColor = vec4(c * 0.25, 1.0);
}
`;

const FINAL_FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform vec2 uResolution;
uniform float uExposure;
uniform float uBloom;
uniform float uTime;
uniform float uGrain;
uniform float uVignette;
uniform vec3 uShadowTint;
uniform vec3 uHighlightTint;
uniform float uContrast;
uniform float uSaturation;
varying vec2 vUv;

/* AgX, as implemented in three.js / Filament (after Troy Sobotka). */
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
  vec3(0.6274, 0.0691, 0.0164),
  vec3(0.3293, 0.9195, 0.0880),
  vec3(0.0433, 0.0113, 0.8956)
);
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
  vec3(1.6605, -0.1246, -0.0182),
  vec3(-0.5876, 1.1329, -0.1006),
  vec3(-0.0728, -0.0083, 1.1187)
);
const mat3 AgXInsetMatrix = mat3(
  vec3(0.856627153315983, 0.137318972929847, 0.11189821299995),
  vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903),
  vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859)
);
const mat3 AgXOutsetMatrix = mat3(
  vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826),
  vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294),
  vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405)
);

vec3 agxContrast(vec3 x) {
  vec3 x2 = x * x;
  vec3 x4 = x2 * x2;
  return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
}

vec3 agx(vec3 colour) {
  const float minEv = -12.47393;
  const float maxEv = 4.026069;
  colour = LINEAR_SRGB_TO_LINEAR_REC2020 * colour;
  colour = AgXInsetMatrix * colour;
  colour = max(colour, 1e-10);
  colour = clamp((log2(colour) - minEv) / (maxEv - minEv), 0.0, 1.0);
  colour = agxContrast(colour);
  colour = AgXOutsetMatrix * colour;
  colour = pow(max(vec3(0.0), colour), vec3(2.2));
  colour = LINEAR_REC2020_TO_LINEAR_SRGB * colour;
  return clamp(colour, 0.0, 1.0);
}

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main() {
  vec3 colour = texture2D(tScene, vUv).rgb;
  colour += texture2D(tBloom, vUv).rgb * uBloom;
  colour = agx(colour * uExposure);

  // Grade, on the display-referred image.
  float luma = dot(colour, vec3(0.2126, 0.7152, 0.0722));
  colour = mix(vec3(luma), colour, uSaturation);
  colour = (colour - 0.5) * uContrast + 0.5;
  colour *= mix(uShadowTint, uHighlightTint, smoothstep(0.0, 1.0, luma));
  colour = max(colour, 0.0);

  vec2 q = vUv - 0.5;
  colour *= 1.0 - uVignette * smoothstep(0.25, 0.95, length(q * vec2(1.0, uResolution.y / uResolution.x * 1.25)) * 1.6);

  // To display encoding.
  colour = mix(colour * 12.92, 1.055 * pow(colour, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, colour));

  // Grain is strongest in the mid-tones, as on film; the last term is a
  // sub-step dither against banding.
  float seed = mod(floor(uTime * 24.0), 61.0);
  float grain = hash12(gl_FragCoord.xy + seed * vec2(37.0, 17.0)) - 0.5;
  float mid = 1.0 - abs(luma * 2.0 - 1.0);
  colour += grain * (uGrain * (0.35 + 0.65 * mid) + 1.0 / 255.0);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;

const LEVELS = 5;

export class Film {
  /** The scene is drawn into this; everything else reads from it. */
  readonly scene: THREE.WebGLRenderTarget;
  private readonly chain: THREE.WebGLRenderTarget[] = [];
  private readonly quadScene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: THREE.Mesh;
  private readonly down: THREE.ShaderMaterial;
  private readonly up: THREE.ShaderMaterial;
  readonly output: THREE.ShaderMaterial;

  constructor(
    samples: number,
    private readonly bloom: boolean,
  ) {
    this.scene = new THREE.WebGLRenderTarget(4, 4, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
      samples,
    });
    for (let i = 0; i < LEVELS; i++) {
      this.chain.push(
        new THREE.WebGLRenderTarget(4, 4, {
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: false,
        }),
      );
    }
    const pass = (
      fragmentShader: string,
      uniforms: Record<string, THREE.IUniform>,
      additive = false,
    ) =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
        blending: additive ? THREE.AdditiveBlending : THREE.NoBlending,
        transparent: additive,
      });
    this.down = pass(DOWN_FRAGMENT, {
      tInput: { value: null },
      uTexel: { value: new THREE.Vector2() },
      uFirst: { value: 0 },
    });
    this.up = pass(
      UP_FRAGMENT,
      { tInput: { value: null }, uTexel: { value: new THREE.Vector2() } },
      true,
    );
    this.output = pass(FINAL_FRAGMENT, {
      tScene: { value: this.scene.texture },
      tBloom: { value: this.chain[0]!.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uExposure: { value: 1 },
      uBloom: { value: 0.05 },
      uTime: { value: 0 },
      uGrain: { value: 0.035 },
      uVignette: { value: 0.28 },
      uShadowTint: { value: new THREE.Vector3(1, 1, 1) },
      uHighlightTint: { value: new THREE.Vector3(1, 1, 1) },
      uContrast: { value: 1.04 },
      uSaturation: { value: 1 },
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.output);
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);
  }

  setSize(width: number, height: number): void {
    this.scene.setSize(width, height);
    this.output.uniforms.uResolution!.value.set(width, height);
    let w = width;
    let h = height;
    for (const target of this.chain) {
      w = Math.max(2, Math.round(w / 2));
      h = Math.max(2, Math.round(h / 2));
      target.setSize(w, h);
    }
  }

  /** Compiles the three passes in the background. */
  compile(renderer: THREE.WebGLRenderer): Promise<unknown> {
    const pending: Promise<unknown>[] = [];
    for (const material of [this.down, this.up, this.output]) {
      this.quad.material = material;
      pending.push(renderer.compileAsync(this.quadScene, this.camera));
    }
    this.quad.material = this.output;
    return Promise.all(pending);
  }

  /** Runs the chain and draws the finished frame to the canvas. */
  render(renderer: THREE.WebGLRenderer): void {
    if (this.bloom) {
      let source: THREE.WebGLRenderTarget = this.scene;
      this.quad.material = this.down;
      for (let i = 0; i < LEVELS; i++) {
        const target = this.chain[i]!;
        this.down.uniforms.tInput!.value = source.texture;
        this.down.uniforms.uTexel!.value.set(
          0.5 / source.width,
          0.5 / source.height,
        );
        this.down.uniforms.uFirst!.value = i === 0 ? 1 : 0;
        renderer.setRenderTarget(target);
        renderer.render(this.quadScene, this.camera);
        source = target;
      }
      // Add each blurred level back into the one above it.
      this.quad.material = this.up;
      const autoClear = renderer.autoClear;
      renderer.autoClear = false;
      for (let i = LEVELS - 1; i > 0; i--) {
        const from = this.chain[i]!;
        this.up.uniforms.tInput!.value = from.texture;
        this.up.uniforms.uTexel!.value.set(0.5 / from.width, 0.5 / from.height);
        renderer.setRenderTarget(this.chain[i - 1]!);
        renderer.render(this.quadScene, this.camera);
      }
      renderer.autoClear = autoClear;
    }
    this.quad.material = this.output;
    renderer.setRenderTarget(null);
    renderer.render(this.quadScene, this.camera);
  }

  dispose(): void {
    this.scene.dispose();
    for (const target of this.chain) target.dispose();
    this.down.dispose();
    this.up.dispose();
    this.output.dispose();
    this.quad.geometry.dispose();
  }
}
