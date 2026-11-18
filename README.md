# Shreyas Pachpute — AI Product Engineer

A one-page portfolio told as a sea crossing.

> **Models are the sea. I build the ships.**

A model is vast, powerful and indifferent to where you want to go. A demo is
a paper boat: it floats on a calm day. A product is a ship: built to be
depended on when the weather turns. The site is that idea, start to finish —
one illustrated 3D sea that the page scrolls through, in five chapters.

| #   | Chapter       | Scene                       | What it says                           |
| --- | ------------- | --------------------------- | -------------------------------------- |
| 0   | Harbour       | dawn, one paper boat        | Models are the sea. I build the ships. |
| 1   | Paper         | flat noon, the swell builds | Anyone can fold a boat.                |
| 2   | Drawing board | the sea becomes paper       | A ship is a set of decisions.          |
| 3   | Weather       | night, storm, a lighthouse  | Then comes the weather.                |
| 4   | Open water    | sunrise, the ship sails     | Built to be depended on. (Contact)     |

## Run it

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:3000
```

| Script              | Does                            |
| ------------------- | ------------------------------- |
| `npm run dev`       | Development server (Turbopack)  |
| `npm run build`     | Production build (fully static) |
| `npm run start`     | Serve the production build      |
| `npm run typecheck` | `tsc --noEmit`                  |
| `npm run lint`      | ESLint                          |
| `npm run format`    | Prettier                        |

Before deploying, set `NEXT_PUBLIC_SITE_URL` to the real domain. The
canonical URL, sitemap and share-card image URL are built from it.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
three.js. Six runtime dependencies. No animation library, no smooth-scroll
library, no UI kit: scrolling is the browser's own, and the motion is CSS.

## Changing what the site says

**Everything the site says is in [`lib/site.ts`](lib/site.ts).** Name, title,
contact details, every line of copy, the six parts of the ship, and the
length of each chapter.

The site currently states only a name, a title, and contact details. That is
deliberate: it makes no claims about clients, projects or results.

**To add real work later:** fill in `LOGBOOK` in `lib/site.ts`.

```ts
export const LOGBOOK: readonly LogbookEntry[] = [
  {
    title: "…",
    summary: "One line: what it is.",
    href: "https://…",
    year: "2026",
  },
];
```

It is empty on purpose and renders nothing while empty; add entries and they
appear in the last chapter, above the contact details.

## How it works

```
app/
  layout.tsx            fonts, metadata, structured data, the intro's head script
  page.tsx              the page: Stage + Header + Rail + Voyage + Driver + Intro
  globals.css           the brand: tokens, type, and all of the text choreography
  opengraph-image.tsx   the share card          apple-icon.tsx / icon.svg   icons
components/
  world/engine/         the 3D world (plain three.js; knows nothing about React)
  world/stage.tsx       mounts the world on a fixed canvas, lazily
  voyage/voyage.tsx     the five chapters, as server-rendered HTML
  voyage/driver.tsx     scroll position → chapter coordinate
  voyage/rail.tsx       chapter navigation      voyage/anatomy-pins.tsx   callouts
  intro/intro.tsx       the opening
  brand/logo.tsx        the mark and lockup
lib/
  site.ts               all content             voyage.ts   shared scroll state
public/brand/           logo files (SVG)
```

### One number drives everything

Scroll position is converted to a single **chapter coordinate**: `0` at the
top, `5` at the bottom, chapter _N_ starting at _N_. The 3D world, the text,
and the navigation all read that one number, so they cannot fall out of step.

- **The world** is keyframed against it
  ([`engine/timeline.ts`](components/world/engine/timeline.ts)): camera, time
  of day, sea state, how much of the ship is built. Scroll anywhere, in
  either direction, at any speed, and the scene is exactly what the keyframes
  say. There are no tweens to start, stop or clean up.
- **The text** is switched by it. Any element with `data-from` / `data-to`
  gets a `data-on` attribute while the coordinate is in that range
  ([`voyage/driver.tsx`](components/voyage/driver.tsx)). What "on" looks like
  is CSS. The driver never animates anything itself.

### The look

Everything in the world is drawn in one pass
([`engine/post.ts`](components/world/engine/post.ts)): each surface writes its
colour and an id, and outlines are inked wherever the id changes. That is why
the sea, the boats and the lighthouse read as one print rather than as 3D
objects with different materials. Colours are flat, from five palettes — one
per time of day ([`engine/palette.ts`](components/world/engine/palette.ts)).

The waves are defined once ([`engine/waves.ts`](components/world/engine/waves.ts))
and compiled to both the shader that draws the sea and the code that floats
the boats on it, so a hull always sits on the water you can see.

### Motion

Each chapter's text arrives its own way, and the way is part of the idea:
lines **rise** over an edge in the harbour, **unfold** like paper, are
**lettered** onto the drawing board (where each part inks in as it is built
on the model — tied to scroll, not to a clock), are found by a **sweep** of
light in the storm, and **glide** in on open water. Leaving is always the
same short fade. It is all in section 6 of `app/globals.css`.

### The opening

On the first visit of a session, the mark assembles on a horizon line, the
line runs to the edges of the screen, the page opens along it, and the mark
travels to its place in the header (about 2.5 seconds). It is not a loading
screen: the page is already rendered underneath and the world loads behind
it. Any click, key, touch or scroll skips it.

## Brand

Four colours, two typefaces, one button shape.

| Token       | Value     | Used for                             |
| ----------- | --------- | ------------------------------------ |
| `ink`       | `#0B2A3F` | text, every outline                  |
| `paper`     | `#FBF3E4` | paper, sails, text at night          |
| `vermilion` | `#FF4B2B` | the sail: the one loud colour        |
| `sun`       | `#FFC53D` | pennant yellow: markers and callouts |

- **The mark** is a mast, a half-disc sail and a wave: a **P**, an **S** on
  its side, and a small ship. The ship in the 3D world carries the same
  half-disc sail. Geometry: `MARK` in
  [`components/brand/logo.tsx`](components/brand/logo.tsx).
- **Files** in [`public/brand/`](public/brand): `mark.svg`,
  `mark-on-dark.svg`, `mark-mono.svg`, `badge.svg` (the favicon),
  `lockup.svg`, `lockup-on-dark.svg` (wordmark outlined, no font needed).
- **Type:** Fraunces (display; soft and "wonky" axes on) and Mona Sans
  (text, set wide for labels). Both self-hosted by `next/font`.
- **The flag:** every button is a swallowtail pennant, like the one at the
  ship's masthead.

## Performance and access

- **The 3D engine is not in the page's JavaScript.** It loads after the page
  is readable, builds in small steps, and compiles its shaders off the main
  thread before drawing. Until then (and for good, without WebGL 2) a flat
  sky-and-sea backdrop stands in: no blank, no spinner.
- **Resolution adapts.** Pixel ratio is capped (1.5, or 1.25 on phones and
  low-core machines) and steps down if the first seconds run slow.
- **The render loop stops** when the tab is hidden.
- **Reduced motion:** no opening, no entrances, and the world holds still —
  it redraws one frame when the scroll position changes, so it still tells
  the story.
- **Keyboard and screen readers:** all text stays in the document the whole
  time. Tabbing into a chapter that is not showing scrolls to it.
- **No JavaScript:** the page is an ordinary readable document.
- **Phones:** a tall layout (text above, subject below), and the camera
  re-frames to match.

## Earlier versions

This replaced a multi-page site (work, notes, agents, services, about). Its
write-ups are still on disk in [`content/`](content) but are **not published
or linked** from the new site. The old code is in git history.

## Licence notes

`assets/fonts/Fraunces-Display.ttf` is a static cut of Fraunces used to
render the share card, under the SIL Open Font License
([`assets/fonts/Fraunces-OFL.txt`](assets/fonts/Fraunces-OFL.txt)).
