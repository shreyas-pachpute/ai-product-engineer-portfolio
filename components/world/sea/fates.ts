/**
 * Six ways a paper boat goes down.
 *
 * In the paper chapter the reader can lean on a boat: pick one of six
 * pressures a real product has to survive, and watch what it does to a
 * demo. Each pressure is the absence of one part of the ship in the next
 * chapter, and each sinks the boat the way a hull without that part would
 * actually fail:
 *
 *   0  keel      evals             it cannot hold a course: tighter and
 *                                  tighter circles, then it noses under
 *   1  ballast   guardrails        one shove and it stays over, floods,
 *                                  and goes down on its side
 *   2  hull      architecture      it settles under the load, shudders,
 *                                  and folds across the middle
 *   3  stores    cost and latency  the paper soaks through, goes limp,
 *                                  and sinks as a flat sheet
 *   4  compass   observability     mist closes over it; when the mist
 *                                  lifts there is a ripple and no boat
 *   5  rigging   interface         a gust it has no way to use carries it
 *                                  off, tumbling, and drops it face down
 *
 * The order is the order of ANATOMY in lib/site.ts.
 *
 * Nothing here draws anything. `stepFate` is the choreography: given how
 * long a boat has been going down, it says how far it has moved, turned,
 * heeled and sunk, how wet and how limp the paper is, and when to send a
 * ring out across the water. The world adds that to where the sea already
 * puts the boat, so a sinking boat still rides the same waves as the rest.
 */

export const FATE_COUNT = 6;

/** How long each takes, start to gone, in seconds. */
export const FATE_SECONDS: readonly number[] = [4.7, 3.9, 4.3, 5.6, 4.9, 3.9];

/** When the boat is past saving: the page then says what would have held. */
export const FATE_TOLD: readonly number[] = [3.6, 2.5, 2.3, 4.1, 3.3, 2.8];

/** What a boat has done so far while going down. Accumulates. */
export type FateState = {
  /** Travelled from where it was pressed, metres. */
  x: number;
  z: number;
  /** Turned, radians. */
  yaw: number;
  /** Tumbled, radians. */
  spin: number;
  /** Rings already sent out. */
  rings: number;
};

export function createFateState(): FateState {
  return { x: 0, z: 0, yaw: 0, spin: 0, rings: 0 };
}

export function resetFateState(state: FateState): void {
  state.x = state.z = state.yaw = state.spin = state.rings = 0;
}

/** Where the boat is in its sinking, this frame. */
export type FatePose = {
  /** Below (and above) where the water would hold it, metres. */
  sink: number;
  lift: number;
  /** Added to the tilt the waves give it, radians. */
  roll: number;
  pitch: number;
  /** 0–1: how much of the waves' tilt it still follows. */
  follow: number;
  /** 0–1: how far up the paper the water has climbed. */
  soak: number;
  /** 0–1: how far the folds have given up. */
  limp: number;
  /** Radians: how far bow and stern have hinged up round a broken middle. */
  bend: number;
  /** 0–1: mist over the whole scene. */
  mist: number;
  /** Not drawn (lost in the mist). */
  hidden: boolean;
  /** Strength of a ring to send out this frame; 0 for none. */
  ring: number;
  /** Where along the hull the ring starts: 1 bow, 0 amidships. */
  ringAt: number;
  done: boolean;
};

export function createFatePose(): FatePose {
  return {
    sink: 0,
    lift: 0,
    roll: 0,
    pitch: 0,
    follow: 1,
    soak: 0,
    limp: 0,
    bend: 0,
    mist: 0,
    hidden: false,
    ring: 0,
    ringAt: 0,
    done: false,
  };
}

export function clearFatePose(pose: FatePose): void {
  pose.sink = pose.lift = pose.roll = pose.pitch = 0;
  pose.follow = 1;
  pose.soak = pose.limp = pose.bend = pose.mist = 0;
  pose.hidden = false;
  pose.ring = pose.ringAt = 0;
  pose.done = false;
}

/** 0 before `a`, 1 after `b`, eased between. */
function ramp(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Sends one ring, the first time `u` passes `at`. */
function ringOnce(
  state: FateState,
  pose: FatePose,
  index: number,
  at: number,
  u: number,
  strength: number,
  where = 0,
): void {
  if (u >= at && state.rings <= index) {
    state.rings = index + 1;
    pose.ring = strength;
    pose.ringAt = where;
  }
}

/**
 * Advances a sinking by `dt` seconds.
 *
 * @param kind     which of the six
 * @param u        seconds since the boat was pressed
 * @param heading  the way the bow points (the boat's yaw), radians
 * @param windX    the direction the wind blows toward, a unit vector
 * @param side     +1 or -1: which way this particular boat goes over
 */
export function stepFate(
  kind: number,
  u: number,
  dt: number,
  heading: number,
  windX: number,
  windZ: number,
  side: number,
  state: FateState,
  pose: FatePose,
): void {
  clearFatePose(pose);
  const total = FATE_SECONDS[kind] ?? 4;

  if (kind === 0) {
    /* No keel. It sets off sure of itself, cannot hold the line, and
       turns: wide at first, then tighter and faster, heeling out of the
       turn, until the bow digs in and it goes down nose first. */
    const drive = ramp(0, 0.7, u) * (1 - ramp(3.0, 3.7, u));
    const rate = (1.3 + 3.3 * ramp(0.2, 3.1, u)) * (1 - ramp(3.4, 4.1, u));
    state.yaw += side * rate * dt;
    const way = heading + state.yaw;
    state.x += Math.cos(way) * 0.19 * drive * dt;
    state.z += -Math.sin(way) * 0.19 * drive * dt;
    pose.roll = -side * 0.4 * ramp(0.3, 2.6, u) * drive;
    const dive = ramp(3.0, 3.75, u);
    pose.pitch = -1.3 * dive;
    pose.sink = 0.018 * dive + 0.21 * ramp(3.5, total, u);
    pose.soak = ramp(3.0, 4.2, u);
    pose.follow = 1 - 0.7 * dive;
    ringOnce(state, pose, 0, 3.2, u, 1, 1);
  } else if (kind === 1) {
    /* No ballast. One shove puts it on its side, and nothing low down
       brings it back: it tries, twice, feebly, then the water comes in
       over the rim and it slides under the way it lies. */
    const flop = 1 - Math.exp(-u * 8) * Math.cos(u * 12);
    const tries =
      0.09 *
      Math.sin((u - 0.6) * 5.2) *
      ramp(0.6, 0.9, u) *
      (1 - ramp(1.5, 2, u));
    pose.roll = side * (1.36 * flop - tries + 0.55 * ramp(1.9, 3.6, u));
    // Pushed bodily sideways by the shove, a hand's width.
    const push = 0.085 * Math.exp(-u * 4.5) * dt * 4.5;
    state.x += Math.sin(heading) * side * push;
    state.z += Math.cos(heading) * side * push;
    pose.sink = 0.01 * ramp(0.15, 0.8, u) + 0.2 * ramp(1.9, total, u);
    pose.soak = ramp(0.7, 2.6, u);
    pose.follow = 1 - 0.75 * ramp(0, 0.4, u);
    ringOnce(state, pose, 0, 0.1, u, 0.75);
    ringOnce(state, pose, 1, 2.1, u, 0.6);
  } else if (kind === 2) {
    /* No hull to speak of. The load comes on and it rides lower and lower,
       shuddering; then the middle gives, bow and stern come up, and it
       goes down folded. */
    const load = ramp(0, 1.5, u);
    const holding = 1 - ramp(1.5, 1.8, u);
    pose.sink = 0.024 * load;
    pose.roll = 0.035 * Math.sin(u * 31) * load * holding;
    pose.pitch = 0.022 * Math.sin(u * 23 + 1) * load * holding;
    const snap = ramp(1.55, 1.95, u);
    pose.bend = 0.95 * snap * snap + 0.32 * ramp(2.2, 4, u);
    pose.sink += 0.028 * snap + 0.2 * ramp(2.3, total, u);
    pose.roll += side * 0.25 * ramp(2.4, total, u);
    pose.soak = ramp(0.5, 3, u);
    pose.follow = 1 - 0.6 * snap;
    ringOnce(state, pose, 0, 1.75, u, 1.2);
  } else if (kind === 3) {
    /* Nothing in the stores. The slow one: the water climbs the paper,
       fold by fold; it rides heavier and answers the waves more slowly;
       then the folds let go, it lies down flat, and the sheet sinks,
       rocking, the way a leaf does. */
    pose.soak = ramp(0, 3, u);
    pose.sink = 0.011 * ramp(0.5, 3, u);
    pose.follow = 1 - 0.55 * ramp(1, 3, u);
    pose.limp = ramp(2.5, 3.9, u);
    const leaf = ramp(3.6, 4.2, u);
    pose.roll = side * 0.22 * Math.sin((u - 3.6) * 2.6) * leaf;
    pose.pitch = 0.16 * Math.sin((u - 3.6) * 1.9 + 1) * leaf;
    state.x += Math.cos(heading) * 0.02 * Math.cos((u - 3.6) * 2.6) * leaf * dt;
    pose.sink += 0.15 * ramp(3.9, total, u);
    ringOnce(state, pose, 0, 4.0, u, 0.5);
  } else if (kind === 4) {
    /* No compass. Mist comes down. It was already listing when the mist
       took it; nobody saw the rest. When the air clears there is a ring
       spreading on the water, and that is all. */
    pose.mist = ramp(0, 1.5, u) * (1 - ramp(2.9, 4.6, u));
    pose.roll = side * 0.5 * ramp(0.5, 1.7, u);
    pose.sink = 0.03 * ramp(0.8, 1.9, u);
    pose.soak = ramp(0.6, 2, u);
    pose.hidden = u >= 2.1;
    ringOnce(state, pose, 0, 2.75, u, 1);
  } else {
    /* No rigging. A gust arrives and there is nothing to turn it into
       direction: it takes the boat by the sail, lays it over, and bowls
       it away downwind, hopping; it lands face down, a long way from
       where anyone wanted it. */
    // Broadside to the wind, so that going over is going downwind.
    const want = Math.atan2(-windX, -windZ);
    let turn = want - (heading + state.yaw);
    turn = Math.atan2(Math.sin(turn), Math.cos(turn));
    if (Math.abs(turn) > Math.PI / 2) turn -= Math.sign(turn) * Math.PI;
    state.yaw += turn * (1 - Math.exp(-dt * 7));
    const way = heading + state.yaw;
    // +roll tips the mast to starboard; find which side is downwind.
    const lee = Math.sin(way) * windX + Math.cos(way) * windZ >= 0 ? 1 : -1;
    const speed =
      1.2 * ramp(0, 0.25, u) * Math.exp(-Math.max(0, u - 0.25) * 1.2);
    state.x += windX * speed * dt;
    state.z += windZ * speed * dt;
    state.spin += (speed / 0.07) * 0.6 * dt;
    // Comes to rest the wrong way up.
    const rest =
      Math.round((state.spin - Math.PI) / (2 * Math.PI)) * 2 * Math.PI +
      Math.PI;
    const settled = ramp(2.1, 2.8, u);
    pose.roll = lee * (state.spin + (rest - state.spin) * settled);
    pose.lift = 0.04 * Math.abs(Math.sin(state.spin)) * (speed / 1.2);
    pose.follow = 1 - ramp(0, 0.3, u) * (1 - settled * 0.5);
    pose.soak = ramp(1.4, 3, u);
    pose.sink = 0.16 * ramp(2.8, total, u);
    ringOnce(state, pose, 0, 2.2, u, 0.7);
  }

  pose.done = u >= total;
}
