import { IDENTITY } from "@/lib/site";

/**
 * The opening's markup. No JavaScript of its own.
 *
 * The screen is a sheet of the ruled notebook paper the site's boats are
 * folded from. A paper boat's folding diagram is printed on it, and the
 * name is written across the top. Then the sheet does what the diagram
 * says: the top half folds back, which shows the sky behind it; the rest
 * folds along the dashed lines into a paper boat; and the boat sails down
 * onto the water and becomes the paper boat floating there, while the
 * name moves up into the page's heading. About three seconds, once per
 * browser session.
 *
 * It is not a loading screen. Nothing waits on it: the page underneath is
 * already rendered and the 3D world is loading behind it the whole time.
 *
 * The sheet is cut into pieces along the diagram's lines (the geometry is
 * in section 9 of app/globals.css, in units of the screen), and every fold
 * is a transform of one piece, so the compositor can run it while the 3D
 * world is busy starting up on the main thread. The timing, the skip and
 * the hand-off are the inline script in lib/intro.ts, which is why this is
 * a plain server-rendered component: the opening works, and can be
 * skipped, before any of the app's JavaScript has loaded, or if it never
 * does.
 */
const PIECES = ["foot", "bl", "br", "tl", "tr", "hull", "sail"] as const;
/** The pieces that fold away; the others are the boat. */
const FOLDS: readonly string[] = ["foot", "bl", "br", "tl", "tr"];

export function Intro() {
  return (
    <div className="intro" role="presentation">
      <div className="intro__fold">
        {/* Under the seams between pieces, until they start to fold. */}
        <div className="intro__under intro__paper" />
        {/* The script sets inline styles on these before React arrives. */}
        <div className="intro__boat" suppressHydrationWarning>
          {PIECES.map((piece) => (
            <div
              key={piece}
              className={`intro__piece intro__paper intro__piece--${piece}`}
            >
              {FOLDS.includes(piece) ? <i className="intro__shade" /> : null}
            </div>
          ))}
          {/* The diagram. Positions are set by the inline script. */}
          <svg className="intro__creases" aria-hidden="true">
            <g className="intro__crease intro__crease--2">
              <line data-crease="sl" suppressHydrationWarning />
              <line data-crease="sr" suppressHydrationWarning />
            </g>
            <g className="intro__crease intro__crease--3">
              <line data-crease="hl" suppressHydrationWarning />
              <line data-crease="hr" suppressHydrationWarning />
              <line data-crease="keel" suppressHydrationWarning />
            </g>
            <g
              className="intro__crease intro__crease--2"
              data-step="2"
              suppressHydrationWarning
            >
              <circle r="11" />
              <text dy="0.36em">2</text>
            </g>
            <g
              className="intro__crease intro__crease--3"
              data-step="3"
              suppressHydrationWarning
            >
              <circle r="11" />
              <text dy="0.36em">3</text>
            </g>
          </svg>
        </div>
        <div className="intro__leaf intro__paper">
          <span className="intro__step label" aria-hidden="true">
            1
          </span>
          <i className="intro__shade" />
        </div>
      </div>
      <div className="intro__words" aria-hidden="true">
        <span className="wordmark intro__name wipe" suppressHydrationWarning>
          <span>{IDENTITY.name}</span>
        </span>
        <span className="label intro__role" suppressHydrationWarning>
          {IDENTITY.role}
        </span>
      </div>
      {/* Any input skips; this is the visible, focusable way to say so. */}
      <button type="button" className="label intro__skip">
        Skip
      </button>
    </div>
  );
}
