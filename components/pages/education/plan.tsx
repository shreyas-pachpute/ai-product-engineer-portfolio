import type { Achievement, Qualification } from "@/lib/content";
import {
  CX,
  H,
  KEEL,
  KEEL_HALF,
  RIM,
  RIM_HALF,
  RULE,
  RULE_START,
  SAIL_HALF,
  TIP,
  W,
} from "./geometry";

/**
 * The plans: a ship's sail plan in profile, drawn in ink on the ruled paper
 * the boats are folded from, with a title block that holds the degree and
 * two numbered notes for the certificates.
 *
 * It is drawn once, as a <symbol>, and every piece of the paper shows it
 * through <use>, clipped to its own outline, so a line crossing a crease is
 * one line on the sheet.
 *
 * The drawing is laid out on the folds. The boat's hull is the ship's hull:
 * its keel crease is the baseline, its two hull creases are the sternpost
 * and the stem. The sail's creases are the mainmast's shrouds and its tip
 * is the main top, on the crease the top half folds along. So the paper
 * boat was always this ship, folded.
 *
 * Bow to the right, as plans are drawn. Decoration only (aria-hidden): the
 * facts are in the page's HTML beside it.
 */

/* Colours come from the page (app/education/education.css): the drawing is
 * inked in currentColor, and the rest are tokens. Inline styles, because
 * presentation attributes cannot read CSS variables. */
const INK = "currentColor";
const PENCIL = { fill: "var(--pencil)" } as const;
const VERMILION = { fill: "var(--color-vermilion)" } as const;
const PAPER = { fill: "var(--edu-paper)" } as const;
const NS = { vectorEffect: "non-scaling-stroke" } as const;

/* Where the hull's sides are at a given height. */
const RAKE = (RIM_HALF - KEEL_HALF) / (KEEL - RIM);
const sternX = (y: number) => CX - RIM_HALF + (y - RIM) * RAKE;
const stemX = (y: number) => CX + RIM_HALF - (y - RIM) * RAKE;

/** The title block's left edge (it runs to the border on the right). */
const TB = 1058;

/** The designed waterline, and the perpendiculars where it meets the hull. */
const DWL = 645;
const AP = sternX(DWL);
const FP = stemX(DWL);

/** The masts: x, the top (platform), crosstrees, truck. */
const MIZZEN = { x: 560, top: 492, cross: 366, truck: 150 };
const MAIN = { x: CX, top: TIP, cross: 300, truck: 62 };
const FORE = { x: 925, top: 466, cross: 330, truck: 92 };

/** A square sail: head y and half-width, foot y and half-width. */
type Sail = readonly [number, number, number, number];
const MAIN_SAILS: readonly Sail[] = [
  [450, 92, 556, 100],
  [324, 82, 446, 92],
  [224, 64, 320, 82],
  [148, 46, 220, 64],
];
const FORE_SAILS: readonly Sail[] = [
  [476, 82, 566, 90],
  [352, 74, 472, 82],
  [254, 58, 348, 74],
  [178, 42, 250, 58],
];
const MIZZEN_SAILS: readonly Sail[] = [
  [388, 56, 496, 62],
  [298, 44, 384, 56],
];

const f = (n: number) => +n.toFixed(1);

function squareSail(x: number, [yh, hh, yf, hf]: Sail, key: string) {
  const roach = (yf - yh) * 0.09;
  const outline = `M${f(x - hh)} ${yh}L${f(x + hh)} ${yh}L${f(x + hf)} ${yf}Q${x} ${f(yf - roach * 2)} ${f(x - hf)} ${yf}Z`;
  // Cloths: the seams between the strips of canvas, head to foot.
  const n = Math.max(4, Math.round((hh + hf) / 15));
  const seams: string[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const xt = x - hh + 2 * hh * t;
    const xb = x - hf + 2 * hf * t;
    const sag = 4 * t * (1 - t) * roach * 2;
    seams.push(`M${f(xt)} ${yh}L${f(xb)} ${f(yf - sag)}`);
  }
  return (
    <g key={key}>
      <path
        d={seams.join("")}
        strokeWidth={0.45}
        strokeOpacity={0.45}
        {...NS}
      />
      <path d={outline} strokeWidth={1} {...NS} />
    </g>
  );
}

function triSail(
  head: readonly [number, number],
  tack: readonly [number, number],
  clew: readonly [number, number],
  key: string,
) {
  // Seams run parallel to the leech (clew to head), spaced along the foot.
  const seams: string[] = [];
  const n = 7;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const fx = clew[0] + (tack[0] - clew[0]) * t;
    const fy = clew[1] + (tack[1] - clew[1]) * t;
    const lx = head[0] + (tack[0] - head[0]) * t;
    const ly = head[1] + (tack[1] - head[1]) * t;
    seams.push(`M${f(fx)} ${f(fy)}L${f(lx)} ${f(ly)}`);
  }
  return (
    <g key={key}>
      <path
        d={seams.join("")}
        strokeWidth={0.45}
        strokeOpacity={0.45}
        {...NS}
      />
      <path
        d={`M${head[0]} ${head[1]}L${tack[0]} ${tack[1]}L${clew[0]} ${clew[1]}Z`}
        strokeWidth={1}
        {...NS}
      />
    </g>
  );
}

type P = readonly [number, number];

/** A fore-and-aft sail on a gaff: throat, peak, clew, tack. */
function gaffSail(throat: P, peak: P, clew: P, tack: P) {
  const seams: string[] = [];
  const n = 8;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const tx = peak[0] + (throat[0] - peak[0]) * t;
    const ty = peak[1] + (throat[1] - peak[1]) * t;
    const bx = clew[0] + (tack[0] - clew[0]) * t;
    const by = clew[1] + (tack[1] - clew[1]) * t;
    seams.push(`M${f(tx)} ${f(ty)}L${f(bx)} ${f(by)}`);
  }
  return (
    <g>
      <path
        d={seams.join("")}
        strokeWidth={0.45}
        strokeOpacity={0.45}
        {...NS}
      />
      <path
        d={`M${throat[0]} ${throat[1]}L${peak[0]} ${peak[1]}L${clew[0]} ${clew[1]}L${tack[0]} ${tack[1]}Z`}
        strokeWidth={1}
        {...NS}
      />
    </g>
  );
}

function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  key?: string | number,
) {
  return <line key={key} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} {...NS} />;
}

/** A dimension: a line between two points with an arrowhead at each end. */
function dimension(x1: number, x2: number, y: number, label: string) {
  const a = 9;
  const b = 3;
  return (
    <g>
      {line(x1, y, x2, y)}
      <path
        d={`M${f(x1)} ${y}l${a} ${-b}v${2 * b}ZM${f(x2)} ${y}l${-a} ${-b}v${2 * b}Z`}
        fill={INK}
        stroke="none"
      />
      <text
        x={f((x1 + x2) / 2)}
        y={y - 7}
        textAnchor="middle"
        fontSize={10}
        letterSpacing={1.4}
        style={PENCIL}
        stroke="none"
      >
        {label}
      </text>
    </g>
  );
}

/** Greedy word wrap, by characters. Good enough for a few known lines. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** A numbered marker, like the steps on the opening's folding diagram. */
function marker(x: number, y: number, n: number) {
  return (
    <g stroke="none">
      <circle cx={x} cy={y} r={11.5} style={VERMILION} />
      <text
        x={x}
        y={y + 4.4}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        style={PAPER}
      >
        {n}
      </text>
    </g>
  );
}

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text
      x={x}
      y={y}
      fontSize={9}
      fontWeight={600}
      letterSpacing={1.3}
      style={PENCIL}
      stroke="none"
    >
      {children.toUpperCase()}
    </text>
  );
}

export function Plan({
  degree,
  notes,
  name,
}: {
  degree?: Qualification;
  notes: readonly Achievement[];
  name: string;
}) {
  const rules: string[] = [];
  for (let y = RULE_START; y < H; y += RULE) rules.push(`M0 ${y}H${W}`);

  const hull = `${CX - RIM_HALF},${RIM} ${CX + RIM_HALF},${RIM} ${CX + KEEL_HALF},${KEEL} ${CX - KEEL_HALF},${KEEL}`;
  const under = `${f(AP)},${DWL} ${f(FP)},${DWL} ${CX + KEEL_HALF},${KEEL} ${CX - KEEL_HALF},${KEEL}`;

  // Under the waterline the hull is hatched, as sections are.
  const hatch: string[] = [];
  for (let x = AP - 70; x < FP; x += 9) hatch.push(`M${f(x)} ${DWL}l70 70`);

  const stations = Array.from(
    { length: 11 },
    (_, i) => AP + ((FP - AP) * i) / 10,
  );

  // Rail: from the top of the transom, a sheer that dips amidships, to the stem head.
  const transom: [number, number] = [sternX(552), 552];
  const stemHead: [number, number] = [stemX(562), 562];

  const ports: number[] = [];
  for (let x = 492; x <= 1010; x += 43) ports.push(x);

  const wale = (y: number) => `M${f(sternX(y))} ${y}H${f(stemX(y))}`;

  // Shrouds: from each top down to the deck, splayed like the main's,
  // whose shrouds are the sail's creases.
  const splay = SAIL_HALF / (RIM - TIP);
  const shrouds = [MIZZEN, MAIN, FORE].flatMap((m) => {
    const half = (RIM - m.top) * splay;
    return [
      [m.x, m.top, m.x - half, RIM],
      [m.x, m.top, m.x + half, RIM],
      [m.x, m.cross, m.x - 16, m.top],
      [m.x, m.cross, m.x + 16, m.top],
    ] as const;
  });

  const stays: readonly (readonly [number, number, number, number])[] = [
    [FORE.x, 350, 1188, 538],
    [FORE.x, 252, 1268, 511],
    [FORE.x, FORE.top, 1062, 580],
    [MAIN.x, MAIN.top, 918, 584],
    [MAIN.x, 322, FORE.x, FORE.top],
    [MAIN.x, 222, FORE.x, 350],
    [MAIN.x, 146, FORE.x, 252],
    [MIZZEN.x, MIZZEN.top, 744, 586],
    [MIZZEN.x, 386, MAIN.x, MAIN.top],
    [MIZZEN.x, 296, MAIN.x, 322],
    // Backstays, down to the rail aft of each mast.
    [MAIN.x, 148, 676, 578],
    [FORE.x, 178, 864, 580],
    [MIZZEN.x, 298, 516, 582],
    // Dolphin striker and martingale.
    [1186, 538, 1180, 568],
    [1180, 568, 1268, 511],
    [1180, 568, 1066, 598],
  ];

  const [second, third] = notes;
  const institution = degree ? wrap(degree.institution, 36) : [];
  const award = degree ? wrap(degree.award, 26) : [];

  // Zones along the border, as on any engineering sheet.
  const cols = 8;
  const rows = 6;
  const zx = (i: number) => 40 + ((W - 80) * i) / cols;
  const zy = (j: number) => 40 + ((H - 80) * j) / rows;

  return (
    <svg
      className="edu-defs"
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
    >
      <defs>
        <clipPath id="edu-hull" clipPathUnits="userSpaceOnUse">
          <polygon points={hull} />
        </clipPath>
        <clipPath id="edu-under" clipPathUnits="userSpaceOnUse">
          <polygon points={under} />
        </clipPath>
        <symbol id="edu-plan" overflow="visible">
          {/* The paper: blue rules and a red margin. */}
          <path
            d={rules.join("")}
            stroke="rgb(96 128 178)"
            strokeOpacity={0.36}
            strokeWidth={0.9}
            fill="none"
            {...NS}
          />
          <path
            d="M110 0V1000"
            stroke="rgb(196 82 76)"
            strokeOpacity={0.5}
            strokeWidth={1.1}
            {...NS}
          />

          <g
            stroke={INK}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Border, with its zones. */}
            <rect
              x={24}
              y={24}
              width={W - 48}
              height={H - 48}
              strokeWidth={0.6}
              {...NS}
            />
            <rect
              x={40}
              y={40}
              width={W - 80}
              height={H - 80}
              strokeWidth={1.3}
              {...NS}
            />
            <g strokeWidth={0.6}>
              {Array.from({ length: cols - 1 }, (_, i) => (
                <g key={`zc${i}`}>
                  {line(zx(i + 1), 24, zx(i + 1), 40)}
                  {line(zx(i + 1), H - 40, zx(i + 1), H - 24)}
                </g>
              ))}
              {Array.from({ length: rows - 1 }, (_, j) => (
                <g key={`zr${j}`}>
                  {line(24, zy(j + 1), 40, zy(j + 1))}
                  {line(W - 40, zy(j + 1), W - 24, zy(j + 1))}
                </g>
              ))}
            </g>
            <g stroke="none" style={PENCIL} fontSize={9} textAnchor="middle">
              {Array.from({ length: cols }, (_, i) => (
                <g key={`zn${i}`}>
                  <text x={f((zx(i) + zx(i + 1)) / 2)} y={35.5}>
                    {i + 1}
                  </text>
                  <text x={f((zx(i) + zx(i + 1)) / 2)} y={H - 28.5}>
                    {i + 1}
                  </text>
                </g>
              ))}
              {Array.from({ length: rows }, (_, j) => (
                <g key={`zl${j}`}>
                  <text x={32} y={f((zy(j) + zy(j + 1)) / 2 + 3)}>
                    {"ABCDEF"[j]}
                  </text>
                  <text x={W - 32} y={f((zy(j) + zy(j + 1)) / 2 + 3)}>
                    {"ABCDEF"[j]}
                  </text>
                </g>
              ))}
            </g>

            {/* Title. */}
            <text
              x={128}
              y={104}
              stroke="none"
              fill={INK}
              fontSize={46}
              fontStyle="italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sail plan
            </text>
            <g stroke="none">
              <Label x={131} y={130}>
                Profile
              </Label>
            </g>

            {/* Hull below the waterline, hatched; stations and perpendiculars. */}
            <path
              d={hatch.join("")}
              clipPath="url(#edu-under)"
              strokeWidth={0.5}
              strokeOpacity={0.4}
              {...NS}
            />
            <g
              clipPath="url(#edu-hull)"
              strokeWidth={0.55}
              strokeOpacity={0.5}
              strokeDasharray="3 4"
            >
              {stations.map((x, i) => line(x, RIM, x, KEEL, `st${i}`))}
            </g>
            <g strokeWidth={0.55} strokeDasharray="14 4 2 4">
              {line(AP, 548, AP, 794)}
              {line(FP, 548, FP, 794)}
            </g>
            <g stroke="none" style={PENCIL} fontSize={10.5} textAnchor="middle">
              {stations.map((x, i) => (
                <text key={`sn${i}`} x={f(x)} y={728}>
                  {i}
                </text>
              ))}
              <text x={f(AP)} y={748} fontWeight={600} letterSpacing={1}>
                AP
              </text>
              <text x={f(FP)} y={748} fontWeight={600} letterSpacing={1}>
                FP
              </text>
            </g>

            {/* Waterline and baseline. The baseline is the keel crease. */}
            <g strokeWidth={0.7}>
              <path d={`M330 ${DWL}H1070`} strokeDasharray="22 5 3 5" {...NS} />
              {line(330, KEEL, 1070, KEEL)}
              <path d={`M1033 ${DWL - 9}h14l-7 9z`} {...NS} />
            </g>
            <g
              stroke="none"
              fill={INK}
              fontSize={11}
              fontWeight={600}
              letterSpacing={1}
              textAnchor="end"
            >
              <text x={322} y={DWL + 4}>
                DWL
              </text>
              <text x={322} y={KEEL + 4}>
                BL
              </text>
            </g>

            {/* Hull: the paper boat's hull, exactly. */}
            <polygon points={hull} strokeWidth={1.9} {...NS} />
            <path
              d={`M${CX - RIM_HALF} ${RIM}L${f(transom[0])} ${transom[1]}Q760 600 ${f(stemHead[0])} ${stemHead[1]}L${CX + RIM_HALF} ${RIM}`}
              strokeWidth={1.4}
              {...NS}
            />
            <path
              d={`M${f(stemHead[0])} ${stemHead[1]}q12 -5 19 -17`}
              strokeWidth={1.1}
              {...NS}
            />
            <path d={wale(607) + wale(621)} strokeWidth={0.9} {...NS} />
            <path
              d={`M${f(sternX(706))} 706H${f(stemX(706))}`}
              strokeWidth={0.6}
              {...NS}
            />
            <g strokeWidth={0.8}>
              {ports.map((x) => (
                <rect
                  key={`p${x}`}
                  x={x}
                  y={594}
                  width={10}
                  height={8.5}
                  {...NS}
                />
              ))}
            </g>
            {/* Rudder, hung on the sternpost; stern lantern. */}
            <path
              d={`M${f(sternX(615))} 615L${CX - KEEL_HALF} ${KEEL}L${CX - KEEL_HALF - 26} ${KEEL + 2}L${f(sternX(615) - 20)} 618Z`}
              strokeWidth={1.1}
              {...NS}
            />
            <g strokeWidth={0.9}>
              {line(418, 552, 418, 538)}
              <circle cx={418} cy={533} r={4.5} {...NS} />
            </g>

            {/* Masts: dashed below deck, stepped on the keel. */}
            <g strokeWidth={0.7} strokeDasharray="6 4">
              {[MIZZEN, MAIN, FORE].map((m) =>
                line(m.x, RIM, m.x, 706, `b${m.x}`),
              )}
            </g>
            {[MIZZEN, MAIN, FORE].map((m) => (
              <g key={`m${m.x}`}>
                <g strokeWidth={1.7}>{line(m.x, RIM, m.x, m.top - 16)}</g>
                <g strokeWidth={1.35}>
                  {line(m.x, m.top + 10, m.x, m.cross - 12)}
                </g>
                <g strokeWidth={1}>{line(m.x, m.cross + 10, m.x, m.truck)}</g>
                <rect
                  x={m.x - 15}
                  y={m.top - 5}
                  width={30}
                  height={5}
                  strokeWidth={1}
                  style={PAPER}
                  {...NS}
                />
                <g strokeWidth={1}>
                  {line(m.x - 11, m.cross, m.x + 11, m.cross)}
                </g>
                <circle
                  cx={m.x}
                  cy={m.truck - 3}
                  r={2.5}
                  strokeWidth={0.9}
                  {...NS}
                />
              </g>
            ))}

            {/* Rigging. */}
            <g strokeWidth={0.6}>
              {stays.map(([a, b, c, d], i) => line(a, b, c, d, `s${i}`))}
            </g>
            <g strokeWidth={0.75}>
              {shrouds.map(([a, b, c, d], i) => line(a, b, c, d, `r${i}`))}
            </g>
            {/* The main shrouds are the sail's creases: the folded boat's edge. */}
            <g strokeWidth={1.25}>
              {line(MAIN.x, TIP, CX - SAIL_HALF, RIM)}
              {line(MAIN.x, TIP, CX + SAIL_HALF, RIM)}
            </g>

            {/* Yards and square sails. */}
            <g strokeWidth={1.3}>
              {[
                ...MAIN_SAILS.map(([y, h]) => [MAIN.x, y - 2, h + 6] as const),
                ...FORE_SAILS.map(([y, h]) => [FORE.x, y - 2, h + 6] as const),
                ...MIZZEN_SAILS.map(
                  ([y, h]) => [MIZZEN.x, y - 2, h + 6] as const,
                ),
                [MIZZEN.x, 500, 64] as const,
              ].map(([x, y, h]) => line(x - h, y, x + h, y, `y${x}-${y}`))}
            </g>
            {MAIN_SAILS.map((s, i) => squareSail(MAIN.x, s, `ms${i}`))}
            {FORE_SAILS.map((s, i) => squareSail(FORE.x, s, `fs${i}`))}
            {MIZZEN_SAILS.map((s, i) => squareSail(MIZZEN.x, s, `zs${i}`))}

            {/* Spanker on the mizzen; bowsprit, jib-boom and headsails. */}
            <g strokeWidth={1.2}>
              {line(MIZZEN.x + 4, 530, 462, 500)}
              {line(MIZZEN.x + 4, 580, 420, 586)}
              {line(1052, 584, 1190, 536)}
              {line(1150, 550, 1270, 508)}
            </g>
            {gaffSail(
              [MIZZEN.x + 4, 530],
              [462, 500],
              [420, 586],
              [MIZZEN.x + 4, 580],
            )}
            {triSail([943, 363], [1175, 529], [1035, 560], "staysail")}
            {triSail([956, 275], [1251, 498], [1095, 532], "jib")}

            {/* The one colour on the sheet: the masthead pennant. */}
            <path
              d={`M${MAIN.x + 1} 54L686 62L700 68L686 74L${MAIN.x + 1} 80Z`}
              style={VERMILION}
              stroke="none"
            />

            {/* Dimensions. */}
            <g strokeWidth={0.55} strokeDasharray="4 3">
              {line(CX - RIM_HALF, RIM + 4, CX - RIM_HALF, 834)}
              {line(CX + RIM_HALF, RIM + 4, CX + RIM_HALF, 834)}
              {line(MAIN.x + 10, MAIN.truck - 4, 1342, MAIN.truck - 4)}
              {line(1074, DWL, 1342, DWL)}
            </g>
            <g strokeWidth={0.7}>
              {dimension(AP, FP, 786, "LENGTH BETWEEN PERPENDICULARS")}
              {dimension(CX - RIM_HALF, CX + RIM_HALF, 826, "LENGTH ON DECK")}
              {line(1334, MAIN.truck - 4, 1334, DWL)}
              <path
                d={`M1334 ${MAIN.truck - 4}l-3 9h6ZM1334 ${DWL}l-3 -9h6Z`}
                fill={INK}
                stroke="none"
              />
              <text
                transform={`translate(1326 ${(MAIN.truck + DWL) / 2}) rotate(-90)`}
                textAnchor="middle"
                fontSize={10}
                letterSpacing={1.4}
                style={PENCIL}
                stroke="none"
              >
                AIR DRAUGHT
              </text>
            </g>

            {/* Scale. */}
            <g strokeWidth={0.8}>
              <rect x={130} y={911} width={300} height={7} {...NS} />
              {[0, 1, 2, 3].map((i) =>
                i % 2 === 0 ? (
                  <rect
                    key={`sb${i}`}
                    x={130 + i * 75}
                    y={911}
                    width={75}
                    height={7}
                    fill={INK}
                    {...NS}
                  />
                ) : null,
              )}
            </g>
            <g stroke="none" style={PENCIL} fontSize={10} textAnchor="middle">
              {["0", "5", "10", "15", "20 m"].map((t, i) => (
                <text
                  key={`sl${t}`}
                  x={130 + i * 75 + (i === 4 ? 6 : 0)}
                  y={934}
                >
                  {t}
                </text>
              ))}
            </g>
            <g stroke="none">
              <Label x={130} y={900}>
                Scale
              </Label>
            </g>

            {/* 1 — the title block, which holds the degree. */}
            {degree ? (
              <g>
                <rect
                  x={TB}
                  y={750}
                  width={W - 40 - TB}
                  height={210}
                  style={PAPER}
                  fillOpacity={0.82}
                  strokeWidth={1.4}
                  {...NS}
                />
                <g strokeWidth={0.8}>
                  {line(TB, 814, W - 40, 814)}
                  {line(TB, 888, W - 40, 888)}
                  {line(TB + 110, 888, TB + 110, 960)}
                  {line(TB + 250, 888, TB + 250, 960)}
                </g>
                <g stroke="none">
                  <Label x={TB + 12} y={765}>
                    Trained at
                  </Label>
                  <Label x={TB + 12} y={829}>
                    Qualification
                  </Label>
                  <Label x={TB + 12} y={904}>
                    Years
                  </Label>
                  <Label x={TB + 122} y={904}>
                    Grade
                  </Label>
                  <Label x={TB + 262} y={904}>
                    Drawn by
                  </Label>
                </g>
                <g stroke="none" fill={INK}>
                  <text fontSize={16.5} fontWeight={520}>
                    {institution.map((t, i) => (
                      <tspan key={t} x={TB + 12} y={786 + i * 19}>
                        {t}
                      </tspan>
                    ))}
                  </text>
                  <text
                    fontSize={24}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {award.map((t, i) => (
                      <tspan key={t} x={TB + 12} y={853 + i * 25}>
                        {t}
                      </tspan>
                    ))}
                  </text>
                  <text x={TB + 12} y={936} fontSize={14.5} fontWeight={520}>
                    {degree.years}
                  </text>
                  {degree.note ? (
                    <text x={TB + 122} y={936} fontSize={14.5} fontWeight={520}>
                      {degree.note}
                    </text>
                  ) : null}
                  <text x={TB + 262} y={936} fontSize={14.5} fontWeight={520}>
                    {name}
                  </text>
                </g>
                {marker(TB, 750, 1)}
              </g>
            ) : null}

            {/* 2 — on the left flank of the sail. */}
            {second ? (
              <g stroke="none" fill={INK}>
                {marker(141, 469, 2)}
                <text x={162} y={477} fontSize={22} fontWeight={620}>
                  {second.name}
                </text>
                <text x={162} y={500} fontSize={15} style={PENCIL}>
                  {[second.by, second.date].filter(Boolean).join(" · ")}
                </text>
              </g>
            ) : null}

            {/* 3 — on the top half, written along its crease. */}
            {third ? (
              <g fill={INK}>
                <g stroke="none">
                  {marker(141, 334, 3)}
                  <text fontSize={24} fontWeight={620}>
                    {wrap(third.name, 22).map((t, i) => (
                      <tspan key={t} x={162} y={342 + i * 27}>
                        {t}
                      </tspan>
                    ))}
                  </text>
                  <text fontSize={15} style={PENCIL}>
                    {[third.by, third.date]
                      .filter((t): t is string => Boolean(t))
                      .map((t, i) => (
                        <tspan key={t} x={162} y={396 + i * 19}>
                          {t}
                        </tspan>
                      ))}
                  </text>
                </g>
                <g strokeWidth={0.9}>{line(128, TIP, 470, TIP)}</g>
              </g>
            ) : null}
          </g>
        </symbol>
      </defs>
    </svg>
  );
}
