/**
 * Everything the site says, in one place.
 *
 * IDENTITY
 * Name, title and contact details are the only personal facts on the site.
 * The contact values are the verified ones this project already held; none
 * were invented, and nothing else about the person (history, clients,
 * projects, numbers) is stated anywhere, because none of it has been
 * supplied yet.
 *
 * THE COPY
 * The chapter text is a positioning statement told as a metaphor: models
 * are the sea, products are ships, and an AI product engineer is the
 * shipwright. It describes the craft, not a track record — every line is
 * true of the discipline and none claims a result.
 *
 * ADDING REAL WORK LATER
 * `LOGBOOK` is the slot for it. It is empty on purpose. Add entries and
 * the Open Water chapter grows a logbook automatically (see
 * components/voyage/logbook.tsx); leave it empty and nothing renders.
 */

export const IDENTITY = {
  name: "Shreyas Pachpute",
  role: "AI Product Engineer",
  email: "shreyaspachpute1107@gmail.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shreyaspachpute/" },
    { label: "GitHub", href: "https://github.com/shreyas-pachpute" },
  ],
} as const;

export const TAGLINE = "Models are the sea. I build the ships.";

export const DESCRIPTION =
  "Shreyas Pachpute is an AI Product Engineer. Models are the sea; products are the ships built to cross it.";

/**
 * Canonical origin, with protocol and no trailing slash. It feeds the
 * canonical URL, the sitemap, the structured data and the share card.
 *
 * Set NEXT_PUBLIC_SITE_URL to the real domain before deploying. On Vercel
 * it falls back to the project's production URL; anywhere else, to
 * localhost, which is only right on your own machine.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

/**
 * THE CROSSING
 *
 * The page is one scroll through five chapters. Scroll position is turned
 * into a single number, the chapter coordinate: 0 at the top, 5 at the
 * bottom, with chapter N beginning at N. Everything on the page — the 3D
 * world, which text is showing, the navigation — reads that one number.
 *
 *   length   how much scrolling the chapter takes, in viewport heights
 *   from/to  the stretch of the coordinate where the chapter's text is up.
 *            The gaps between chapters are deliberate: the text clears
 *            out while the world changes scene, then the next arrives.
 *   target   where a navigation link to the chapter lands
 *   tone     which text colour its sky calls for
 */
export type ChapterId =
  "harbour" | "paper" | "board" | "weather" | "open-water";

export type Chapter = {
  id: ChapterId;
  /** Short name, used by the route rail. */
  port: string;
  tone: "day" | "night";
  length: number;
  from: number;
  to: number;
  target: number;
};

export const CHAPTERS: readonly Chapter[] = [
  {
    id: "harbour",
    port: "Harbour",
    tone: "day",
    length: 1.3,
    from: -1,
    to: 0.7,
    target: 0,
  },
  {
    id: "paper",
    port: "Paper",
    tone: "day",
    length: 2,
    from: 0.96,
    to: 1.82,
    target: 1.3,
  },
  {
    id: "board",
    port: "Drawing board",
    tone: "day",
    length: 3.4,
    from: 2.06,
    to: 2.97,
    target: 2.52,
  },
  {
    id: "weather",
    port: "Weather",
    tone: "night",
    length: 2.1,
    from: 3.16,
    to: 3.93,
    target: 3.5,
  },
  {
    id: "open-water",
    port: "Open water",
    tone: "day",
    length: 1.5,
    from: 4.16,
    to: 99,
    target: 4.8,
  },
];

export const LAST_CHAPTER = CHAPTERS.length;

export function chapter(id: ChapterId): Chapter {
  const found = CHAPTERS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown chapter: ${id}`);
  return found;
}

/**
 * When the ship is being built on the drawing board, in chapter
 * coordinates. Mirrors the two "paper" keyframes in
 * components/world/engine/timeline.ts; the anatomy list uses it to ink in
 * each part at the moment that part appears on the model.
 */
export const BUILD = { from: 2.1, to: 2.86 } as const;

export const COPY = {
  harbour: {
    lines: ["Models are the sea.", "I build the ships."],
    body: "Vast, powerful, and not especially interested in where you want to go. I design and build the AI products that cross it anyway.",
    cue: "Begin the crossing",
  },
  paper: {
    title: "Anyone can fold a boat.",
    body: [
      "A demo is a paper boat. It floats, it is charming, and on a calm day it is everything it needs to be.",
      "Then somebody leans on it.",
    ],
    fold: "Fold another",
    hint: "or tap the water",
  },
  board: {
    title: "A ship is a set of decisions.",
    body: "Same sea, different object. What makes it a ship is everything you cannot see from the dock.",
    closing: "None of it is the model. All of it is the product.",
  },
  weather: {
    title: "Then comes the weather.",
    body: [
      "Seaworthy is not a feeling. It is what is left after the conditions nobody planned for.",
      "The paper boat is still aboard. It was a good idea. It needed a ship.",
    ],
  },
  "open-water": {
    title: "Built to be depended on.",
    body: "If you are building something that has to hold, I would like to hear about it.",
    signal: "Send a signal",
  },
} as const;

/**
 * The anatomy of a seaworthy product: six parts of a ship, each standing
 * for one of the things that separates an AI product from an AI demo.
 * `part` must match a ShipPart in the world engine; the label is pinned to
 * that point on the model.
 */
export type AnatomyPart =
  "keel" | "ballast" | "hull" | "stores" | "compass" | "rigging";

export const ANATOMY: readonly {
  part: AnatomyPart;
  name: string;
  means: string;
  line: string;
  /** Build progress (0–1) at which this part is on the model. */
  built: number;
}[] = [
  {
    part: "keel",
    name: "Keel",
    means: "Evals",
    line: "The line everything else is built along.",
    built: 0.14,
  },
  {
    part: "ballast",
    name: "Ballast",
    means: "Guardrails",
    line: "Weight in the right place, so it rights itself.",
    built: 0.46,
  },
  {
    part: "hull",
    name: "Hull",
    means: "Architecture",
    line: "What holds when the water pushes back.",
    built: 0.6,
  },
  {
    part: "stores",
    name: "Stores",
    means: "Cost and latency",
    line: "How far it can actually go.",
    built: 0.72,
  },
  {
    part: "compass",
    name: "Compass",
    means: "Observability",
    line: "Knowing where you are without guessing.",
    built: 0.82,
  },
  {
    part: "rigging",
    name: "Rigging",
    means: "Interface",
    line: "Where force becomes direction.",
    built: 0.95,
  },
];

/** Chapter coordinate at which a part of the anatomy is built. */
export function builtAt(progress: number): number {
  return BUILD.from + progress * (BUILD.to - BUILD.from);
}

export type LogbookEntry = {
  title: string;
  /** One line: what it is. */
  summary: string;
  href?: string;
  year?: string;
};

/** Real work goes here when there is real work to list. Deliberately empty. */
export const LOGBOOK: readonly LogbookEntry[] = [];
