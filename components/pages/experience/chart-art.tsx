import type { ReactNode } from "react";
import { FRAME, type ChartLayout, type Pt } from "./geometry";
import type { Voyage } from "./voyage";

/**
 * The chart itself: paper, border, graticule, the coast of the harbour of
 * departure with its depth contours, soundings, a compass rose and the
 * pencilled track. Drawn once, on the server, and never touched again, so
 * it costs nothing after the first paint. Decoration only (aria-hidden):
 * every fact on it is also in the buttons and the log.
 *
 * The soundings are made-up depths, set the way a chart sets them. They
 * stand for nothing and claim nothing; they are texture.
 */

/* Deterministic randomness, so the server and every visit draw the same. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smooth(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function path(points: readonly Pt[], close = false): string {
  return (
    points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${r1(x)} ${r1(y)}`)
      .join("") + (close ? "Z" : "")
  );
}

function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2),
  );
  return Math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dy * t));
}

/* The coast ------------------------------------------------------------- */

type Coast = {
  /** Along the edge the coast follows (x for "top", y for "left"). */
  length: number;
  /** How far the land reaches in from that edge, at s. */
  depth: (s: number) => number;
  /** A point from (along, in-from-edge) coordinates. */
  at: (s: number, d: number) => Pt;
  /** The middle of the bay the track leaves from. */
  bay: number;
  /** Half the width of the bay. */
  bayWidth: number;
};

function coastOf(layout: ChartLayout): Coast {
  const first = layout.ports[0]!;
  const top = layout.coast === "top";
  const bay = top ? first[0] : first[1];
  const wobble = (s: number, k: number) =>
    6.5 * Math.sin(s * 0.043 + 1.3 * k) +
    3.4 * Math.sin(s * 0.107 + 0.4 + k) +
    1.6 * Math.sin(s * 0.29 + 2.1 * k) +
    0.8 * Math.sin(s * 0.71 + 0.2);
  let base: (s: number) => number;
  let bayWidth = 30;
  let bayDepth = 70;
  if (layout.id === "wide") {
    base = (s) => 340 * (1 - smooth(-40, 500, s)) - 10;
    bayWidth = 58;
    bayDepth = 62;
  } else if (layout.id === "tall") {
    base = (s) => 232 - 60 * (s / 400) - 36 * smooth(250, 400, s);
    bayWidth = 52;
    bayDepth = 62;
  } else {
    base = (s) => 176 + 16 * Math.sin(s * 0.012 + 0.6);
    bayWidth = 50;
    bayDepth = 56;
  }
  // The coast levels off around the bay, and the bay is a rounded basin, so
  // the harbour reads as a harbour and not a crack in the cliff.
  const level = (s: number) => {
    const flat = Math.exp(-(((s - bay) / 92) ** 2));
    return base(s) * (1 - flat) + base(bay) * flat;
  };
  const basin = (s: number) => {
    const u = (s - bay) / bayWidth;
    return Math.abs(u) < 1 ? bayDepth * (1 - u * u) ** 2 : 0;
  };
  return {
    length: top ? layout.w : layout.h,
    depth: (s) =>
      level(s) -
      basin(s) +
      wobble(s, 1) * (1 - 0.7 * Math.exp(-(((s - bay) / 40) ** 2))),
    at: (s, d) => (top ? [s, d] : [d, s]),
    bay,
    bayWidth,
  };
}

function coastLine(coast: Coast, offset: number, k: number, step = 4): Pt[] {
  const points: Pt[] = [];
  for (let s = -8; s <= coast.length + 8; s += step) {
    const extra =
      offset === 0
        ? 0
        : offset +
          Math.sign(offset) *
            (2.5 * Math.sin(s * 0.06 + k) + 1.5 * Math.sin(s * 0.17 + 2 * k));
    points.push(coast.at(s, coast.depth(s) + extra));
  }
  return points;
}

/** The band between two lines along the coast, as one closed shape. */
function band(a: Pt[], b: Pt[]): string {
  return path([...a, ...[...b].reverse()], true);
}

/* The compass rose -------------------------------------------------------- */

function Rose({ x, y, r }: { x: number; y: number; r: number }) {
  const ticks: string[] = [];
  for (let deg = 0; deg < 360; deg += 5) {
    const a = ((deg - 90) * Math.PI) / 180;
    const long = deg % 30 === 0 ? 8 : deg % 10 === 0 ? 5.5 : 3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    ticks.push(
      `M${r1(x + c * r)} ${r1(y + s * r)}L${r1(x + c * (r - long))} ${r1(y + s * (r - long))}`,
    );
  }
  const inner = r * 0.64;
  for (let deg = 0; deg < 360; deg += 10) {
    const a = ((deg - 90) * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    ticks.push(
      `M${r1(x + c * inner)} ${r1(y + s * inner)}L${r1(x + c * (inner - 3.5))} ${r1(y + s * (inner - 3.5))}`,
    );
  }
  const labels = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const star: ReactNode[] = [];
  const points = [0, 45, 90, 135, 180, 225, 270, 315];
  for (const deg of points) {
    const cardinal = deg % 90 === 0;
    const len = cardinal ? r * 0.6 : r * 0.36;
    const half = cardinal ? r * 0.085 : r * 0.07;
    const a = ((deg - 90) * Math.PI) / 180;
    const tip: Pt = [x + Math.cos(a) * len, y + Math.sin(a) * len];
    const left: Pt = [
      x + Math.cos(a - Math.PI / 2) * half,
      y + Math.sin(a - Math.PI / 2) * half,
    ];
    const right: Pt = [
      x + Math.cos(a + Math.PI / 2) * half,
      y + Math.sin(a + Math.PI / 2) * half,
    ];
    star.push(
      <path
        key={`${deg}a`}
        className="rk-a-star-dark"
        d={path([[x, y], left, tip], true)}
      />,
      <path
        key={`${deg}b`}
        className="rk-a-star-light"
        d={path([[x, y], right, tip], true)}
      />,
    );
  }
  return (
    <g className="rk-a-rose">
      <circle className="rk-a-rose-ring" cx={x} cy={y} r={r} />
      <circle className="rk-a-rose-ring" cx={x} cy={y} r={r - 9} />
      <circle className="rk-a-rose-ring rk-a-thin" cx={x} cy={y} r={inner} />
      <path className="rk-a-rose-ticks" d={ticks.join("")} />
      {labels.map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180;
        const lr = r - 15.5;
        return (
          <text
            key={deg}
            className="rk-a-rose-num"
            x={r1(x + Math.cos(a) * lr)}
            y={r1(y + Math.sin(a) * lr)}
            transform={`rotate(${deg} ${r1(x + Math.cos(a) * lr)} ${r1(y + Math.sin(a) * lr)})`}
          >
            {deg}
          </text>
        );
      })}
      {star}
      <circle className="rk-a-star-hub" cx={x} cy={y} r={r * 0.05} />
      {/* North: the one pennant on the rose. */}
      <path
        className="rk-a-north"
        d={path(
          [
            [x - 5, y - r - 3],
            [x + 5, y - r - 3],
            [x, y - r - 17],
          ],
          true,
        )}
      />
    </g>
  );
}

/* The chart --------------------------------------------------------------- */

export function ChartArt({
  layout,
  voyage,
}: {
  layout: ChartLayout;
  voyage: Voyage;
}) {
  const { w, h, ports } = layout;
  const rand = random(
    layout.id === "wide" ? 7 : layout.id === "tall" ? 19 : 31,
  );
  const coast = coastOf(layout);
  const shore = coastLine(coast, 0, 0, 3);
  const c5 = coastLine(coast, 14, 0.7);
  const c10 = coastLine(coast, 30, 1.9);
  const c20 = coastLine(coast, 58, 3.1);
  const hill1 = coastLine(coast, -26, 0.4);
  const hill2 = coastLine(coast, -62, 2.4);
  const landEdge: Pt[] =
    layout.coast === "top"
      ? [
          [w + 8, -8],
          [-8, -8],
        ]
      : [
          [-8, h + 8],
          [-8, -8],
        ];
  const land = path([...shore, ...landEdge], true);
  const top = layout.coast === "top";

  // The harbour: a quay inside the bay, two breakwaters across its mouth,
  // a light on the end of one, and the town's blocks around it.
  const bayFloor = coast.depth(coast.bay);
  const quay = coast.at(coast.bay, bayFloor + 10);
  // Both arms reach out to one line across the mouth, leaving a gap.
  const rootS = (side: -1 | 1) => coast.bay + side * coast.bayWidth * 0.95;
  const across = (coast.depth(rootS(-1)) + coast.depth(rootS(1))) / 2 + 12;
  const mouth = (side: -1 | 1): [Pt, Pt] => {
    const s = rootS(side);
    return [
      coast.at(s, coast.depth(s) + 1.5),
      coast.at(coast.bay + side * 12, across),
    ];
  };
  const [breakA0, breakA1] = mouth(-1);
  const [breakB0, breakB1] = mouth(1);
  const blocks: Pt[] = [];
  for (let i = 0; i < 60 && blocks.length < 13; i++) {
    const s = coast.bay + (rand() - 0.5) * 170;
    const d = coast.depth(s) - 12 - rand() * 46;
    if (d < FRAME + 6) continue;
    const p = coast.at(s, d);
    if (blocks.some((b) => Math.hypot(b[0] - p[0], b[1] - p[1]) < 11)) continue;
    if (Math.hypot(p[0] - layout.harbour[0], p[1] - layout.harbour[1]) < 46)
      continue;
    blocks.push(p);
  }

  // The track: departure from the quay (pilotage, dashed), then the legs.
  const first = ports[0]!;
  const legs = ports.slice(1).map((p, i): [Pt, Pt] => [ports[i]!, p]);
  const arrows = legs.map(([a, b]) => {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const at: Pt = [a[0] + (b[0] - a[0]) * 0.5, a[1] + (b[1] - a[1]) * 0.5];
    const back = (side: number): Pt => [
      at[0] - Math.cos(ang + side * 0.42) * 11,
      at[1] - Math.sin(ang + side * 0.42) * 11,
    ];
    return path([back(-1), at, back(1)]);
  });

  // Soundings: scattered over open water, clear of everything that is read.
  const busy = (p: Pt, pad: number): boolean => {
    if (
      p[0] < FRAME + 14 ||
      p[1] < FRAME + 14 ||
      p[0] > w - FRAME - 14 ||
      p[1] > h - FRAME - 14
    )
      return true;
    const s = top ? p[0] : p[1];
    const d = top ? p[1] : p[0];
    if (d < coast.depth(s) + 9) return true;
    for (const [a, b] of legs)
      if (distToSegment(p, a, b) < 40 + pad) return true;
    if (distToSegment(p, quay, first) < 18 + pad) return true;
    for (const port of ports)
      if (Math.hypot(p[0] - port[0], p[1] - port[1]) < 74 + pad) return true;
    const { rose } = layout;
    if (Math.hypot(p[0] - rose.x, p[1] - rose.y) < rose.r + 24 + pad)
      return true;
    for (const box of [layout.cartouche, layout.legend]) {
      if (
        box &&
        p[0] > box.x - 14 - pad &&
        p[0] < box.x + box.w + 14 + pad &&
        p[1] > box.y - 12 - pad &&
        p[1] < box.y + box.h + 12 + pad
      )
        return true;
    }
    return false;
  };
  const soundings: { p: Pt; whole: number; tenth: number | null }[] = [];
  const want = layout.id === "wide" ? 44 : 38;
  for (let i = 0; i < 1600 && soundings.length < want; i++) {
    const p: Pt = [
      FRAME + rand() * (w - FRAME * 2),
      FRAME + rand() * (h - FRAME * 2),
    ];
    if (busy(p, 0)) continue;
    if (soundings.some((o) => Math.hypot(o.p[0] - p[0], o.p[1] - p[1]) < 40))
      continue;
    const off = (top ? p[1] : p[0]) - coast.depth(top ? p[0] : p[1]);
    const metres = 0.8 + off * 0.075 + rand() * 3;
    const whole = Math.floor(metres);
    soundings.push({
      p,
      whole,
      tenth: whole < 12 && rand() < 0.45 ? Math.floor(rand() * 9) + 1 : null,
    });
  }

  // The graticule: meridians and parallels, evenly.
  const grid: string[] = [];
  const stepG = layout.id === "land" ? 110 : 120;
  for (let x = FRAME + stepG * 0.62; x < w - FRAME; x += stepG)
    grid.push(`M${r1(x)} ${FRAME}V${h - FRAME}`);
  for (let y = FRAME + stepG * 0.8; y < h - FRAME; y += stepG)
    grid.push(`M${FRAME} ${r1(y)}H${w - FRAME}`);

  // The border: a graduated band of alternate bars between two rules.
  const bars: string[] = [];
  const unit = 22;
  const inset = 6;
  const band2 = FRAME - inset;
  for (let x = inset, i = 0; x < w - inset; x += unit, i++) {
    if (i % 2) continue;
    const ww = Math.min(unit, w - inset - x);
    bars.push(
      `M${x} ${inset}h${ww}v${band2 / 2}h${-ww}Z`,
      `M${x} ${h - inset - band2 / 2}h${ww}v${band2 / 2}h${-ww}Z`,
    );
  }
  for (let y = inset, i = 0; y < h - inset; y += unit, i++) {
    if (i % 2) continue;
    const hh = Math.min(unit, h - inset - y);
    bars.push(
      `M${inset} ${y}h${band2 / 2}v${hh}h${-band2 / 2}Z`,
      `M${w - inset - band2 / 2} ${y}h${band2 / 2}v${hh}h${-band2 / 2}Z`,
    );
  }
  const ticks: string[] = [];
  for (let x = inset + unit / 2; x < w - inset; x += unit / 2)
    ticks.push(`M${r1(x)} ${FRAME}v-3M${r1(x)} ${h - FRAME}v3`);
  for (let y = inset + unit / 2; y < h - inset; y += unit / 2)
    ticks.push(`M${FRAME} ${r1(y)}h-3M${w - FRAME} ${r1(y)}h3`);

  // Course and name written along each leg, as a navigator labels a track:
  // above the line who, below it what. Kept upright whichever way it runs.
  const legLabels = legs.map(([a, b], i) => {
    const leg = voyage.legs[i];
    if (!leg) return null;
    let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    if (ang > 90) ang -= 180;
    if (ang < -90) ang += 180;
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const rad = (ang * Math.PI) / 180;
    const nx = Math.sin(rad);
    const ny = -Math.cos(rad);
    const above: Pt = [mx + nx * 15, my + ny * 15];
    const below: Pt = [mx - nx * 24, my - ny * 24];
    return (
      <g key={leg.id} className="rk-a-leglabel">
        <text
          className="rk-a-leg-company"
          x={r1(above[0])}
          y={r1(above[1])}
          transform={`rotate(${r1(ang)} ${r1(above[0])} ${r1(above[1])})`}
        >
          {leg.company}
        </text>
        <text
          className="rk-a-leg-title"
          x={r1(below[0])}
          y={r1(below[1])}
          transform={`rotate(${r1(ang)} ${r1(below[0])} ${r1(below[1])})`}
        >
          {leg.title}
        </text>
      </g>
    );
  });

  // The open sea gets its name, set the way water is named on a chart.
  const seaName: Pt =
    layout.id === "wide"
      ? [552, 700]
      : layout.id === "tall"
        ? [346, 820]
        : [728, 416];

  const clip = `rk-clip-${layout.id}`;
  return (
    <svg
      className={`rk-art rk-art--${layout.id}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clip}>
          <rect
            x={FRAME}
            y={FRAME}
            width={w - FRAME * 2}
            height={h - FRAME * 2}
          />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clip})`}>
        <path className="rk-a-shoal2" d={band(shore, c10)} />
        <path className="rk-a-shoal1" d={band(shore, c5)} />
        <path className="rk-a-grid" d={grid.join("")} />
        <path className="rk-a-contour" d={path(c5)} />
        <path className="rk-a-contour rk-a-dash" d={path(c10)} />
        <path className="rk-a-contour rk-a-dot" d={path(c20)} />
        <path className="rk-a-land" d={land} />
        <path className="rk-a-hill" d={path(hill1)} />
        <path className="rk-a-hill rk-a-faint" d={path(hill2)} />
        <path className="rk-a-shore" d={path(shore)} />
        <path className="rk-a-mole" d={path([breakA0, breakA1])} />
        <path className="rk-a-mole" d={path([breakB0, breakB1])} />
        {blocks.map((b, i) => (
          <rect
            key={i}
            className="rk-a-block"
            x={r1(b[0] - 3)}
            y={r1(b[1] - 2.5)}
            width={i % 3 === 0 ? 7 : 5}
            height={5}
          />
        ))}
        {/* The light at the end of the breakwater. */}
        <path
          className="rk-a-flare"
          d={`M${r1(breakB1[0])} ${r1(breakB1[1])}q 10 -16 3 -26 q -9 8 -3 26Z`}
          transform={`rotate(${top ? 34 : -56} ${r1(breakB1[0])} ${r1(breakB1[1])})`}
        />
        <circle
          className="rk-a-light"
          cx={r1(breakB1[0])}
          cy={r1(breakB1[1])}
          r={2.6}
        />

        {soundings.map(({ p, whole, tenth }, i) => (
          <text key={i} className="rk-a-sounding" x={r1(p[0])} y={r1(p[1])}>
            {whole}
            {tenth !== null ? (
              <tspan className="rk-a-sub" dy="2.6">
                {tenth}
              </tspan>
            ) : null}
          </text>
        ))}

        <text
          className="rk-a-sea"
          x={seaName[0]}
          y={seaName[1]}
          transform={
            layout.id === "land"
              ? undefined
              : `rotate(-90 ${seaName[0]} ${seaName[1]})`
          }
        >
          O P E N &#160; W A T E R
        </text>

        <Rose {...layout.rose} />

        {/* Pilotage out of the harbour, then the track itself. */}
        <path className="rk-a-pilot" d={path([quay, first])} />
        <path className="rk-a-track" d={path(ports)} />
        <path className="rk-a-arrow" d={arrows.join("")} />
        <circle className="rk-a-quay" cx={r1(quay[0])} cy={r1(quay[1])} r={3} />
        {legLabels}
      </g>

      <rect
        className="rk-a-frame"
        x={inset}
        y={inset}
        width={w - inset * 2}
        height={h - inset * 2}
      />
      <rect
        className="rk-a-neat"
        x={FRAME}
        y={FRAME}
        width={w - FRAME * 2}
        height={h - FRAME * 2}
      />
      <path className="rk-a-bars" d={bars.join("")} />
      <path className="rk-a-ticks" d={ticks.join("")} />
    </svg>
  );
}

/**
 * The vermilion overdraw on the legs the dividers span. Its own small
 * layer, so inking a leg in repaints a few paths, not the whole chart.
 */
export function ChartInk({ layout }: { layout: ChartLayout }) {
  const { w, h, ports } = layout;
  return (
    <svg
      className={`rk-ink rk-ink--${layout.id}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {ports.slice(1).map((p, i) => (
        <path
          key={i}
          className="rk-ink__leg"
          data-leg={i}
          pathLength={1}
          d={path([ports[i]!, p])}
        />
      ))}
    </svg>
  );
}
