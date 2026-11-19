import * as THREE from "three";

/**
 * Clouds with volume.
 *
 * A cloud here is not a picture of a cloud; it is a density field — a
 * block of 3D noise shaped so that it is hollow in some places and thick
 * in others — and each pixel finds out what it sees by walking a ray
 * through that block and asking, at every step, "how much cloud is here,
 * and how much light reaches it?" That is why they have soft edges, dark
 * bases, bright rims toward the sun, and change correctly when the light
 * moves. The approach is the one from Guerrilla's Horizon Zero Dawn
 * (Schneider, 2015) and Frostbite (Hillaire, 2016), which is also what the
 * serious WebGL implementations use.
 *
 * WHAT MAKES IT AFFORDABLE
 *   - The noise is baked once, on the GPU, into a small 3D texture.
 *   - Rays are walked at half the screen's resolution. Clouds are soft;
 *     nobody can see the difference once it is scaled back up.
 *   - Only a quarter of the pixels are walked each frame. The rest keep
 *     last frame's answer, looked up where that piece of sky was then
 *     (clouds are so far away that only the camera's rotation matters).
 *     Every pixel is refreshed about fifteen times a second, which is far
 *     faster than clouds or daylight change.
 *   - Each walk starts at a slightly different offset and is blended with
 *     the previous answer, so a modest number of steps averages out to a
 *     smooth result instead of visible bands.
 */

const NOISE_SIZE = 96;

const QUAD_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/* Bakes one slice of the noise volume. All four channels tile. */
const NOISE_FRAGMENT = /* glsl */ `
precision highp float;
uniform float uSlice;
varying vec2 vUv;

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

/* Cellular noise: 1 at the middle of a cell, 0 at its walls. */
float worley(vec3 p, float period) {
  p *= period;
  vec3 i = floor(p);
  vec3 f = fract(p);
  float d = 1.0;
  for (int x = -1; x <= 1; x++)
  for (int y = -1; y <= 1; y++)
  for (int z = -1; z <= 1; z++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 r = g + hash33(mod(i + g, period)) - f;
    d = min(d, dot(r, r));
  }
  return 1.0 - sqrt(d);
}

float gradient(vec3 i, vec3 f, float period) {
  vec3 g = hash33(mod(i, period)) * 2.0 - 1.0;
  return dot(normalize(g + 1e-4), f);
}

/* Smooth gradient noise, about -0.6..0.6. */
float perlin(vec3 p, float period) {
  p *= period;
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = gradient(i, f, period);
  float b = gradient(i + vec3(1, 0, 0), f - vec3(1, 0, 0), period);
  float c = gradient(i + vec3(0, 1, 0), f - vec3(0, 1, 0), period);
  float d = gradient(i + vec3(1, 1, 0), f - vec3(1, 1, 0), period);
  float e = gradient(i + vec3(0, 0, 1), f - vec3(0, 0, 1), period);
  float g = gradient(i + vec3(1, 0, 1), f - vec3(1, 0, 1), period);
  float h = gradient(i + vec3(0, 1, 1), f - vec3(0, 1, 1), period);
  float k = gradient(i + vec3(1, 1, 1), f - vec3(1, 1, 1), period);
  return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y), mix(mix(e, g, u.x), mix(h, k, u.x), u.y), u.z);
}

float remap(float v, float a, float b, float c, float d) {
  return c + (v - a) / (b - a) * (d - c);
}

void main() {
  vec3 p = vec3(vUv, uSlice);
  float pf = perlin(p, 4.0) * 0.55 + perlin(p, 8.0) * 0.27 + perlin(p, 16.0) * 0.18;
  pf = clamp(pf * 1.25 + 0.5, 0.0, 1.0);
  float w1 = worley(p, 4.0) * 0.625 + worley(p, 8.0) * 0.25 + worley(p, 16.0) * 0.125;
  float w2 = worley(p, 8.0) * 0.625 + worley(p, 16.0) * 0.25 + worley(p, 32.0) * 0.125;
  float w3 = worley(p, 16.0) * 0.6 + worley(p, 32.0) * 0.4;
  // Billowy base shape: smooth noise with cells pressed into it.
  float base = clamp(remap(pf, 1.0 - w1, 1.0, 0.0, 1.0), 0.0, 1.0);
  gl_FragColor = vec4(base, w2, w3, pf);
}
`;

const MARCH_FRAGMENT = /* glsl */ `
precision highp float;
precision highp sampler3D;

uniform sampler3D tNoise;
uniform sampler2D tHistory;
uniform sampler2D tSky;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamForward;
uniform vec2 uTan;
uniform vec3 uCamPos;
uniform mat4 uPrevViewRotation;
uniform vec2 uResolution;
uniform float uFrame;
uniform float uPhase;
uniform float uBlend;
uniform int uSteps;
uniform float uCover;
uniform float uDensity;
uniform float uBase;
uniform float uTop;
uniform vec3 uWind;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uAmbientTop;
uniform vec3 uAmbientBottom;
uniform vec3 uHaze;
uniform float uFlash;
varying vec2 vUv;

const float PI = 3.14159265359;

float remap(float v, float a, float b, float c, float d) {
  return c + (v - a) / (b - a) * (d - c);
}

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float phaseHG(float c, float g) {
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * PI * pow(1.0 + g2 - 2.0 * g * c, 1.5));
}

/*
 * Every noise lookup below names its mip level explicitly (textureLod).
 * A plain texture() call needs screen-space derivatives, and a shader
 * compiler will not allow those inside a branch or an early-exiting loop:
 * it runs both sides of every branch and every iteration of every loop
 * instead. With explicit levels the skips and early exits are real.
 */

/* How much of the sky is cloud around here: a much larger pattern than
   the clouds themselves decides where it is clear and where it is not. */
float coverAt(vec3 p) {
  float weather = textureLod(tNoise, (p + uWind) / 5200.0 * 0.13 + vec3(0.37, 0.11, 0.73), 0.0).a;
  // Sharpened, so cloud gathers into banks with clear sky between them
  // rather than being sprinkled evenly.
  weather = smoothstep(0.32, 0.66, weather);
  return clamp(uCover * mix(0.25, 1.75, weather), 0.0, 1.0);
}

/* Extinction (per metre) at a point, given the local cover. */
float density(vec3 p, float cover, bool fine) {
  float h = (p.y - uBase) / (uTop - uBase);
  if (h <= 0.0 || h >= 1.0) return 0.0;
  // Flat-ish bottoms, rounded tops; overcast fills the whole layer.
  float profile = smoothstep(0.0, 0.1, h) * smoothstep(1.0, mix(0.35, 0.8, uCover), h);
  vec3 q = (p + uWind) / 5200.0;
  float d = clamp(remap(textureLod(tNoise, q, 0.0).r * profile, 1.0 - cover, 1.0, 0.0, 1.0), 0.0, 1.0) * cover;
  if (d <= 0.0) return 0.0;
  if (fine) {
    vec4 detail = textureLod(tNoise, q * 5.7, 0.0);
    float erosion = mix(detail.g, 1.0 - detail.b, clamp(h * 2.5, 0.0, 1.0));
    d = clamp(remap(d, erosion * 0.32, 1.0, 0.0, 1.0), 0.0, 1.0);
  }
  return d * uDensity;
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec3 rd = normalize(uCamForward + uCamRight * ndc.x * uTan.x + uCamUp * ndc.y * uTan.y);

  // Where this piece of sky was last frame.
  vec4 prev = uPrevViewRotation * vec4(rd, 0.0);
  vec2 puv = prev.xy / max(prev.w, 1e-4) * 0.5 + 0.5;
  float valid = step(0.0, prev.w) * step(0.0, puv.x) * step(puv.x, 1.0) * step(0.0, puv.y) * step(puv.y, 1.0);
  vec4 history = texture2D(tHistory, puv);

  // One 2x2 block in every four is walked this frame; the other three take
  // their turn over the next three frames. Whole blocks, not single
  // pixels: a GPU shades pixels in 2x2 groups, so skipping one pixel of a
  // group saves nothing, while skipping a whole group skips the work.
  vec2 cell = mod(floor(gl_FragCoord.xy * 0.5), 2.0);
  float turn = cell.x + cell.y * 2.0;
  if (valid > 0.5 && uBlend < 0.999 && abs(turn - uPhase) > 0.5) {
    gl_FragColor = history;
    return;
  }

  vec4 result = vec4(0.0, 0.0, 0.0, 1.0);
  if (rd.y > 0.012) {
    float t0 = (uBase - uCamPos.y) / rd.y;
    float t1 = (uTop - uCamPos.y) / rd.y;
    // Past this the layer is a sliver on the horizon, hidden in haze anyway.
    const float FAR = 90000.0;
    if (t0 < FAR) {
      t1 = min(t1, FAR);
      float steps = float(uSteps);
      float dt = (t1 - t0) / steps;
      // Interleaved gradient noise: neighbouring pixels start at well
      // spread offsets, and the pattern shifts every frame, so the error
      // averages out across both space and time.
      float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy + uFrame * 5.588238, vec2(0.06711056, 0.00583715))));
      float cosTheta = dot(rd, uLightDir);
      // Two lobes: a strong forward glow and a little back-scatter.
      float phase = mix(phaseHG(cosTheta, 0.78), phaseHG(cosTheta, -0.25), 0.3);
      float T = 1.0;
      vec3 L = vec3(0.0);
      float depth = 0.0;
      float weight = 0.0;
      for (int i = 0; i < 64; i++) {
        if (i >= uSteps) break;
        float t = t0 + (float(i) + jitter) * dt;
        vec3 p = uCamPos + rd * t;
        float cover = coverAt(p);
        float d = cover > 0.0 ? density(p, cover, true) : 0.0;
        if (d > 0.00002) {
          // How much cloud stands between this point and the light. Three
          // samples, each further out and standing for a longer stretch.
          float od = 0.0;
          float ls = 90.0;
          vec3 lp = p;
          for (int j = 0; j < 3; j++) {
            lp += uLightDir * ls;
            od += density(lp, cover, false) * ls;
            ls *= 2.2;
          }
          // Light bounces inside a cloud many times. Three ever-weaker,
          // ever-more-even passes stand in for that.
          float lit = exp(-od) * phase
            + 0.5 * exp(-od * 0.5) * mix(phase, 0.0796, 0.5)
            + 0.25 * exp(-od * 0.25) * 0.0796;
          float h = clamp((p.y - uBase) / (uTop - uBase), 0.0, 1.0);
          vec3 ambient = mix(uAmbientBottom, uAmbientTop, h) * (0.35 + 0.65 * exp(-od * 0.12));
          vec3 S = uLightColor * lit * 2.2 + ambient + uFlash * vec3(0.75, 0.82, 1.0) * exp(-od * 0.3);
          float stepT = exp(-d * dt);
          L += T * S * (1.0 - stepT);
          depth += t * T * (1.0 - stepT);
          weight += T * (1.0 - stepT);
          T *= stepT;
          if (T < 0.015) { T = 0.0; break; }
        }
      }
      // Distance: far cloud fades into the colour of the air in front of it.
      if (weight > 0.0) {
        float distance = depth / weight;
        float air = 1.0 - exp(-distance * 0.000028);
        L = mix(L, uHaze * (1.0 - T), air);
      }
      // Fade the layer out toward the horizon instead of cutting it.
      float fade = smoothstep(0.012, 0.05, rd.y);
      result = vec4(L * fade, mix(1.0, T, fade));
    }
  }

  gl_FragColor = mix(history, result, mix(1.0, uBlend, valid));
}
`;

export type CloudState = {
  cover: number;
  density: number;
  base: number;
  top: number;
};

export class Clouds {
  private readonly noise: THREE.WebGL3DRenderTarget;
  private targets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;
  private readonly previousRotation = new THREE.Matrix4();
  private frame = 0;
  private first = true;

  constructor(
    private readonly scale: number,
    steps: number,
  ) {
    this.noise = new THREE.WebGL3DRenderTarget(
      NOISE_SIZE,
      NOISE_SIZE,
      NOISE_SIZE,
      {
        depthBuffer: false,
      },
    );
    const texture = this.noise.texture;
    texture.format = THREE.RGBAFormat;
    texture.type = THREE.UnsignedByteType;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
    texture.generateMipmaps = false;

    const make = () =>
      new THREE.WebGLRenderTarget(4, 4, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
      });
    this.targets = [make(), make()];

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tNoise: { value: texture },
        tHistory: { value: null },
        tSky: { value: null },
        uCamRight: { value: new THREE.Vector3() },
        uCamUp: { value: new THREE.Vector3() },
        uCamForward: { value: new THREE.Vector3() },
        uTan: { value: new THREE.Vector2() },
        uCamPos: { value: new THREE.Vector3() },
        uPrevViewRotation: { value: new THREE.Matrix4() },
        uResolution: { value: new THREE.Vector2(4, 4) },
        uFrame: { value: 0 },
        uPhase: { value: 0 },
        uBlend: { value: 0.5 },
        uSteps: { value: steps },
        uCover: { value: 0.4 },
        uDensity: { value: 0.012 },
        uBase: { value: 1200 },
        uTop: { value: 3200 },
        uWind: { value: new THREE.Vector3() },
        uLightDir: { value: new THREE.Vector3(0, 1, 0) },
        uLightColor: { value: new THREE.Vector3(1, 1, 1) },
        uAmbientTop: { value: new THREE.Vector3(1, 1, 1) },
        uAmbientBottom: { value: new THREE.Vector3(1, 1, 1) },
        uHaze: { value: new THREE.Vector3(1, 1, 1) },
        uFlash: { value: 0 },
      },
      vertexShader: QUAD_VERTEX,
      fragmentShader: MARCH_FRAGMENT,
      depthTest: false,
      depthWrite: false,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
  }

  /**
   * Bakes the noise volume, one slice per draw, a few slices at a time with
   * a pause between batches so the page never waits on it. Also compiles
   * the ray-march shader in the background.
   */
  async bake(renderer: THREE.WebGLRenderer): Promise<void> {
    const material = new THREE.ShaderMaterial({
      uniforms: { uSlice: { value: 0 } },
      vertexShader: QUAD_VERTEX,
      fragmentShader: NOISE_FRAGMENT,
      depthTest: false,
      depthWrite: false,
    });
    const march = this.quad.material;
    // Both shaders start compiling now; neither blocks.
    const marchReady = renderer.compileAsync(this.scene, this.camera);
    this.quad.material = material;
    await renderer.compileAsync(this.scene, this.camera);
    for (let z = 0; z < NOISE_SIZE; z++) {
      this.quad.material = material;
      material.uniforms.uSlice!.value = (z + 0.5) / NOISE_SIZE;
      renderer.setRenderTarget(this.noise, z);
      renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(null);
      this.quad.material = march;
      if (z % 8 === 7) await new Promise((resolve) => setTimeout(resolve, 0));
    }
    this.quad.material = march;
    material.dispose();
    await marchReady;
  }

  setSize(width: number, height: number): void {
    const w = Math.max(8, Math.round(width * this.scale));
    const h = Math.max(8, Math.round(height * this.scale));
    for (const target of this.targets) target.setSize(w, h);
    this.material.uniforms.uResolution!.value.set(w, h);
    this.first = true;
  }

  get texture(): THREE.Texture {
    return this.targets[0].texture;
  }

  /**
   * Walks the rays for this frame. `viewRotation` is projection x view with
   * the camera's position removed (clouds are far enough away that only the
   * direction of view matters).
   */
  render(
    renderer: THREE.WebGLRenderer,
    viewRotation: THREE.Matrix4,
    changing: boolean,
  ): void {
    const [current, history] = this.targets;
    const u = this.material.uniforms;
    u.tHistory!.value = history.texture;
    u.uPrevViewRotation!.value.copy(this.previousRotation);
    // Visit the four pixels of each block in an order that never does two
    // neighbours in a row.
    u.uPhase!.value = [0, 3, 1, 2][this.frame % 4]!;
    u.uFrame!.value = this.frame++ % 256;
    // Settle gently when nothing changes; follow quickly when the light does.
    u.uBlend!.value = this.first ? 1 : changing ? 0.7 : 0.22;
    this.first = false;
    // Render into the older buffer, then make it the current one.
    renderer.setRenderTarget(history);
    u.tHistory!.value = current.texture;
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
    this.targets = [history, current];
    this.previousRotation.copy(viewRotation);
  }

  dispose(): void {
    this.noise.dispose();
    for (const target of this.targets) target.dispose();
    this.material.dispose();
    this.quad.geometry.dispose();
  }
}
