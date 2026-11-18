import * as THREE from "three";
import { hex, type RGB } from "./palette";
import {
  InkBuilder,
  createToonMaterial,
  nextInk,
  type ToonMaterial,
} from "./materials";

/**
 * Everything that floats, built from code.
 *
 * There are no model files. Each object is a few dozen flat-shaded faces
 * assembled here, coloured from the brand palette, and given ink ids so the
 * look pass outlines it. Keeping them this simple is the style, not a
 * shortcut: a paper boat *is* nine triangles.
 *
 * Two boats tell the story:
 *   - the paper boat — a demo. Folded in a minute, lovely on a calm day.
 *   - the ship — the same idea with a keel, ribs, ballast and a sail. Its
 *     half-disc sail on a straight mast is the logo's "P", so the brand
 *     mark and the thing it stands for are literally the same shape.
 */

const C = {
  paper: hex("#FBF3E4"),
  paperBright: hex("#FFFFFF"),
  paperFold: hex("#F1E3C8"),
  vermilion: hex("#FF4B2B"),
  vermilionDeep: hex("#D93A1E"),
  sun: hex("#FFC53D"),
  ink: hex("#0B2A3F"),
  inkSoft: hex("#1D4A63"),
  wood: hex("#E8B36B"),
  woodDeep: hex("#C98A45"),
  cream: hex("#FFF3D9"),
  rock: hex("#2B5062"),
  rockLight: hex("#3F6C7C"),
  island: hex("#2F7B78"),
  lamp: hex("#FFE9A6"),
} as const;

type V = readonly [number, number, number];

/* ----------------------------------------------------------- paper boat */

/**
 * The classic folded boat: a canoe-shaped hull with a triangular peak in
 * the middle. Every face is its own ink region, so every fold is drawn.
 * Length 3.2 along x, origin at the waterline.
 */
export function createPaperBoat(): THREE.Mesh<
  THREE.BufferGeometry,
  ToonMaterial
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

  const b = new InkBuilder();
  // Hull, port and starboard.
  b.tri(bow, keelF, rimL, C.paper, nextInk());
  b.tri(keelF, keelB, rimL, C.paperFold, nextInk());
  b.tri(keelB, stern, rimL, C.paper, nextInk());
  b.tri(bow, rimR, keelF, C.paperFold, nextInk());
  b.tri(keelF, rimR, keelB, C.paper, nextInk());
  b.tri(keelB, rimR, stern, C.paperFold, nextInk());
  // The inner slopes from the rim down to the base of the peak.
  b.tri(bow, rimL, tentF, C.paperFold, nextInk());
  b.tri(bow, tentF, rimR, C.paper, nextInk());
  b.tri(stern, tentB, rimL, C.paper, nextInk());
  b.tri(stern, rimR, tentB, C.paperFold, nextInk());
  // The peak.
  b.tri(tentF, rimL, apex, C.paperBright, nextInk());
  b.tri(tentB, apex, rimL, C.paper, nextInk());
  b.tri(tentF, apex, rimR, C.paper, nextInk());
  b.tri(tentB, rimR, apex, C.paperBright, nextInk());

  const mesh = new THREE.Mesh(
    b.build(),
    createToonMaterial({ doubleSided: true }),
  );
  mesh.name = "paper-boat";
  return mesh;
}

/* ------------------------------------------------------------------ ship */

/** Hull shape, shared by the planking, the ribs and the deck. Bow is at −x. */
const HULL = {
  length: 6.4,
  stations: 18,
  ring: 7,
  /** 0 at the bow, 1 at the stern. */
  halfBeam(t: number): number {
    return (
      1.02 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.02 + t * 0.84)), 0.62)
    );
  },
  deck(t: number): number {
    return 0.86 + 0.5 * Math.pow(1 - t, 2.4) + 0.1 * Math.pow(t, 3);
  },
  keel(t: number): number {
    return -0.62 + 0.62 * Math.pow(1 - t, 3.2) + 0.16 * Math.pow(t, 5);
  },
  x(t: number): number {
    return -this.length / 2 + t * this.length;
  },
  /** A point on the hull skin: s runs 0 (deck edge) to 1 (keel). */
  point(t: number, s: number, side: 1 | -1): V {
    const a = s * (Math.PI / 2);
    const z = this.halfBeam(t) * Math.pow(Math.cos(a), 0.7) * side;
    const y =
      this.deck(t) +
      (this.keel(t) - this.deck(t)) * Math.pow(Math.sin(a), 1.25);
    return [this.x(t), y, z];
  },
};

export type Ship = {
  group: THREE.Group;
  /** 0–1: keel and ribs, planking, deck, mast, sail. */
  setBuild(progress: number): void;
  /** Named points on the ship, in its local space, for the anatomy labels. */
  anchors: Record<ShipPart, THREE.Vector3>;
  /** x extent in local space, for the wake and for framing. */
  halfLength: number;
};

export type ShipPart =
  "keel" | "hull" | "ballast" | "rigging" | "compass" | "stores";

export function createShip(): Ship {
  const group = new THREE.Group();
  group.name = "ship";

  /* Keel and ribs: the structure, visible until the planking covers it. */
  const frame = new InkBuilder();
  const keelInk = nextInk();
  const keelPoints: V[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    keelPoints.push([HULL.x(t), HULL.keel(t) - 0.02, 0]);
  }
  for (let i = 0; i < keelPoints.length - 1; i++) {
    const a = keelPoints[i]!;
    const c = keelPoints[i + 1]!;
    const w = 0.07;
    const h = 0.16;
    frame.quad(
      [a[0], a[1], w],
      [c[0], c[1], w],
      [c[0], c[1] + h, w],
      [a[0], a[1] + h, w],
      C.woodDeep,
      keelInk,
    );
    frame.quad(
      [c[0], c[1], -w],
      [a[0], a[1], -w],
      [a[0], a[1] + h, -w],
      [c[0], c[1] + h, -w],
      C.woodDeep,
      keelInk,
    );
    frame.quad(
      [a[0], a[1], -w],
      [c[0], c[1], -w],
      [c[0], c[1], w],
      [a[0], a[1], w],
      C.woodDeep,
      keelInk,
    );
  }
  const frameMesh = new THREE.Mesh(
    frame.build(),
    createToonMaterial({ doubleSided: true }),
  );
  group.add(frameMesh);

  const ribs: THREE.Mesh<THREE.BufferGeometry, ToonMaterial>[] = [];
  const ribCount = 11;
  for (let r = 0; r < ribCount; r++) {
    const t = 0.08 + (r / (ribCount - 1)) * 0.86;
    const rb = new InkBuilder();
    const ink = nextInk();
    const half = 0.045;
    for (const side of [1, -1] as const) {
      for (let j = 0; j < 10; j++) {
        const p0 = HULL.point(t, j / 10, side);
        const p1 = HULL.point(t, (j + 1) / 10, side);
        // Pull the rib slightly inside the skin so the planking covers it.
        const inset = 0.93;
        const a: V = [p0[0] - half, p0[1], p0[2] * inset];
        const b: V = [p0[0] + half, p0[1], p0[2] * inset];
        const c: V = [p1[0] + half, p1[1], p1[2] * inset];
        const d: V = [p1[0] - half, p1[1], p1[2] * inset];
        rb.quad(a, b, c, d, C.wood, ink);
      }
    }
    const rib = new THREE.Mesh(
      rb.build(),
      createToonMaterial({ doubleSided: true }),
    );
    ribs.push(rib);
    group.add(rib);
  }

  /* Planking: the skin, wiped on from bow to stern. */
  const skin = new InkBuilder();
  const inkTop = nextInk();
  const inkSide = nextInk();
  const inkBottom = nextInk();
  for (const side of [1, -1] as const) {
    for (let i = 0; i < HULL.stations; i++) {
      const t0 = i / HULL.stations;
      const t1 = (i + 1) / HULL.stations;
      for (let j = 0; j < HULL.ring; j++) {
        const s0 = j / HULL.ring;
        const s1 = (j + 1) / HULL.ring;
        const a = HULL.point(t0, s0, side);
        const b = HULL.point(t1, s0, side);
        const c = HULL.point(t1, s1, side);
        const d = HULL.point(t0, s1, side);
        // Rub rail, topsides, and bottom paint, as three flat regions.
        const color = j === 0 ? C.ink : j < 4 ? C.cream : C.vermilion;
        const ink = j === 0 ? inkTop : j < 4 ? inkSide : inkBottom;
        if (side === 1) skin.quad(a, b, c, d, color, ink);
        else skin.quad(b, a, d, c, color, ink);
      }
    }
  }
  // Transom.
  const transomInk = nextInk();
  for (let j = 0; j < HULL.ring; j++) {
    const a = HULL.point(1, j / HULL.ring, 1);
    const b = HULL.point(1, (j + 1) / HULL.ring, 1);
    const c = HULL.point(1, (j + 1) / HULL.ring, -1);
    const d = HULL.point(1, j / HULL.ring, -1);
    skin.quad(a, b, c, d, C.cream, transomInk);
  }
  const skinMesh = new THREE.Mesh(
    skin.build(true),
    createToonMaterial({ doubleSided: true }),
  );
  group.add(skinMesh);

  /* Deck and cabin. */
  const top = new InkBuilder();
  const deckInk = nextInk();
  for (let i = 0; i < HULL.stations; i++) {
    const t0 = i / HULL.stations;
    const t1 = (i + 1) / HULL.stations;
    const y0 = HULL.deck(t0) - 0.04;
    const y1 = HULL.deck(t1) - 0.04;
    top.quad(
      [HULL.x(t0), y0, HULL.halfBeam(t0) * 0.96],
      [HULL.x(t1), y1, HULL.halfBeam(t1) * 0.96],
      [HULL.x(t1), y1, -HULL.halfBeam(t1) * 0.96],
      [HULL.x(t0), y0, -HULL.halfBeam(t0) * 0.96],
      C.wood,
      deckInk,
    );
  }
  const cabinY = HULL.deck(0.62);
  top.add(
    new THREE.BoxGeometry(1.5, 0.5, 1.0),
    C.cream,
    "faces",
    new THREE.Matrix4().makeTranslation(1.05, cabinY + 0.2, 0),
  );
  top.add(
    new THREE.BoxGeometry(1.66, 0.09, 1.14),
    C.ink,
    nextInk(),
    new THREE.Matrix4().makeTranslation(1.05, cabinY + 0.49, 0),
  );
  // Binnacle: the compass stand, just aft of the cabin.
  top.add(
    new THREE.CylinderGeometry(0.11, 0.14, 0.34, 8),
    C.sun,
    nextInk(),
    new THREE.Matrix4().makeTranslation(2.2, HULL.deck(0.84) + 0.14, 0),
  );
  const topMesh = new THREE.Mesh(
    top.build(),
    createToonMaterial({ doubleSided: true }),
  );
  group.add(topMesh);

  /* Mast and pennant. */
  const mastX = -0.55;
  const mastBase = HULL.deck(0.41);
  const mastTop = 6.15;
  const rig = new InkBuilder();
  rig.add(
    new THREE.CylinderGeometry(0.06, 0.085, mastTop - mastBase, 8),
    C.ink,
    nextInk(),
    new THREE.Matrix4().makeTranslation(mastX, (mastTop + mastBase) / 2, 0),
  );
  rig.tri(
    [mastX, mastTop - 0.04, 0],
    [mastX + 0.95, mastTop - 0.24, 0],
    [mastX, mastTop - 0.46, 0],
    C.sun,
    nextInk(),
  );
  const rigMesh = new THREE.Mesh(
    rig.build(),
    createToonMaterial({ doubleSided: true }),
  );
  group.add(rigMesh);

  /*
   * The sail: a half disc on the aft side of the mast — the bowl of the
   * logo's "P". Drawn as horizontal panels so its seams are inked.
   */
  const sail = new InkBuilder();
  const sailRadius = 2.15;
  const sailY = mastBase + 0.55 + sailRadius;
  const sailX = mastX + 0.2;
  const panels = 5;
  const arc = 20;
  const sailPoint = (angle: number, r: number): V => {
    const belly =
      Math.sin((r / sailRadius) * Math.PI * 0.5) * Math.cos(angle) * 0.42;
    return [sailX + Math.cos(angle) * r, sailY + Math.sin(angle) * r, belly];
  };
  for (let p = 0; p < panels; p++) {
    const ink = nextInk();
    const color = p % 2 === 0 ? C.vermilion : C.vermilionDeep;
    // Each panel is a horizontal slice of the half disc.
    const y0 = -sailRadius + (p / panels) * sailRadius * 2;
    const y1 = -sailRadius + ((p + 1) / panels) * sailRadius * 2;
    for (let k = 0; k < arc; k++) {
      const ya = y0 + ((y1 - y0) * k) / arc;
      const yb = y0 + ((y1 - y0) * (k + 1)) / arc;
      const xa = Math.sqrt(Math.max(0, sailRadius * sailRadius - ya * ya));
      const xb = Math.sqrt(Math.max(0, sailRadius * sailRadius - yb * yb));
      const steps = 6;
      for (let m = 0; m < steps; m++) {
        const u0 = m / steps;
        const u1 = (m + 1) / steps;
        const at = (x: number, y: number): V => {
          const r = Math.hypot(x, y);
          const angle = Math.atan2(y, x);
          return sailPoint(angle, r);
        };
        sail.quad(
          at(xa * u0, ya),
          at(xa * u1, ya),
          at(xb * u1, yb),
          at(xb * u0, yb),
          color,
          ink,
        );
      }
    }
  }
  const sailMesh = new THREE.Mesh(
    sail.build(true),
    createToonMaterial({ doubleSided: true }),
  );
  group.add(sailMesh);

  const xMin = -HULL.length / 2 - 0.1;
  const xMax = HULL.length / 2 + 0.1;

  function setBuild(progress: number): void {
    const p = Math.min(1, Math.max(0, progress));
    const phase = (from: number, to: number) =>
      Math.min(1, Math.max(0, (p - from) / (to - from)));

    // Keel is drawn from bow to stern.
    frameMesh.material.uniforms.uWipe.value =
      xMin + (xMax - xMin) * phase(0.0, 0.16);

    // Ribs rise one after another.
    const ribPhase = phase(0.1, 0.42);
    ribs.forEach((rib, index) => {
      const local = Math.min(1, Math.max(0, ribPhase * (ribCount + 2) - index));
      const eased = 1 - Math.pow(1 - local, 3);
      rib.scale.set(1, Math.max(0.0001, eased), 1);
      rib.position.y = HULL.keel(0.5) * (1 - eased);
      rib.visible = local > 0.001;
    });

    // Planking wipes over the frame.
    const plank = phase(0.38, 0.66);
    skinMesh.material.uniforms.uWipe.value = xMin + (xMax - xMin) * plank;
    skinMesh.visible = plank > 0.001;

    // Deck and cabin settle on.
    const deck = phase(0.62, 0.76);
    const deckEase = 1 - Math.pow(1 - deck, 3);
    topMesh.visible = deck > 0.001;
    topMesh.scale.set(1, Math.max(0.0001, deckEase), 1);
    topMesh.position.y = 0.86 * (1 - deckEase);

    // Mast steps up.
    const mast = phase(0.72, 0.86);
    const mastEase = 1 - Math.pow(1 - mast, 3);
    rigMesh.visible = mast > 0.001;
    rigMesh.scale.set(1, Math.max(0.0001, mastEase), 1);
    rigMesh.position.y = mastBase * (1 - mastEase);

    // Sail unfurls from the mast.
    const unfurl = phase(0.84, 1.0);
    const unfurlEase = 1 - Math.pow(1 - unfurl, 3);
    sailMesh.visible = unfurl > 0.001;
    sailMesh.scale.set(Math.max(0.0001, unfurlEase), 1, 1);
    sailMesh.position.x = sailX * (1 - unfurlEase);
  }

  setBuild(1);

  return {
    group,
    setBuild,
    halfLength: HULL.length / 2,
    anchors: {
      keel: new THREE.Vector3(-0.9, HULL.keel(0.36) + 0.02, 0),
      hull: new THREE.Vector3(-2.2, 0.35, 0.62),
      ballast: new THREE.Vector3(0.7, HULL.keel(0.6) + 0.18, 0),
      rigging: new THREE.Vector3(sailX + sailRadius * 0.72, sailY + 0.55, 0.2),
      compass: new THREE.Vector3(2.2, HULL.deck(0.84) + 0.36, 0),
      stores: new THREE.Vector3(1.05, cabinY + 0.2, 0.5),
    },
  };
}

/* ------------------------------------------------------------ lighthouse */

export type Lighthouse = {
  group: THREE.Group;
  /** The lamp's beam, rotated each frame. */
  beam: THREE.Mesh<THREE.BufferGeometry, ToonMaterial>;
  lampHeight: number;
};

const BEAM_FRAGMENT_PATCH = /* glsl */ `
  // The beam is drawn as hatching rather than as a transparent cone: a
  // flat illustration has no alpha, so light is shown the way a printmaker
  // shows it — as lines.
  float along = length(vLocal.xz);
  if (fract(along * 0.55 - vLocal.y * 0.0) > 0.5) discard;
`;

export function createLighthouse(): Lighthouse {
  const group = new THREE.Group();
  group.name = "lighthouse";

  const rock = new InkBuilder();
  const rockGeometry = new THREE.IcosahedronGeometry(1, 1);
  rockGeometry.scale(4.4, 1.9, 3.4);
  rock.add(
    rockGeometry,
    C.rock,
    "faces",
    new THREE.Matrix4().makeTranslation(0, -0.2, 0),
  );
  const rockTop = new THREE.IcosahedronGeometry(1, 0);
  rockTop.scale(2.2, 1.3, 1.9);
  rock.add(
    rockTop,
    C.rockLight,
    "faces",
    new THREE.Matrix4().makeTranslation(-0.4, 0.9, 0.2),
  );
  group.add(new THREE.Mesh(rock.build(), createToonMaterial()));

  const tower = new InkBuilder();
  const bands = 5;
  const height = 7.2;
  const base = 1.9;
  for (let i = 0; i < bands; i++) {
    const y0 = base + (i / bands) * height;
    const y1 = base + ((i + 1) / bands) * height;
    const r0 = 1.05 - (i / bands) * 0.4;
    const r1 = 1.05 - ((i + 1) / bands) * 0.4;
    tower.add(
      new THREE.CylinderGeometry(r1, r0, y1 - y0, 16, 1, true),
      i % 2 === 0 ? C.cream : C.vermilion,
      nextInk(),
      new THREE.Matrix4().makeTranslation(0, (y0 + y1) / 2, 0),
    );
  }
  const galleryY = base + height;
  tower.add(
    new THREE.CylinderGeometry(0.98, 0.98, 0.16, 16),
    C.ink,
    nextInk(),
    new THREE.Matrix4().makeTranslation(0, galleryY + 0.06, 0),
  );
  tower.add(
    new THREE.ConeGeometry(0.72, 0.8, 12),
    C.vermilion,
    nextInk(),
    new THREE.Matrix4().makeTranslation(0, galleryY + 1.55, 0),
  );
  group.add(new THREE.Mesh(tower.build(true), createToonMaterial()));

  // The lantern room glows: it ignores the scene's light.
  const lamp = new InkBuilder();
  lamp.add(
    new THREE.CylinderGeometry(0.56, 0.56, 1.0, 12),
    C.lamp,
    nextInk(),
    new THREE.Matrix4().makeTranslation(0, galleryY + 0.66, 0),
  );
  group.add(new THREE.Mesh(lamp.build(true), createToonMaterial({ glow: 1 })));

  const lampHeight = galleryY + 0.66;
  const beamBuilder = new InkBuilder();
  const beamInk = nextInk();
  const reach = 70;
  const spread = 7.5;
  beamBuilder.tri(
    [0, 0, 0],
    [reach, 1.6, spread],
    [reach, 1.6, -spread],
    C.lamp,
    beamInk,
  );
  beamBuilder.tri(
    [0, 0, 0],
    [reach, -2.2, -spread],
    [reach, -2.2, spread],
    C.lamp,
    beamInk,
  );
  const beamMaterial = createToonMaterial({ doubleSided: true, glow: 1 });
  beamMaterial.fragmentShader = beamMaterial.fragmentShader.replace(
    "if (uOpacity < 0.02) discard;",
    `if (uOpacity < 0.02) discard;\n${BEAM_FRAGMENT_PATCH}`,
  );
  const beam = new THREE.Mesh(beamBuilder.build(), beamMaterial);
  beam.position.y = lampHeight;
  beam.frustumCulled = false;
  group.add(beam);

  return { group, beam, lampHeight };
}

/* ------------------------------------------------------- buoys, islands */

export function createBuoy(color: RGB = C.vermilion): THREE.Mesh {
  const b = new InkBuilder();
  b.add(
    new THREE.CylinderGeometry(0.34, 0.4, 0.3, 10),
    C.cream,
    nextInk(),
    new THREE.Matrix4().makeTranslation(0, 0.1, 0),
  );
  b.add(
    new THREE.ConeGeometry(0.34, 0.95, 10),
    color,
    nextInk(),
    new THREE.Matrix4().makeTranslation(0, 0.72, 0),
  );
  b.add(
    new THREE.SphereGeometry(0.11, 8, 6),
    C.sun,
    nextInk(),
    new THREE.Matrix4().makeTranslation(0, 1.28, 0),
  );
  const mesh = new THREE.Mesh(b.build(true), createToonMaterial());
  mesh.name = "buoy";
  return mesh;
}

/** A low headland on the horizon, for depth. Seeded so it is the same every load. */
export function createIsland(
  seed: number,
  width: number,
  height: number,
): THREE.Mesh {
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const position = geometry.getAttribute("position");
  let state = seed * 9301 + 49297;
  const random = () => {
    state = (state * 233280 + 49297) % 2147483647;
    return (state % 1000) / 1000;
  };
  // Nudge vertices by a hash of their position, so shared corners move together.
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const n =
      Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed) * 43758.5453;
    const jitter = 0.82 + (n - Math.floor(n)) * 0.36;
    position.setXYZ(i, x * jitter, Math.max(-0.1, y) * jitter, z * jitter);
  }
  geometry.scale(width, height, width * (0.45 + random() * 0.25));
  const b = new InkBuilder();
  // One ink region: at this distance a headland is a silhouette. Inking
  // every facet turns it into a wireframe.
  b.add(geometry, C.island, nextInk());
  const mesh = new THREE.Mesh(b.build(), createToonMaterial());
  mesh.name = "island";
  return mesh;
}
