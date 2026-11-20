/**
 * The sheet, the paper boat folded from it, and the pieces it is cut into.
 *
 * The opening on the home page (components/intro) folds a sheet into a
 * paper boat in three moves: the top half goes back, then the two flanks
 * of the sail, then the lower corners and the foot. This page runs the same
 * folds backwards. The pieces are the opening's, cut along the same lines
 * in the same proportions (sail 0.25 of the boat's length, hull 0.2, keel
 * 0.61), so the boat on this page is the boat from the opening.
 *
 * Everything is in sheet units: the sheet is W × H (3 : 2) and is drawn,
 * cut and folded in those units. The page scales the whole thing, so
 * nothing here knows about pixels.
 *
 * Every horizontal cut sits on one of the paper's ruled lines (rules every
 * 30 units from y = 20), so a seam left by a cut hides inside a rule.
 */

export const W = 1500;
export const H = 1000;

/** The ruled lines: every RULE units, starting at RULE_START. */
export const RULE = 30;
export const RULE_START = 20;

/** Centre line of the boat, and the heights of its sail tip, rim and keel. */
export const CX = 750;
export const TIP = 440;
export const RIM = 590;
export const KEEL = 710;
/** Half the rim, half the keel, half the sail's foot. */
export const RIM_HALF = 300;
export const KEEL_HALF = 184;
export const SAIL_HALF = 84;

export type Pt = readonly [number, number];

/** 0: lower corners and foot; 1: the sail's flanks; 2: the top half. */
export type FoldIndex = 0 | 1 | 2;
export const FOLD_COUNT = 3;

export type PieceSpec = {
  id: string;
  /** null for the two pieces that are the boat and never move. */
  fold: FoldIndex | null;
  poly: readonly Pt[];
  /** The crease it turns about. */
  hinge?: readonly [Pt, Pt];
  /**
   * Folded over the front rather than tucked behind. The flaps that open
   * after the foot has would otherwise swing out behind paper that is
   * already flat, and be hidden for half their travel; over the front,
   * they lift toward the viewer and are seen the whole way.
   */
  forward?: boolean;
};

const PIECE_LIST: readonly PieceSpec[] = [
  {
    id: "leaf",
    fold: 2,
    poly: [
      [0, 0],
      [W, 0],
      [W, TIP],
      [0, TIP],
    ],
    hinge: [
      [0, TIP],
      [W, TIP],
    ],
    forward: true,
  },
  {
    id: "tl",
    fold: 1,
    poly: [
      [0, TIP],
      [CX, TIP],
      [CX - SAIL_HALF, RIM],
      [0, RIM],
    ],
    hinge: [
      [CX, TIP],
      [CX - SAIL_HALF, RIM],
    ],
    forward: true,
  },
  {
    id: "tr",
    fold: 1,
    poly: [
      [CX, TIP],
      [W, TIP],
      [W, RIM],
      [CX + SAIL_HALF, RIM],
    ],
    hinge: [
      [CX, TIP],
      [CX + SAIL_HALF, RIM],
    ],
    forward: true,
  },
  {
    id: "bl",
    fold: 0,
    poly: [
      [0, RIM],
      [CX - RIM_HALF, RIM],
      [CX - KEEL_HALF, KEEL],
      [0, KEEL],
    ],
    hinge: [
      [CX - RIM_HALF, RIM],
      [CX - KEEL_HALF, KEEL],
    ],
  },
  {
    id: "br",
    fold: 0,
    poly: [
      [CX + RIM_HALF, RIM],
      [W, RIM],
      [W, KEEL],
      [CX + KEEL_HALF, KEEL],
    ],
    hinge: [
      [CX + RIM_HALF, RIM],
      [CX + KEEL_HALF, KEEL],
    ],
  },
  {
    id: "foot",
    fold: 0,
    poly: [
      [0, KEEL],
      [W, KEEL],
      [W, H],
      [0, H],
    ],
    hinge: [
      [0, KEEL],
      [W, KEEL],
    ],
  },
  {
    id: "sail",
    fold: null,
    poly: [
      [CX, TIP],
      [CX + SAIL_HALF, RIM],
      [CX - SAIL_HALF, RIM],
    ],
  },
  {
    id: "hull",
    fold: null,
    poly: [
      [CX - RIM_HALF, RIM],
      [CX + RIM_HALF, RIM],
      [CX + KEEL_HALF, KEEL],
      [CX - KEEL_HALF, KEEL],
    ],
  },
];

/** What the page needs to place one piece and turn it. */
export type Piece = {
  id: string;
  fold: FoldIndex | null;
  /** Box, as percentages of the sheet. */
  box: { left: string; top: string; width: string; height: string };
  /** The piece's outline, as a clip-path on its box. */
  clip: string;
  /** Where the full sheet sits inside the box (for the paper and drawing). */
  inner: { left: string; top: string; width: string; height: string };
  /** The crease: a point on it (transform-origin) and its direction. */
  origin: string;
  ux: number;
  uy: number;
  /** The angle that folds it back out of sight, in degrees (±180). */
  folded: number;
  /** A trace of shade the panel keeps once it is flat again. */
  rest: number;
};

const pct = (n: number) => `${+n.toFixed(4)}%`;

/** A flat panel is never quite as flat as it was before it was folded. */
const REST: Record<string, number> = {
  leaf: 0.035,
  tl: 0.02,
  tr: 0.026,
  bl: 0.03,
  br: 0.018,
  foot: 0.04,
};

function build(spec: PieceSpec): Piece {
  const xs = spec.poly.map((p) => p[0]);
  const ys = spec.poly.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  const bw = Math.max(...xs) - x0;
  const bh = Math.max(...ys) - y0;
  const clip = `polygon(${spec.poly
    .map(
      ([x, y]) => `${pct(((x - x0) / bw) * 100)} ${pct(((y - y0) / bh) * 100)}`,
    )
    .join(", ")})`;

  let origin = "50% 50%";
  let ux = 1;
  let uy = 0;
  let folded = 0;
  if (spec.hinge) {
    const [[ax, ay], [bx, by]] = spec.hinge;
    const len = Math.hypot(bx - ax, by - ay);
    ux = (bx - ax) / len;
    uy = (by - ay) / len;
    origin = `${pct(((ax - x0) / bw) * 100)} ${pct(((ay - y0) / bh) * 100)}`;
    // Which way is "back": a turn about u by θ moves a point d off the
    // crease to z ∝ (u × d)·sin θ, and back (away from the viewer) is -z.
    const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
    const cross = ux * (cy - ay) - uy * (cx - ax);
    folded = (cross > 0 ? -180 : 180) * (spec.forward ? -1 : 1);
  }

  return {
    id: spec.id,
    fold: spec.fold,
    box: {
      left: pct((x0 / W) * 100),
      top: pct((y0 / H) * 100),
      width: pct((bw / W) * 100),
      height: pct((bh / H) * 100),
    },
    clip,
    inner: {
      left: pct((-x0 / bw) * 100),
      top: pct((-y0 / bh) * 100),
      width: pct((W / bw) * 100),
      height: pct((H / bh) * 100),
    },
    origin,
    ux: +ux.toFixed(5),
    uy: +uy.toFixed(5),
    folded,
    rest: REST[spec.id] ?? 0,
  };
}

export const PIECES: readonly Piece[] = PIECE_LIST.map(build);

/** The creases each fold leaves on the sheet once it is opened. */
export const CREASES: readonly (readonly (readonly [Pt, Pt])[])[] = [
  [
    [
      [CX - RIM_HALF, RIM],
      [CX - KEEL_HALF, KEEL],
    ],
    [
      [CX + RIM_HALF, RIM],
      [CX + KEEL_HALF, KEEL],
    ],
    [
      [0, KEEL],
      [W, KEEL],
    ],
  ],
  [
    [
      [CX, TIP],
      [CX - SAIL_HALF, RIM],
    ],
    [
      [CX, TIP],
      [CX + SAIL_HALF, RIM],
    ],
  ],
  [
    [
      [0, TIP],
      [W, TIP],
    ],
  ],
];

/*
 * The view. Folded, the boat is shown larger than it sits on the sheet and
 * centred in the frame; as it opens the frame draws back to the sheet.
 * These are the vertical centres (sheet units) of what is showing at each
 * stage, and the zoom on the folded boat.
 */
export const VIEW = {
  zoom: 1.4,
  /** The boat: sail tip to keel. */
  boat: (TIP + KEEL) / 2,
  /** After folds 1 and 2: the sail tip to the foot of the sheet. */
  lower: (TIP + H) / 2,
  /** Flat. */
  full: H / 2,
} as const;
