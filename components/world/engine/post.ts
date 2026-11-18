import * as THREE from "three";

/**
 * The look pass.
 *
 * The scene is rendered once into a target with two colour attachments
 * (colour and ink id — see materials.ts). This pass then draws the final
 * frame from them:
 *
 *   1. Ink. A Roberts-cross edge detector over the id buffer: wherever
 *      diagonally neighbouring pixels belong to different regions, a line
 *      is drawn in the palette's ink colour. One detector, one line
 *      weight, for everything in the frame.
 *   2. Paper. A fixed grain multiplied over the image so flat colour reads
 *      as printed on stock rather than as a clean digital fill, plus a
 *      little animated tooth so it is not a frozen texture.
 *   3. A soft vignette, to hold the eye toward the middle of the frame.
 *
 * Because every chapter of the page goes through this same pass, the
 * dawn harbour and the night storm look like plates from the same book.
 */

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
uniform sampler2D tColor;
uniform sampler2D tInk;
uniform vec2 uTexel;
uniform float uLine;
uniform vec3 uInk;
uniform float uTime;
uniform float uGrain;
uniform float uVignette;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  vec3 col = texture(tColor, vUv).rgb;

  // Roberts cross: two diagonal differences.
  vec2 o = uTexel * uLine * 0.5;
  vec4 a = texture(tInk, vUv + vec2(-o.x, -o.y));
  vec4 b = texture(tInk, vUv + vec2( o.x,  o.y));
  vec4 c = texture(tInk, vUv + vec2( o.x, -o.y));
  vec4 d = texture(tInk, vUv + vec2(-o.x,  o.y));
  float edge = length(a.rgb - b.rgb) + length(c.rgb - d.rgb);
  // The stronger region on either side decides the weight: a boat keeps
  // its full outline against faint distant water, while two faint wave
  // bands meeting each other only ever get a faint line.
  float strength = max(max(a.a, b.a), max(c.a, d.a));
  float line = smoothstep(0.05, 0.22, edge) * strength;
  col = mix(col, uInk, line * 0.92);

  // Paper: a coarse fibre and a fine tooth, both fixed to the screen.
  vec2 px = gl_FragCoord.xy;
  float fibre = valueNoise(px * 0.035) * 0.6 + valueNoise(px * 0.11) * 0.4;
  float tooth = hash(px + floor(uTime * 9.0) * 3.7);
  float grain = (fibre - 0.5) * 0.55 + (tooth - 0.5) * 0.45;
  col *= 1.0 + grain * uGrain;

  // Vignette.
  vec2 q = vUv - 0.5;
  col *= 1.0 - uVignette * dot(q, q) * 1.6;

  gl_FragColor = vec4(col, 1.0);
}
`;

export class LookPass {
  readonly target: THREE.WebGLRenderTarget;
  readonly material: THREE.ShaderMaterial;

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: THREE.Mesh;

  constructor(samples: number) {
    this.target = new THREE.WebGLRenderTarget(2, 2, {
      count: 2,
      depthBuffer: true,
      // Multisampling here is what antialiases the ink: the resolved id
      // buffer has blended values along region boundaries, so the edge
      // detector produces a soft-edged line instead of a staircase.
      samples,
      type: THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tColor: { value: this.target.textures[0] },
        tInk: { value: this.target.textures[1] },
        uTexel: { value: new THREE.Vector2(1, 1) },
        uLine: { value: 1.6 },
        uInk: { value: new THREE.Vector3(0.04, 0.16, 0.25) },
        uTime: { value: 0 },
        uGrain: { value: 0.11 },
        uVignette: { value: 0.22 },
      },
    });

    // One oversized triangle covering the screen — no diagonal seam, and
    // a third fewer vertices than a quad for what it is worth.
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3),
    );
    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2),
    );
    this.quad = new THREE.Mesh(geometry, this.material);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
  }

  setSize(width: number, height: number, lineWidth: number): void {
    this.target.setSize(width, height);
    const uniforms = this.material.uniforms;
    (uniforms.uTexel!.value as THREE.Vector2).set(1 / width, 1 / height);
    uniforms.uLine!.value = lineWidth;
  }

  /** Compiles the composite shader without blocking, where the browser can. */
  compile(renderer: THREE.WebGLRenderer): Promise<unknown> {
    renderer.setRenderTarget(null);
    return renderer.compileAsync(this.scene, this.camera);
  }

  render(renderer: THREE.WebGLRenderer): void {
    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.target.dispose();
    this.material.dispose();
    this.quad.geometry.dispose();
  }
}
