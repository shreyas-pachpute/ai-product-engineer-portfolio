import * as THREE from "three";

/**
 * Lights on a night coast: the Achievements page.
 *
 * Real navigation lights are told apart by their character, the rhythm
 * printed for each in the List of Lights: "Fl(2) W 10s" is two white
 * flashes every ten seconds, "Oc R 6s" a red light eclipsed once every six,
 * "Iso G 4s" green, on and off for equal times, "Q" quick flashing. The page
 * gives each achievement a light; this draws them: points of HDR light far
 * off on the horizon, bright enough for the film's bloom to give them a
 * glow, dimmed by distance and the night air, and seen again as a column
 * in the water through the mirror pass.
 *
 * Positions are given as bearings (degrees) from the Achievements shot's
 * line of sight, with a distance and a height, so the page can place lights
 * without knowing the world's coordinates.
 */

export type BeaconDef = {
  /** Degrees right of the shot's line of sight. */
  bearing: number;
  /** Metres from the camera. */
  distance: number;
  /** Height of the lamp above the sea, metres. */
  height: number;
  colour: "W" | "R" | "G";
  /** The light's character, e.g. "Fl(2) 10s". */
  character: string;
};

export const MAX_BEACONS = 8;

/** The Achievements shot: where the camera stands, and its line of sight. */
const ORIGIN = new THREE.Vector3(300, 5, -34);
const AXIS = Math.atan2(-112 - -34, 372 - 300);

const COLOURS: Record<BeaconDef["colour"], [number, number, number]> = {
  W: [1, 0.86, 0.66],
  R: [1, 0.2, 0.12],
  G: [0.25, 1, 0.55],
};

/** On/off over time for a light character, with soft edges (a lamp warms). */
export function lightLevel(character: string, t: number): number {
  const period = Number(/(\d+(?:\.\d+)?)s/.exec(character)?.[1] ?? 1);
  const phase = ((t % period) + period) % period;
  const pulse = (start: number, length: number) => {
    const rise = Math.min(1, Math.max(0, (phase - start) / 0.08));
    const fall = Math.min(1, Math.max(0, (start + length - phase) / 0.12));
    return Math.min(rise, fall);
  };
  if (/^Q/.test(character)) {
    // Quick: about sixty flashes a minute.
    const q = phase % 1;
    return Math.max(0, Math.min(1, q / 0.06, (0.38 - q) / 0.08));
  }
  const group = Number(/\((\d+)\)/.exec(character)?.[1] ?? 1);
  if (/^Oc/.test(character)) {
    // Occulting: lit, with one short eclipse at the end of each period.
    return 1 - pulse(period - 1.2, 1.2);
  }
  if (/^Iso/.test(character)) return pulse(0, period / 2);
  // Flashing, singly or in groups.
  let level = 0;
  for (let k = 0; k < group; k++) level = Math.max(level, pulse(k * 1.4, 0.55));
  return level;
}

export type Beacons = {
  points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  /** World positions of the lamps, for projecting to the screen. */
  positions: THREE.Vector3[];
  levels: number[];
  set(defs: readonly BeaconDef[]): void;
  update(time: number, still: boolean, fogDensity: number, glow: number): void;
  count(): number;
};

export function createBeacons(): Beacons {
  const geometry = new THREE.BufferGeometry();
  const position = new Float32Array(MAX_BEACONS * 3);
  const colour = new Float32Array(MAX_BEACONS * 3);
  const level = new Float32Array(MAX_BEACONS);
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("colour", new THREE.BufferAttribute(colour, 3));
  const levelAttribute = new THREE.BufferAttribute(level, 1);
  levelAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("level", levelAttribute);
  geometry.setDrawRange(0, 0);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: 1 },
      uGlow: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 colour;
      attribute float level;
      uniform float uPixelRatio;
      varying vec3 vColour;
      varying float vLevel;
      void main() {
        vColour = colour;
        vLevel = level;
        vec4 view = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * view;
        // A lamp is a point of light: its glow is a fixed size on screen.
        gl_PointSize = 64.0 * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uGlow;
      varying vec3 vColour;
      varying float vLevel;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(p, p);
        if (r2 > 1.0) discard;
        // A hot core and a soft halo; the film's bloom does the rest.
        // Not too hot a core, so the colour survives the tone curve.
        float core = exp(-r2 * 220.0) * 26.0;
        float halo = exp(-r2 * 26.0) * 4.0 + exp(-r2 * 4.0) * 0.6;
        float light = (core + halo) * vLevel;
        // Additive blending multiplies colour by alpha, and alpha is what
        // the mirrored pass uses to lay the lamp's reflection over the sky's,
        // so alpha follows the light: none where there is none.
        float a = clamp(light * 0.6, 0.0, 1.0);
        gl_FragColor = vec4(vColour * light * uGlow / max(a, 0.002), a);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.name = "beacons";
  points.visible = false;

  const positions: THREE.Vector3[] = [];
  const levels: number[] = [];
  let defs: readonly BeaconDef[] = [];

  return {
    points,
    positions,
    levels,
    set(next) {
      defs = next.slice(0, MAX_BEACONS);
      positions.length = 0;
      levels.length = 0;
      defs.forEach((def, i) => {
        const angle = AXIS + (def.bearing * Math.PI) / 180;
        const p = new THREE.Vector3(
          ORIGIN.x + Math.cos(angle) * def.distance,
          def.height,
          ORIGIN.z + Math.sin(angle) * def.distance,
        );
        positions.push(p);
        levels.push(0);
        position.set([p.x, p.y, p.z], i * 3);
        colour.set(COLOURS[def.colour], i * 3);
      });
      geometry.attributes.position!.needsUpdate = true;
      geometry.attributes.colour!.needsUpdate = true;
      geometry.setDrawRange(0, defs.length);
      points.visible = defs.length > 0;
    },
    update(time, still, fogDensity, glow) {
      material.uniforms.uGlow!.value = glow;
      defs.forEach((def, i) => {
        // Under reduced motion every light burns steadily.
        const on = still ? 1 : lightLevel(def.character, time + i * 1.7);
        // Lamps carry further through the night air than the fog's
        // daylight density suggests: they are the brightest thing out there.
        const through = Math.exp(-fogDensity * def.distance * 0.45);
        levels[i] = on;
        level[i] = on * through;
      });
      levelAttribute.needsUpdate = true;
    },
    count() {
      return defs.length;
    },
  };
}

/** The line of sight of the Achievements shot, as a bearing in radians. */
export const BEACON_AXIS = AXIS;
