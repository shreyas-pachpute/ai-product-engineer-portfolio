# Shreyas Pachpute — AI Product Engineer

A portfolio told as a sea crossing, rendered as a real sea.

> **Models are the sea. I build the ships.**

An AI model is vast, powerful and indifferent to where you want to go. A demo
is a paper boat: it floats on a calm day. A product is a ship: built to be
depended on when the weather turns. The home page is that idea as one scroll
through a physically lit ocean; five more pages hold projects, skills,
experience, achievements and education, and there is a one-page résumé.

| Route           | What it is                                                   |
| --------------- | ------------------------------------------------------------ |
| `/`             | The crossing: five chapters, scroll-driven                   |
| `/projects`     | "The fleet": a numbered register of what has been built      |
| `/skills`       | "The rigging": skills as lines made fast to masts            |
| `/experience`   | "The log": a ruled ledger of roles, newest first             |
| `/achievements` | "Lights": each one a lamp on a dark page                     |
| `/education`    | "The plans": each qualification as a drawing title block     |
| `/resume`       | The résumé: a sheet of paper on screen, one A4 page in print |

The crossing's chapters, and what each stands for (the page says this in plain
words in every chapter, so nobody has to decode the metaphor):

| #   | Chapter       | Scene                         | Stands for                        |
| --- | ------------- | ----------------------------- | --------------------------------- |
| 0   | Harbour       | first light, a paper boat     | who this is; the model as the sea |
| 1   | Paper         | midday, the wind rises        | an AI demo                        |
| 2   | Drawing board | fog; a ship takes shape in it | an AI product, part by part       |
| 3   | Weather       | night, storm, a lighthouse    | production                        |
| 4   | Open water    | sunrise, the ship sails       | people relying on it (contact)    |

**The opening.** On a first visit the screen is a sheet of the boats' ruled
notebook paper with a paper boat's folding diagram on it and the name written
across it. The top half folds back to show the sky, the rest folds along the
dashed lines into a paper boat, and the boat sails down onto the water and
becomes the 3D paper boat floating there (it lands where the world reports
that boat to be). About three seconds; any input skips it.

**Leaning on the boats.** In the Paper chapter any paper boat can be pressed
(or tabbed to). A paper tag on a string offers six things a real product has
to survive, one for each part of the ship in the next chapter, and the boat
goes down the way a hull without that part would: it circles and dives (no
evals), capsizes (no guardrails), breaks its back (no architecture), soaks
through and sinks flat (no cost and latency control), vanishes in mist (no
observability), or is blown over (no interface). A slip then says what would
have held. The six are `PRESSURES` in `lib/site.ts`; the sinkings are
[`sea/fates.ts`](components/world/sea/fates.ts). The ship cannot be pressed.

**Contact** offers two equal ways to answer: email, or a 30-minute call on
Calendly (the booking link the previous site used, in `IDENTITY.booking`).

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

Pushing to `main` deploys to shreyaspachpute.in (Vercel).

## Changing what the site says

- **The crossing's words:** [`lib/site.ts`](lib/site.ts) — identity, contact
  details, every line of copy, the six parts of the ship, chapter lengths.
- **Projects, skills, experience, achievements, education, and the résumé:**
  [`lib/content.ts`](lib/content.ts). Typed arrays (`PRACTICE`, the résumé's
  evals, guardrails, observability, cost and latency lines, is the one drawn
  from code in his public repositories), and the only file to edit:
  the pages and the résumé all read from it, so they cannot disagree. Every
  fact in it traces to Shreyas's own earlier résumé, his public GitHub
  repositories or the public site of the product concerned; the top of the
  file says so. Nothing is invented to fill a gap. A page whose array is empty
  shows its layout bare and says it is waiting.

### The résumé PDF

`/resume` is the résumé as a web page, and its print styles (the end of
[`app/globals.css`](app/globals.css)) set it as one A4 page. The file people
download, `public/Shreyas-Pachpute-Resume.pdf`, is that page printed. After
changing `lib/content.ts`, remake it:

1. `npm run build && npm run start`
2. Open `http://localhost:3000/resume` in Chrome or Edge and print it
   (Ctrl+P): destination "Save as PDF", paper A4, margins "Default", with
   "Headers and footers" off and "Background graphics" on.
3. Save over `public/Shreyas-Pachpute-Resume.pdf`.

Check that it is still one page. If it has run on to a second, shorten the
text before making the type smaller: it is set at 8.6pt already.

## How it works

```
app/
  layout.tsx            fonts, metadata, the world (Stage) and the header: shared by every page
  page.tsx              the crossing
  projects/ skills/ experience/ achievements/ education/    the content pages
  resume/               the résumé (print styles make it one A4 page)
  globals.css           brand tokens, type, all text choreography, print
components/
  world/sea/            the 3D world (plain three.js; knows nothing about React)
  world/stage.tsx       mounts the world on a fixed canvas, lazily
  voyage/               the crossing: chapters, scroll driver, rail, callouts
  site/                 header and navigation, page shell, camera "shot" per page
  intro/intro.tsx       the opening (markup only; logic is an inline script)
lib/
  site.ts  content.ts   what the site says
  voyage.ts             shared scroll state      intro.ts   the opening's script
public/world/ship.glb   the ship (see Credits)   public/brand/   logo files
public/Shreyas-Pachpute-Resume.pdf               the résumé, printed from /resume
```

### One number drives the crossing

Scroll position becomes a single **chapter coordinate** (`0` at the top, `5`
at the bottom). The world is keyframed against it
([`sea/timeline.ts`](components/world/sea/timeline.ts)): camera, sun position,
cloud, fog, sea state, how much of the ship is revealed. Text elements carry
`data-from` / `data-to` and are switched on while the coordinate is in range
([`voyage/driver.tsx`](components/voyage/driver.tsx)); what "on" looks like is
CSS. The other pages each cut to a fixed shot past the end of that timeline.

### The world is lit, not painted

Every frame starts from one fact: where the sun or moon is.

- **Atmosphere** ([`sea/atmosphere.ts`](components/world/sea/atmosphere.ts)).
  Sky colour is computed by scattering that light through a shell of air
  (Rayleigh, Mie, ozone), into a small lookup the sky and the sea's reflections
  read. The same model runs on the CPU for a handful of directions, which is
  where the colour of the sunlight and of the ambient sky come from.
- **Clouds** ([`sea/clouds.ts`](components/world/sea/clouds.ts)). A 3D noise
  volume, ray-marched: soft edges, dark bases, lit rims. Marched at half
  resolution, a quarter of the pixels per frame, reprojected and accumulated.
- **Sea** ([`sea/waves.ts`](components/world/sea/waves.ts),
  [`sea/ocean.ts`](components/world/sea/ocean.ts)). A sum of peaked, mutually
  dragging waves, each moving at the speed deep-water physics gives a wave of
  its length. One table of waves per frame feeds both the shader and the code
  that floats the boats, so hulls sit on the water you see. Shading is Fresnel
  reflection of the sky and clouds, a mirrored pass for the boats and ship, sun
  glitter, light scattered back through crests, and foam.
- **Ship, paper boat, lighthouse** ([`sea/actors.ts`](components/world/sea/actors.ts)).
  Physically based materials under the same sun and sky. Bodies follow the
  water through damped springs: slow and heavy for the ship, quick for paper.
- **Film** ([`sea/film.ts`](components/world/sea/film.ts)). The scene is
  rendered in high dynamic range, then developed: bloom, automatic exposure, a
  film-like tone curve (AgX), a light grade, grain.

### Performance

Measured on an NVIDIA GTX 1050 at 1440×900: 9.5–12 ms of GPU time per frame on
the top tier (budget: 16.7 ms), and a steady 60 fps through a full scroll.

- **Three quality tiers**, chosen from the device, plus a **governor**: frame
  pacing is measured continuously, and if frames run late the world gives up
  resolution, then cloud detail and reflections, then wave detail. It never
  climbs back, so it cannot oscillate.
- **Nothing compiles or uploads mid-scroll.** All shaders are compiled in the
  background at start-up; the ship's textures and geometry are prepared off
  screen, one piece per frame, after it downloads.
- **The engine is not in the page's JavaScript.** It loads after the page is
  readable. Until then, and for good without WebGL 2, a flat sky-and-sea
  backdrop stands in.
- The render loop stops when the tab is hidden.

### Access

- **Reduced motion:** no opening, no entrances, and the world holds still; it
  redraws one frame when the scroll position changes. A leaned-on boat is
  simply gone, with the slip saying why; there is no sinking.
- **Keyboard and screen readers:** all text stays in the document. Links that
  travel take focus with them; tabbing into a chapter scrolls to it. Each
  paper boat is a button (Tab to it, Enter opens its tag, arrow keys move
  through it, Escape closes it), and what happened is announced.
- **No JavaScript, or a screen too small for a stage** (under about 280 px
  tall, e.g. a desktop at 400% zoom): the crossing is an ordinary readable
  document.
- **The opening** is an inline script, independent of the app's JavaScript: it
  finishes on its own and can be skipped from the first millisecond, even if
  the rest never loads.

## Brand

A new SP monogram is being chosen. Until it is rolled out, the mark below is
the one in use.

| Token       | Value     | Used for                      |
| ----------- | --------- | ----------------------------- |
| `ink`       | `#0B2A3F` | text                          |
| `paper`     | `#FBF3E4` | text at night, the menu sheet |
| `vermilion` | `#FF4B2B` | the mark's sail; key markers  |
| `sun`       | `#FFC53D` | numbered callouts             |

The mark is a mast, a half-disc sail and a wave: a **P**, an **S** on its
side, and a small ship (`MARK` in
[`components/brand/logo.tsx`](components/brand/logo.tsx); files in
[`public/brand/`](public/brand)). Type is Fraunces (display) and Mona Sans
(text). Every button is a swallowtail pennant.

## Credits

- **Ship:** "Dutch Ship Large 01" from Poly Haven, CC0 (public domain). Model,
  textures and cleanup by James Ray Cock; sails by Rico Cilliers; original
  model by Nicolò Zubbini. Compressed for the web; see
  [`public/world/CREDITS.txt`](public/world/CREDITS.txt).
- **Fraunces** (`assets/fonts/Fraunces-Display.ttf`, used to render the share
  card): SIL Open Font License, see `assets/fonts/Fraunces-OFL.txt`.
- **Techniques:** atmosphere coefficients after Bruneton and Hillaire; cloud
  rendering after Schneider (Horizon Zero Dawn) and Hillaire (Frostbite); the
  wave sum after afl_ext and Acerola; AgX tone mapping as implemented in
  three.js and Filament.

## Earlier versions

An illustrated, cel-shaded version of the crossing was live before this one,
and before that a multi-page site. Both are in git history. Old write-ups in
[`content/`](content) are not published or linked.
