import { ORDERS, SKILLS } from "@/lib/content";

/**
 * The sail plan: one ship drawn in elevation, bow to the right, whose
 * running rigging is the skills in lib/content.ts.
 *
 * Each skill group is a mast (LLMs and agents the main, Engineering the
 * fore, Document intelligence the mizzen) and each skill is one line, led
 * from a point on that mast's sails down to a numbered pin in the margin
 * where its name is written. Everything here is plain geometry in the
 * drawing's own units (a 1000 x 960 sheet), computed once, so the server
 * can draw the whole plan and the browser only has to move it.
 */

export const W = 1000;
export const H = 960;

/** Where the belaying pins stand, left and right of the ship. */
export const PIN_L = 226;
export const PIN_R = 774;
const SLOT_TOP = 116;
const SLOT_BOTTOM = 872;

export type Pt = { x: number; y: number };

/* ---------------------------------------------------------------------------
   Masts and sails
   ------------------------------------------------------------------------- */

export type MastId = "mizzen" | "main" | "fore";

export const MASTS: Record<
  MastId,
  { x: number; truck: number; deck: number; name: string; group: number }
> = {
  // `group` is the index into SKILLS.
  mizzen: { x: 360, truck: 340, deck: 776, name: "Mizzen", group: 1 },
  main: { x: 500, truck: 150, deck: 787, name: "Mainmast", group: 0 },
  fore: { x: 652, truck: 300, deck: 779, name: "Foremast", group: 2 },
};

type SquareSail = {
  kind: "square";
  mast: MastId;
  /** Head (on the yard) and foot: height and half-width. */
  head: number;
  headHalf: number;
  foot: number;
  footHalf: number;
};

type GaffSail = {
  kind: "gaff";
  mast: MastId;
  throat: Pt;
  peak: Pt;
  clew: Pt;
  tack: Pt;
};

export type SailId =
  | "mzTop"
  | "spanker"
  | "mRoyal"
  | "mGallant"
  | "mTop"
  | "mCourse"
  | "fGallant"
  | "fTop"
  | "fCourse";

export const SAILS: Record<SailId, SquareSail | GaffSail> = {
  mzTop: {
    kind: "square",
    mast: "mizzen",
    head: 392,
    headHalf: 54,
    foot: 466,
    footHalf: 62,
  },
  spanker: {
    kind: "gaff",
    mast: "mizzen",
    throat: { x: 360, y: 476 },
    peak: { x: 286, y: 426 },
    clew: { x: 280, y: 748 },
    tack: { x: 360, y: 738 },
  },
  mRoyal: {
    kind: "square",
    mast: "main",
    head: 222,
    headHalf: 54,
    foot: 312,
    footHalf: 66,
  },
  mGallant: {
    kind: "square",
    mast: "main",
    head: 318,
    headHalf: 72,
    foot: 434,
    footHalf: 88,
  },
  mTop: {
    kind: "square",
    mast: "main",
    head: 440,
    headHalf: 92,
    foot: 584,
    footHalf: 106,
  },
  mCourse: {
    kind: "square",
    mast: "main",
    head: 590,
    headHalf: 108,
    foot: 742,
    footHalf: 120,
  },
  fGallant: {
    kind: "square",
    mast: "fore",
    head: 372,
    headHalf: 58,
    foot: 474,
    footHalf: 70,
  },
  fTop: {
    kind: "square",
    mast: "fore",
    head: 478,
    headHalf: 76,
    foot: 606,
    footHalf: 86,
  },
  fCourse: {
    kind: "square",
    mast: "fore",
    head: 610,
    headHalf: 84,
    foot: 748,
    footHalf: 92,
  },
};

export const SAIL_IDS = Object.keys(SAILS) as SailId[];

/** A point on a square sail: side -1 (aft) or 1 (fore); t 0 head, 1 foot. */
function edge(id: SailId, side: -1 | 1, t: number): Pt {
  const sail = SAILS[id];
  if (sail.kind !== "square") throw new Error(id);
  const x = MASTS[sail.mast].x;
  const half = sail.headHalf + (sail.footHalf - sail.headHalf) * t;
  return { x: x + side * half, y: sail.head + (sail.foot - sail.head) * t };
}

function mix(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

const r = (n: number) => Math.round(n * 10) / 10;

/**
 * A sail's outline and its seams. `fill` is how full of wind it is, 0 to
 * 1 (a little past either end while it settles): the foot and the leeches
 * belly out with it, and the seams follow.
 */
export function sailPath(
  id: SailId,
  fill: number,
): { cut: string; seams: string } {
  const sail = SAILS[id];
  if (sail.kind === "square") {
    const x = MASTS[sail.mast].x;
    const tl = { x: x - sail.headHalf, y: sail.head };
    const tr = { x: x + sail.headHalf, y: sail.head };
    const br = { x: x + sail.footHalf, y: sail.foot };
    const bl = { x: x - sail.footHalf, y: sail.foot };
    const depth = sail.foot - sail.head;
    const roach = 3 + fill * depth * 0.09;
    const bow = fill * depth * 0.05;
    const midY = (sail.head + sail.foot) / 2;
    const cut =
      `M${r(tl.x)} ${r(tl.y)}L${r(tr.x)} ${r(tr.y)}` +
      `Q${r((tr.x + br.x) / 2 + bow)} ${r(midY)} ${r(br.x)} ${r(br.y)}` +
      `Q${r(x)} ${r(sail.foot + roach * 2)} ${r(bl.x)} ${r(bl.y)}` +
      `Q${r((tl.x + bl.x) / 2 - bow)} ${r(midY)} ${r(tl.x)} ${r(tl.y)}Z`;
    // Seams: vertical cloths, curving with the foot and the leeches.
    let seams = "";
    const cloths = Math.round((sail.headHalf * 2) / 16);
    for (let i = 1; i < cloths; i++) {
      const u = i / cloths;
      const top = mix(tl, tr, u);
      const foot = mix(bl, br, u);
      // The foot is a quadratic; its drop at u.
      const sag = 4 * u * (1 - u) * roach;
      const lean = (u - 0.5) * 2 * bow * 0.6;
      seams += `M${r(top.x)} ${r(top.y)}Q${r((top.x + foot.x) / 2 + lean)} ${r(midY)} ${r(foot.x)} ${r(foot.y + sag)}`;
    }
    return { cut, seams };
  }
  const { throat, peak, clew, tack } = sail;
  const leechBow = 4 + fill * 15;
  const footSag = 2 + fill * 7;
  const midLeech = mix(peak, clew, 0.5);
  const cut =
    `M${throat.x} ${throat.y}L${peak.x} ${peak.y}` +
    `Q${r(midLeech.x - leechBow * 2)} ${r(midLeech.y)} ${clew.x} ${clew.y}` +
    `Q${r((clew.x + tack.x) / 2)} ${r((clew.y + tack.y) / 2 + footSag * 2)} ${tack.x} ${tack.y}Z`;
  // Seams parallel to the leech, from the gaff to the foot.
  let seams = "";
  for (let i = 1; i < 5; i++) {
    const u = i / 5;
    const top = mix(peak, throat, u);
    const foot = mix(clew, tack, u);
    const sag = 4 * u * (1 - u) * footSag;
    const bowHere = leechBow * (1 - u);
    seams += `M${r(top.x)} ${r(top.y)}Q${r((top.x + foot.x) / 2 - bowHere * 1.8)} ${r((top.y + foot.y) / 2)} ${r(foot.x)} ${r(foot.y + sag)}`;
  }
  return { cut, seams };
}

/* ---------------------------------------------------------------------------
   The lines: one per skill
   ------------------------------------------------------------------------- */

/**
 * Where each skill's line is made fast aloft, in the order of the skills in
 * its group (SKILLS). The sail is the one it works: when the line hauls,
 * that sail fills.
 */
const ANCHORS: readonly (readonly { at: Pt; sail: SailId }[])[] = [
  // LLMs and agents: the mainmast.
  [
    { at: edge("mCourse", -1, 0), sail: "mCourse" }, // AI agents
    { at: edge("mCourse", -1, 0.5), sail: "mCourse" }, // RAG
    { at: edge("mGallant", -1, 0), sail: "mGallant" }, // vLLM
    { at: edge("mCourse", -1, 1), sail: "mCourse" }, // LangGraph
    { at: edge("mTop", -1, 0.5), sail: "mTop" }, // evals
    { at: edge("mTop", -1, 0), sail: "mTop" }, // guardrails
    { at: edge("mGallant", 1, 0), sail: "mGallant" }, // cost tracing
    { at: { x: 500, y: 150 }, sail: "mRoyal" }, // context engineering
    { at: edge("mTop", 1, 0), sail: "mTop" }, // structured outputs
    { at: edge("mGallant", 1, 0.5), sail: "mGallant" }, // fine-tuning
    { at: edge("mRoyal", -1, 0), sail: "mRoyal" }, // MCP
    { at: edge("mRoyal", 1, 0), sail: "mRoyal" }, // Claude and OpenAI
  ],
  // Document intelligence: the mizzen.
  [
    { at: { x: 283, y: 587 }, sail: "spanker" }, // classification
    { at: edge("mzTop", -1, 0), sail: "mzTop" }, // citations
    { at: { x: 280, y: 748 }, sail: "spanker" }, // human-in-the-loop
    { at: { x: 360, y: 340 }, sail: "mzTop" }, // workflow
  ],
  // Engineering: the foremast.
  [
    { at: { x: 652, y: 300 }, sail: "fGallant" }, // Python
    { at: edge("fTop", 1, 0), sail: "fTop" }, // .NET
    { at: edge("fCourse", 1, 0), sail: "fCourse" }, // SQL
    { at: edge("fTop", 1, 0.5), sail: "fTop" }, // REST
    { at: edge("fCourse", 1, 0.5), sail: "fCourse" }, // scraping
    { at: edge("fGallant", 1, 0), sail: "fGallant" }, // AWS
    { at: edge("fCourse", 1, 1), sail: "fCourse" }, // Next.js
    { at: edge("fGallant", 1, 0.5), sail: "fGallant" }, // Playwright
  ],
];

const MAST_OF_GROUP: readonly MastId[] = ["main", "mizzen", "fore"];

export type Line = {
  /** 0-based, in the order of SKILLS; shown as n + 1. */
  n: number;
  name: string;
  evidence?: string;
  strong: boolean;
  group: string;
  mast: MastId;
  sail: SailId;
  /** Indices into ORDERS of the orders that use this line. */
  orders: number[];
  /** Drawn weight, in sheet units: one step per order, one more if strong. */
  weight: number;
  side: "l" | "r";
  /** Position in its column, top to bottom. */
  slot: number;
  anchor: Pt;
  pin: Pt;
  /** How far it hangs at its slackest, in sheet units. */
  sag: number;
};

function build(): Line[] {
  const lines: Line[] = [];
  let n = 0;
  SKILLS.forEach((group, g) => {
    group.skills.forEach((skill, i) => {
      // A skill added to lib/content.ts without a place drawn for it here
      // is still listed in the schedule; it just has no line on the plan.
      const spot = ANCHORS[g]?.[i];
      const mast = MAST_OF_GROUP[g];
      if (!spot || !mast) return;
      const orders = ORDERS.flatMap((order, o) =>
        order.skills.includes(skill.name) ? [o] : [],
      );
      lines.push({
        n,
        name: skill.name,
        evidence: skill.evidence,
        strong: Boolean(skill.strong),
        group: group.name,
        mast,
        sail: spot.sail,
        orders,
        weight: 1.5 + orders.length * 1.15 + (skill.strong ? 1.15 : 0),
        side: spot.at.x < 500 || (spot.at.x === 500 && g === 0) ? "l" : "r",
        slot: 0,
        anchor: spot.at,
        pin: { x: 0, y: 0 },
        sag: 0,
      });
      n++;
    });
  });

  // Pins down each side in the order that keeps the lines from crossing:
  // by height aloft, nudged by how far the line has to run.
  for (const side of ["l", "r"] as const) {
    const pinX = side === "l" ? PIN_L : PIN_R;
    const column = lines
      .filter((line) => line.side === side)
      .sort(
        (a, b) =>
          a.anchor.y +
          0.3 * Math.abs(a.anchor.x - pinX) -
          (b.anchor.y + 0.3 * Math.abs(b.anchor.x - pinX)),
      );
    const step =
      (SLOT_BOTTOM - SLOT_TOP) / Math.max(1, Math.max(column.length, 2) - 1);
    column.forEach((line, slot) => {
      line.slot = slot;
      line.pin = { x: pinX, y: SLOT_TOP + step * slot };
      const length = Math.hypot(
        line.pin.x - line.anchor.x,
        line.pin.y - line.anchor.y,
      );
      line.sag = 10 + length * 0.13;
    });
  }
  return lines;
}

export const LINES: readonly Line[] = build();

/** The rope, hanging `slack` of the way to its slackest (0 is bar taut). */
export function ropePath(line: Line, slack: number): string {
  const { anchor: a, pin: p } = line;
  // A quadratic whose middle hangs `sag` below the straight line: gravity
  // pulls straight down, so the control point drops, not the normal.
  const cx = (a.x + p.x) / 2;
  const cy = (a.y + p.y) / 2 + 2 * line.sag * slack;
  return `M${r(a.x)} ${r(a.y)}Q${r(cx)} ${r(cy)} ${r(p.x)} ${r(p.y)}`;
}

/** Which sails a set of live lines fills. */
export function sailsFor(live: (line: Line) => boolean): Set<SailId> {
  return new Set(LINES.filter(live).map((line) => line.sail));
}

/** Orders that use a sail (any of its lines). */
export const SAIL_ORDERS: Record<SailId, number[]> = Object.fromEntries(
  SAIL_IDS.map((id) => [
    id,
    [
      ...new Set(
        LINES.filter((line) => line.sail === id).flatMap((line) => line.orders),
      ),
    ].sort((a, b) => a - b),
  ]),
) as Record<SailId, number[]>;

/** The value `data-o` carries: the orders that use it, space separated. */
export const ordersAttr = (orders: readonly number[]) => orders.join(" ");

/** Lines each order hauls, in the order the order lists them. */
export const ORDER_LINES: readonly Line[][] = ORDERS.map((order) =>
  order.skills.flatMap((name) => {
    const line = LINES.find((candidate) => candidate.name === name);
    return line ? [line] : [];
  }),
);

/** A skill's line, by name (none if the plan has no place for it). */
export const lineNamed = (name: string) =>
  LINES.find((line) => line.name === name);

export const USED = LINES.filter((line) => line.orders.length > 0).length;

/** Two-digit order number, as on the board. */
export const orderNo = (o: number) => String(o + 1).padStart(2, "0");

/* ---------------------------------------------------------------------------
   The fixed parts of the drawing
   ------------------------------------------------------------------------- */

export const HULL =
  "M294 764Q505 806 712 770C708 822 690 866 656 884L352 884C326 878 306 846 300 800Z";
/** The rail above the sheer, and two wales along the side. */
export const HULL_LINES =
  "M296 754Q505 796 714 760M300 790Q505 830 704 796M306 814Q505 852 698 820";
export const WATERLINE_Y = 850;
export const BOWSPRIT = { from: { x: 700, y: 772 }, to: { x: 760, y: 738 } };

/** Masts: tapered, from the deck to the truck. */
export function mastPath(id: MastId): string {
  const { x, truck, deck } = MASTS[id];
  const base = id === "main" ? 5 : 4.2;
  const tip = 1.8;
  return `M${x - base} ${deck}L${x - tip} ${truck}L${x + tip} ${truck}L${x + base} ${deck}Z`;
}

/** Yards: a spar on the head of every square sail, a little longer. */
export function yardPaths(): string {
  let d = "";
  for (const id of SAIL_IDS) {
    const sail = SAILS[id];
    if (sail.kind !== "square") continue;
    const x = MASTS[sail.mast].x;
    const half = sail.headHalf + 6;
    d += `M${x - half} ${sail.head}L${x + half} ${sail.head}`;
  }
  // The spanker's gaff and boom.
  d += "M360 476L280 422M360 740L272 750";
  return d;
}

/** Standing rigging: stays and shrouds, drawn in hairline. */
export const STANDING = [
  // Stays, mast to mast and down to the bowsprit.
  "M500 150L652 300",
  "M500 436L652 604",
  "M360 340L500 436",
  "M652 300L760 738",
  "M652 474L734 752",
  // Shrouds and backstays, down to the ship's side.
  "M500 150L430 784",
  "M500 318L452 788",
  "M500 440L468 790",
  "M500 590L484 790",
  "M652 300L600 778",
  "M652 478L620 780",
  "M360 340L318 768",
  "M360 466L336 772",
].join("");
