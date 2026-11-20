/**
 * What the crossing says, and the list of pages.
 *
 * IDENTITY
 * Name, title and contact details. The contact values are the verified
 * ones this project already held; none were invented.
 *
 * THE COPY
 * The chapter text is a positioning statement told as a metaphor: models
 * are the sea, products are ships, and an AI product engineer is the
 * shipwright. It describes the craft. The one place it names real work is
 * the last chapter, and those facts come from lib/content.ts, which is
 * where career history, projects and numbers live and where their sources
 * are recorded.
 *
 * `LOGBOOK` is an optional list of work shown in the last chapter. It is
 * empty because the Projects page now does that job; leave it empty and
 * nothing renders.
 */

export const IDENTITY = {
  name: "Shreyas Pachpute",
  role: "AI Product Engineer",
  email: "shreyaspachpute1107@gmail.com",
  /** The booking page his previous site used (shreyaspachpute-in.vercel.app). */
  booking: "https://calendly.com/shreyaspachpute1107/30min",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shreyaspachpute/" },
    { label: "GitHub", href: "https://github.com/shreyas-pachpute" },
  ],
} as const;

export const TAGLINE = "Models are the sea. I build the ships.";

export const DESCRIPTION =
  "Shreyas Pachpute is an AI Product Engineer: he designs and builds products on top of AI models. Models are the sea; products are the ships built to cross it.";

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
    to: 3,
    target: 2.46,
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
 * components/world/sea/timeline.ts; the anatomy list uses it to ink in
 * each part at the moment that part appears on the model.
 */
export const BUILD = { from: 2.1, to: 2.78 } as const;

/**
 * THE COMPARISON, SPELLED OUT
 *
 * A visitor who has never seen this site should not have to decode it.
 * So every chapter carries a `key`: one short line that says, in plain
 * words, what the thing on screen stands for in AI product work. The
 * first screen states who this is and what he does before anything else.
 */
export const COPY = {
  harbour: {
    lines: ["Models are the sea.", "I build the ships."],
    body: "An AI model is like the sea: vast, powerful, and indifferent to where you want to go. I am an AI Product Engineer. I design and build the products that carry people across it.",
    key: "The sea is the model. The paper boat is a demo. The ship is the product.",
    cue: "Begin the crossing",
  },
  paper: {
    key: "The paper boat: an AI demo",
    title: "Anyone can fold a boat.",
    body: [
      "A model, a prompt and an afternoon, and you have a demo. It floats, it is charming, and on a calm day it is everything it needs to be.",
      "Then somebody leans on it.",
    ],
    fold: "Fold another",
    hint: "or tap the water. Then press a boat.",
    lean: "Lean on it",
    again: "Anyone can fold another.",
  },
  board: {
    key: "The ship: an AI product",
    title: "A ship is a set of decisions.",
    body: "Same sea, same model. What turns a demo into a product is the engineering nobody sees from the dock.",
    closing: "None of it is the model. All of it is the product.",
  },
  weather: {
    key: "The weather: production",
    title: "Then comes the weather.",
    body: [
      "Real users, messy inputs, a traffic spike, a model update that changes behaviour overnight. Seaworthy is what is left after the conditions nobody planned for.",
      "The paper boat is still aboard. It was a good idea. It needed a ship.",
    ],
  },
  "open-water": {
    key: "Open water: people relying on it",
    title: "Built to be depended on.",
    body: "That is the job, and it is the work I do: the AI behind DTAXO, used by 119 CPA firms, and the agents inside Commercient. If you are building an AI product that has to hold, I would like to hear about it.",
    signal: "Send a signal",
    write: "Send a message",
    book: "Book a call",
    bookLine: "30 minutes, any time that suits",
    bookNote: "Opens Calendly",
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
    built: 0.06,
  },
  {
    part: "ballast",
    name: "Ballast",
    means: "Guardrails",
    line: "Weight in the right place, so it rights itself.",
    built: 0.14,
  },
  {
    part: "hull",
    name: "Hull",
    means: "Architecture",
    line: "What holds when the water pushes back.",
    built: 0.26,
  },
  {
    part: "stores",
    name: "Stores",
    means: "Cost and latency",
    line: "How far it can actually go.",
    built: 0.36,
  },
  {
    part: "compass",
    name: "Compass",
    means: "Observability",
    line: "Knowing where you are without guessing.",
    built: 0.46,
  },
  {
    part: "rigging",
    name: "Rigging",
    means: "Interface",
    line: "Where force becomes direction.",
    built: 0.78,
  },
];

/**
 * LEANING ON A PAPER BOAT
 *
 * In the paper chapter the reader can press any paper boat and choose
 * something a real product has to survive. The boat does not survive it.
 * There is one pressure for each part of the ship in the next chapter, in
 * the same order as ANATOMY, so the reader arrives at the drawing board
 * already knowing what each part is for:
 *
 *   ask    what the reader chooses (the menu on the boat's tag)
 *   held   what would have held, said once the boat is past saving
 *
 * How each one sinks is in components/world/sea/fates.ts; the order there
 * must match the order here.
 */
export const PRESSURES: readonly {
  part: AnatomyPart;
  ask: string;
  held: string;
}[] = [
  {
    part: "keel",
    ask: "A wrong answer nobody catches",
    held: "Evals would have caught it.",
  },
  {
    part: "ballast",
    ask: "Someone tries to break in",
    held: "Guardrails would have righted it.",
  },
  {
    part: "hull",
    ask: "1,000 users at once",
    held: "Architecture would have carried them.",
  },
  {
    part: "stores",
    ask: "The bill at the end of the month",
    held: "Counting cost and latency would have got it home.",
  },
  {
    part: "compass",
    ask: "It breaks at 3 a.m.",
    held: "Observability would have seen it go.",
  },
  {
    part: "rigging",
    ask: "A stranger tries to use it",
    held: "An interface would have used that wind.",
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

/**
 * THE OTHER PAGES
 *
 * The crossing is the home page. Each of these is its own route, set in a
 * different corner of the same world (`shot` is a camera position in the
 * world's timeline, past the end of the crossing) and laid out on its own
 * idea rather than a shared template:
 *
 *   Projects      sea trials — the real ships, under the same pressures
 *   Skills        the sail plan — every line has one job
 *   Experience    dead reckoning — a chart of the track, leg by leg
 *   Achievements  the List of Lights — fixed points anyone can check
 *   Education     unfold the boat — where the trade was learned
 *
 * What they say comes from lib/content.ts. A page with nothing to list
 * shows its structure and says it is waiting, rather than inventing.
 * The résumé (/resume) is a sheet of paper, not a scene, so it is not in
 * this list; the header links to it separately.
 */
export type PageId =
  "projects" | "skills" | "experience" | "achievements" | "education";

export type SitePage = {
  id: PageId;
  href: string;
  /** Name in the navigation. */
  label: string;
  /** Where the world's camera sits for this page. */
  shot: number;
  tone: "day" | "night";
  /** Name of the page's idea, and the line that ties it to the work. */
  title: string;
  line: string;
};

export const PAGES: readonly SitePage[] = [
  {
    id: "projects",
    href: "/projects",
    label: "Projects",
    shot: 10,
    tone: "day",
    title: "Sea trials.",
    line: "On the crossing you sank paper boats. These are the real ships: choose one, put it through the same pressures, and see what holds it.",
  },
  {
    id: "skills",
    href: "/skills",
    label: "Skills",
    shot: 6,
    tone: "day",
    title: "The sail plan.",
    line: "A ship's rigging turns wind into direction, and every line has one job. Give the ship an order and see which of my skills it takes.",
  },
  {
    id: "experience",
    href: "/experience",
    label: "Experience",
    shot: 7,
    tone: "day",
    title: "Dead reckoning.",
    line: "A navigator finds the ship from a known start and each leg sailed. This is my track: where I started, each role a leg, and what I built along the way.",
  },
  {
    id: "achievements",
    href: "/achievements",
    label: "Achievements",
    shot: 8,
    tone: "night",
    title: "Lights.",
    line: "A light is a fixed point anyone can check their position against. These are mine: things finished, shipped or recognised.",
  },
  {
    id: "education",
    href: "/education",
    label: "Education",
    shot: 9,
    tone: "day",
    title: "The plans.",
    line: "Nobody builds a ship without learning to read the plans first. This is where I learned.",
  },
];

export function page(id: PageId): SitePage {
  const found = PAGES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown page: ${id}`);
  return found;
}
