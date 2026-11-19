import * as THREE from "three";

/**
 * The atmosphere.
 *
 * Sky colour is not painted here; it is computed. Sunlight (or moonlight)
 * enters a shell of air around a planet and is scattered on the way to the
 * eye: strongly in blue by air molecules (Rayleigh), weakly and forward by
 * haze (Mie), and absorbed a little in the ozone layer. Integrating that
 * along each view direction gives a blue zenith, a pale horizon, a red
 * sunset and a twilight arch without any of them being authored. Move the
 * light and the whole sky follows.
 *
 * The same model runs in two places:
 *
 *   - on the GPU, into a small texture (the "sky view" lookup) that the sky
 *     dome and the sea's reflections read. It is recomputed only when the
 *     light moves, and it is tiny, so it costs almost nothing;
 *   - on the CPU, for a handful of directions, to tell the rest of the
 *     scene what colour the light and the ambient sky are. That is what
 *     keeps the ship, the fog and the clouds lit by the same sky you see.
 *
 * Distances here are kilometres. Coefficients are the standard Earth
 * values used by Bruneton and by Hillaire's "Scalable and Production Ready
 * Sky and Atmosphere" (2020).
 */

const R_GROUND = 6360;
const R_TOP = 6460;
const BETA_R: readonly [number, number, number] = [
  5.802e-3, 13.558e-3, 33.1e-3,
];
const BETA_M_S = 3.996e-3;
const BETA_M_E = 4.4e-3;
const BETA_O: readonly [number, number, number] = [0.65e-3, 1.881e-3, 0.085e-3];
const H_R = 8;
const H_M = 1.2;
/** Eye height above the sea, km. */
const EYE = 0.002;

export const ATMOSPHERE_GLSL = /* glsl */ `
const float ATM_PI = 3.14159265359;
const float R_GROUND = ${R_GROUND.toFixed(1)};
const float R_TOP = ${R_TOP.toFixed(1)};
const vec3 BETA_R = vec3(${BETA_R.join(", ")});
const float BETA_M_S = ${BETA_M_S};
const float BETA_M_E = ${BETA_M_E};
const vec3 BETA_O = vec3(${BETA_O.join(", ")});
const float H_R = ${H_R.toFixed(1)};
const float H_M = ${H_M.toFixed(1)};

/* Where a direction lands in the sky-view texture. Rows are packed toward
   the horizon, where the sky changes fastest. */
vec2 skyUv(vec3 dir) {
  float az = atan(dir.z, dir.x) / (2.0 * ATM_PI) + 0.5;
  float lat = asin(clamp(dir.y, -1.0, 1.0));
  float v = 0.5 + 0.5 * sign(lat) * sqrt(abs(lat) / (0.5 * ATM_PI));
  return vec2(az, v);
}

/* Haze's forward glow around the light (Cornette-Shanks). */
float miePhase(float cosTheta) {
  const float g = 0.8;
  float g2 = g * g;
  return (3.0 / (8.0 * ATM_PI)) * ((1.0 - g2) * (1.0 + cosTheta * cosTheta)) /
    ((2.0 + g2) * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}
`;

const LUT_FRAGMENT = /* glsl */ `
precision highp float;
${ATMOSPHERE_GLSL}
uniform vec3 uLightDir;
uniform float uIntensity;
varying vec2 vUv;

vec2 sphere(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - r * r;
  float d = b * b - c;
  if (d < 0.0) return vec2(1e9, -1e9);
  d = sqrt(d);
  return vec2(-b - d, -b + d);
}

vec3 density(float h) {
  return vec3(exp(-h / H_R), exp(-h / H_M), max(0.0, 1.0 - abs(h - 25.0) / 15.0));
}

/* Optical depth from a point out of the atmosphere toward the light. */
vec3 depthToTop(vec3 p, vec3 dir) {
  float tTop = sphere(p, dir, R_TOP).y;
  float dt = tTop / 6.0;
  vec3 od = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    vec3 q = p + dir * (float(i) + 0.5) * dt;
    od += density(max(length(q) - R_GROUND, 0.0)) * dt;
  }
  return od;
}

void main() {
  float az = (vUv.x - 0.5) * 2.0 * ATM_PI;
  float vv = vUv.y * 2.0 - 1.0;
  float lat = sign(vv) * vv * vv * 0.5 * ATM_PI;
  vec3 dir = vec3(cos(lat) * cos(az), sin(lat), cos(lat) * sin(az));
  vec3 ro = vec3(0.0, R_GROUND + ${EYE}, 0.0);

  float tMax = sphere(ro, dir, R_TOP).y;
  vec2 ground = sphere(ro, dir, R_GROUND);
  if (ground.x > 0.0 && ground.y > ground.x) tMax = min(tMax, ground.x);

  const int STEPS = 30;
  vec3 sumR = vec3(0.0);
  vec3 sumM = vec3(0.0);
  vec3 od = vec3(0.0);
  float prev = 0.0;
  for (int i = 0; i < STEPS; i++) {
    // Samples bunch up near the eye, where the air is thickest.
    float f = (float(i) + 1.0) / float(STEPS);
    float t1 = tMax * f * f;
    float dt = t1 - prev;
    vec3 p = ro + dir * (prev + 0.5 * dt);
    prev = t1;
    vec3 d = density(max(length(p) - R_GROUND, 0.0));
    od += d * dt * 0.5;
    // No light where the planet itself is in the way.
    vec2 shadow = sphere(p, uLightDir, R_GROUND);
    if (!(shadow.x > 0.0 && shadow.y > shadow.x)) {
      vec3 odL = od + depthToTop(p, uLightDir);
      vec3 att = exp(-(BETA_R * odL.x + BETA_M_E * odL.y + BETA_O * odL.z));
      sumR += d.x * att * dt;
      sumM += d.y * att * dt;
    }
    od += d * dt * 0.5;
  }

  float cosTheta = dot(dir, uLightDir);
  float phaseR = (3.0 / (16.0 * ATM_PI)) * (1.0 + cosTheta * cosTheta);
  vec3 rayleigh = sumR * BETA_R;
  vec3 mie = sumM * BETA_M_S;
  // Light that has bounced more than once, approximated as an even glow
  // proportional to what was scattered the first time.
  vec3 multi = (rayleigh + mie) * (0.32 / (4.0 * ATM_PI));
  vec3 colour = uIntensity * (rayleigh * phaseR + multi);
  // Haze is stored without its phase function; the dome applies that per
  // pixel, so the glow round the sun stays sharp at this low resolution.
  gl_FragColor = vec4(colour, uIntensity * dot(mie, vec3(0.3333)));
}
`;

const LUT_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** The sky-view lookup: the whole sky for one light position, in 192x108. */
export class SkyView {
  readonly target: THREE.WebGLRenderTarget;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly material: THREE.ShaderMaterial;
  private readonly lastDir = new THREE.Vector3(9, 9, 9);
  private lastIntensity = -1;

  constructor() {
    this.target = new THREE.WebGLRenderTarget(192, 108, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
    });
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uLightDir: { value: new THREE.Vector3(0, 1, 0) },
        uIntensity: { value: 1 },
      },
      vertexShader: LUT_VERTEX,
      fragmentShader: LUT_FRAGMENT,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
  }

  get texture(): THREE.Texture {
    return this.target.texture;
  }

  compile(renderer: THREE.WebGLRenderer): Promise<unknown> {
    return renderer.compileAsync(this.scene, this.camera);
  }

  /** Recomputes the sky if the light has moved or changed strength. */
  update(
    renderer: THREE.WebGLRenderer,
    lightDir: THREE.Vector3,
    intensity: number,
  ): void {
    if (
      this.lastDir.distanceToSquared(lightDir) < 1e-7 &&
      Math.abs(this.lastIntensity - intensity) < 1e-4
    ) {
      return;
    }
    this.lastDir.copy(lightDir);
    this.lastIntensity = intensity;
    this.material.uniforms.uLightDir!.value.copy(lightDir);
    this.material.uniforms.uIntensity!.value = intensity;
    const previous = renderer.getRenderTarget();
    renderer.setRenderTarget(this.target);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(previous);
  }

  dispose(): void {
    this.target.dispose();
    this.material.dispose();
  }
}

/* -------------------------------------------------------------------------
   The same physics on the CPU, for a few directions per frame.
   ------------------------------------------------------------------------- */

type RGB = [number, number, number];

function sphereExit(
  py: number,
  dx: number,
  dy: number,
  dz: number,
  px: number,
  pz: number,
  r: number,
): [number, number] {
  const b = px * dx + py * dy + pz * dz;
  const c = px * px + py * py + pz * pz - r * r;
  const d = b * b - c;
  if (d < 0) return [1e9, -1e9];
  const s = Math.sqrt(d);
  return [-b - s, -b + s];
}

/**
 * How much of the light survives the trip down through the air to sea
 * level, per colour channel. Overhead: nearly white. On the horizon: the
 * blue is gone and what is left is orange. This is the colour of the sun.
 */
export function lightTransmittance(out: RGB, elevationSin: number): RGB {
  const dy = elevationSin;
  const dx = Math.sqrt(Math.max(0, 1 - dy * dy));
  const py = R_GROUND + EYE;
  const [near, far] = sphereExit(py, dx, dy, 0, 0, 0, R_TOP);
  const ground = sphereExit(py, dx, dy, 0, 0, 0, R_GROUND);
  if (ground[0] > 0 && ground[1] > ground[0]) {
    // Below the horizon: the planet is in the way.
    out[0] = out[1] = out[2] = 0;
    return out;
  }
  void near;
  const steps = 40;
  let odR = 0;
  let odM = 0;
  let odO = 0;
  let previous = 0;
  for (let i = 0; i < steps; i++) {
    const f = (i + 1) / steps;
    const t1 = far * f * f;
    const dt = t1 - previous;
    const t = previous + dt * 0.5;
    previous = t1;
    const x = dx * t;
    const y = py + dy * t;
    const h = Math.max(0, Math.sqrt(x * x + y * y) - R_GROUND);
    odR += Math.exp(-h / H_R) * dt;
    odM += Math.exp(-h / H_M) * dt;
    odO += Math.max(0, 1 - Math.abs(h - 25) / 15) * dt;
  }
  for (let c = 0; c < 3; c++) {
    out[c] = Math.exp(-(BETA_R[c]! * odR + BETA_M_E * odM + BETA_O[c]! * odO));
  }
  return out;
}

/**
 * Radiance of the clear sky in one direction (single scattering plus the
 * same even multi-bounce term the GPU version uses). Used for the ambient
 * light on the ship and the colour distant things fade to.
 */
export function skyRadiance(
  out: RGB,
  dir: readonly [number, number, number],
  light: readonly [number, number, number],
  intensity: number,
): RGB {
  const py = R_GROUND + EYE;
  let tMax = sphereExit(py, dir[0], dir[1], dir[2], 0, 0, R_TOP)[1];
  const ground = sphereExit(py, dir[0], dir[1], dir[2], 0, 0, R_GROUND);
  if (ground[0] > 0 && ground[1] > ground[0]) tMax = Math.min(tMax, ground[0]);
  const steps = 16;
  const sumR: RGB = [0, 0, 0];
  const sumM: RGB = [0, 0, 0];
  let odR = 0;
  let odM = 0;
  let odO = 0;
  let previous = 0;
  for (let i = 0; i < steps; i++) {
    const f = (i + 1) / steps;
    const t1 = tMax * f * f;
    const dt = t1 - previous;
    const t = previous + dt * 0.5;
    previous = t1;
    const px = dir[0] * t;
    const pyy = py + dir[1] * t;
    const pz = dir[2] * t;
    const h = Math.max(0, Math.sqrt(px * px + pyy * pyy + pz * pz) - R_GROUND);
    const dR = Math.exp(-h / H_R);
    const dM = Math.exp(-h / H_M);
    const dO = Math.max(0, 1 - Math.abs(h - 25) / 15);
    odR += dR * dt * 0.5;
    odM += dM * dt * 0.5;
    odO += dO * dt * 0.5;
    const shadow = sphereExit(
      pyy,
      light[0],
      light[1],
      light[2],
      px,
      pz,
      R_GROUND,
    );
    if (!(shadow[0] > 0 && shadow[1] > shadow[0])) {
      const top = sphereExit(
        pyy,
        light[0],
        light[1],
        light[2],
        px,
        pz,
        R_TOP,
      )[1];
      const ds = top / 5;
      let lR = odR;
      let lM = odM;
      let lO = odO;
      for (let j = 0; j < 5; j++) {
        const s = (j + 0.5) * ds;
        const qx = px + light[0] * s;
        const qy = pyy + light[1] * s;
        const qz = pz + light[2] * s;
        const hh = Math.max(
          0,
          Math.sqrt(qx * qx + qy * qy + qz * qz) - R_GROUND,
        );
        lR += Math.exp(-hh / H_R) * ds;
        lM += Math.exp(-hh / H_M) * ds;
        lO += Math.max(0, 1 - Math.abs(hh - 25) / 15) * ds;
      }
      for (let c = 0; c < 3; c++) {
        const att = Math.exp(
          -(BETA_R[c]! * lR + BETA_M_E * lM + BETA_O[c]! * lO),
        );
        sumR[c]! += dR * att * dt;
        sumM[c]! += dM * att * dt;
      }
    }
    odR += dR * dt * 0.5;
    odM += dM * dt * 0.5;
    odO += dO * dt * 0.5;
  }
  const cosTheta = dir[0] * light[0] + dir[1] * light[1] + dir[2] * light[2];
  const phaseR = (3 / (16 * Math.PI)) * (1 + cosTheta * cosTheta);
  const g = 0.8;
  const g2 = g * g;
  const phaseM =
    ((3 / (8 * Math.PI)) * ((1 - g2) * (1 + cosTheta * cosTheta))) /
    ((2 + g2) * Math.pow(1 + g2 - 2 * g * cosTheta, 1.5));
  for (let c = 0; c < 3; c++) {
    const rayleigh = sumR[c]! * BETA_R[c]!;
    const mie = sumM[c]! * BETA_M_S;
    out[c] =
      intensity *
      (rayleigh * phaseR +
        mie * phaseM +
        (rayleigh + mie) * (0.32 / (4 * Math.PI)));
  }
  return out;
}
