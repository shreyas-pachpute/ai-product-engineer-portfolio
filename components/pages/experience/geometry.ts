/**
 * Where things are on the chart, for each shape of chart.
 *
 *   wide   a desktop or a tablet: a sheet a little taller than it is wide
 *   tall   a phone held upright: a long strip, the track running down it
 *   land   a phone held sideways: a long strip, the track running across
 *
 * Coordinates are in each chart's own units (its SVG viewBox). The art is
 * drawn from them on the server; the buttons, the cartouche and the
 * dividers are positioned from the same numbers as fractions of the sheet,
 * so the drawing and the controls cannot drift apart.
 *
 * The legs are not drawn to scale: each is long enough to hold its fixes
 * at a fingertip apart, and its months are written on it instead.
 */

export type LayoutId = "wide" | "tall" | "land";
export const LAYOUTS: readonly LayoutId[] = ["wide", "tall", "land"];

export type Pt = readonly [number, number];
export type Box = { x: number; y: number; w: number; h: number };
export type Side = "left" | "right" | "above" | "below";

export type ChartLayout = {
  id: LayoutId;
  w: number;
  h: number;
  ports: readonly Pt[];
  /** Per leg, the fixes, evenly spaced along it. */
  fixes: readonly (readonly Pt[])[];
  /** Which side of each port its date is written on. */
  tags: readonly Side[];
  /** Where the harbour's name is written, on the land. */
  harbour: Pt;
  /** The quay the track leaves from, inside the harbour. */
  quay: Pt;
  rose: { x: number; y: number; r: number };
  /** Null where the cartouche sits above the chart instead of on it. */
  cartouche: Box | null;
  legend: Box;
  /** The coast runs along this edge of the sheet. */
  coast: "top" | "left";
};

/** The inside of the neat line: nothing is drawn or placed beyond it. */
export const FRAME = 16;

type Spec = {
  w: number;
  h: number;
  /** Ports for any number of legs: the first, the last, and a zig-zag. */
  port: (index: number, count: number) => Pt;
  tag: (index: number, count: number) => Side;
  harbour: Pt;
  rose: { x: number; y: number; r: number };
  cartouche: Box | null;
  legend: Box;
  coast: "top" | "left";
};

function zig(
  index: number,
  count: number,
  from: number,
  to: number,
  near: number,
  far: number,
): [number, number] {
  const along = count === 0 ? from : from + ((to - from) * index) / count;
  const across = index % 2 === 0 ? near + 14 * index : far;
  return [along, across];
}

const SPECS: Record<LayoutId, Spec> = {
  wide: {
    w: 600,
    h: 880,
    port: (i, n) => {
      const [y, x] = zig(i, n, 300, 790, 205, 458);
      return [x + (i === n && i % 2 === 0 ? 17 : 0), y];
    },
    tag: (i) => (i % 2 === 0 ? "left" : "right"),
    harbour: [86, 162],
    rose: { x: 116, y: 690, r: 66 },
    cartouche: { x: 336, y: 36, w: 244, h: 176 },
    legend: { x: 34, y: 832, w: 300, h: 30 },
    coast: "top",
  },
  tall: {
    w: 400,
    h: 1040,
    port: (i, n) => {
      const [y, x] = zig(i, n, 300, 960, 128, 262);
      return [x, y];
    },
    tag: (i, n) => (i === n ? "right" : i % 2 === 0 ? "left" : "right"),
    harbour: [292, 112],
    rose: { x: 86, y: 842, r: 54 },
    cartouche: null,
    legend: { x: 28, y: 1000, w: 344, h: 26 },
    coast: "top",
  },
  land: {
    w: 1100,
    h: 440,
    port: (i, n) => {
      const [x, y] = zig(i, n, 255, 1022, 255, 132);
      return [x, y];
    },
    tag: (i) => (i % 2 === 0 ? "below" : "above"),
    harbour: [78, 118],
    rose: { x: 852, y: 352, r: 54 },
    cartouche: { x: 292, y: 300, w: 352, h: 124 },
    legend: { x: 330, y: 26, w: 330, h: 22 },
    coast: "left",
  },
};

export function chartLayout(
  id: LayoutId,
  fixCounts: readonly number[],
): ChartLayout {
  const spec = SPECS[id];
  const legs = fixCounts.length;
  const ports = Array.from({ length: legs + 1 }, (_, i) => spec.port(i, legs));
  const fixes = fixCounts.map((count, leg) => {
    const [ax, ay] = ports[leg]!;
    const [bx, by] = ports[leg + 1]!;
    return Array.from({ length: count }, (_, k): Pt => {
      const f = (k + 1) / (count + 1);
      return [ax + (bx - ax) * f, ay + (by - ay) * f];
    });
  });
  const first = ports[0]!;
  return {
    id,
    w: spec.w,
    h: spec.h,
    ports,
    fixes,
    tags: ports.map((_, i) => spec.tag(i, legs)),
    harbour: spec.harbour,
    // The quay is inside the bay that opens toward the first port.
    quay: spec.coast === "top" ? [first[0], 118] : [118, first[1]],
    rose: spec.rose,
    cartouche: spec.cartouche,
    legend: spec.legend,
    coast: spec.coast,
  };
}

/** A position as CSS custom properties, one pair per layout. */
export function placeVars(
  layouts: readonly ChartLayout[],
  pick: (layout: ChartLayout) => Pt,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const layout of layouts) {
    const [x, y] = pick(layout);
    vars[`--x-${layout.id}`] = (x / layout.w).toFixed(5);
    vars[`--y-${layout.id}`] = (y / layout.h).toFixed(5);
  }
  return vars;
}
