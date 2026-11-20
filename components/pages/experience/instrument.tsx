/**
 * The dividers, drawn: brass arms with steel points, a knurled hinge with a
 * grip. Static drawings; ./dividers.ts moves them. Colours come from
 * experience.css (the gradient stops carry classes), so this file holds no
 * colour literals.
 *
 * An arm is drawn lying along +x, hinge end at x = 0, point at x = 300; it
 * is stretched to the arm's length and turned into place by its transform.
 */

export function InstrumentDefs() {
  return (
    <svg className="rk-defs" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="rk-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="rk-s-brass-hi" />
          <stop offset="0.34" className="rk-s-brass" />
          <stop offset="0.62" className="rk-s-brass" />
          <stop offset="1" className="rk-s-brass-lo" />
        </linearGradient>
        <linearGradient id="rk-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="rk-s-steel-hi" />
          <stop offset="0.45" className="rk-s-steel" />
          <stop offset="1" className="rk-s-steel-lo" />
        </linearGradient>
        <radialGradient id="rk-boss" cx="0.36" cy="0.3" r="0.82">
          <stop offset="0" className="rk-s-brass-hi" />
          <stop offset="0.5" className="rk-s-brass" />
          <stop offset="1" className="rk-s-brass-lo" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ArmArt() {
  return (
    <svg
      className="rk-arm__art"
      viewBox="0 0 300 28"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* The flat of the leg, tapering to the collar. */}
      <path
        className="rk-p-brass"
        d="M2 4 Q2 2.6 6 2.6 L226 10.2 L226 17.8 L6 25.4 Q2 25.4 2 24Z"
      />
      {/* A bevel down the middle, light above and shade below. */}
      <path className="rk-p-gleam" d="M10 6.2 L220 11.6" />
      <path className="rk-p-ridge" d="M10 14 L222 14" />
      <path className="rk-p-edge" d="M10 22 L220 16.6" />
      <rect
        className="rk-p-collar"
        x="222"
        y="9.4"
        width="11"
        height="9.2"
        rx="1.8"
      />
      <path className="rk-p-steel" d="M232 11 L300 14 L232 17 Z" />
      <path className="rk-p-glint" d="M236 12.4 L288 13.8" />
    </svg>
  );
}

export function ShadeArt() {
  return (
    <svg
      className="rk-shade__art"
      viewBox="0 0 300 28"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 4 L228 10.5 L300 14 L228 17.5 L2 24 Z" />
    </svg>
  );
}

const KNURL = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return `M${(c * 11.2).toFixed(2)} ${(s * 11.2).toFixed(2)}L${(c * 13.6).toFixed(2)} ${(s * 13.6).toFixed(2)}`;
}).join("");

export function HeadArt() {
  return (
    <svg
      className="rk-head__art"
      viewBox="-24 -24 48 48"
      aria-hidden="true"
      focusable="false"
    >
      {/* The grip, standing up off the hinge. */}
      <rect
        className="rk-p-brass"
        x="-4.2"
        y="-23.5"
        width="8.4"
        height="14"
        rx="2.6"
      />
      <path
        className="rk-p-grip"
        d="M-4.2 -20.6h8.4M-4.2 -17.8h8.4M-4.2 -15h8.4"
      />
      <circle className="rk-p-boss" r="13.8" />
      <path className="rk-p-knurl" d={KNURL} />
      <circle className="rk-p-ring" r="9" />
      <circle className="rk-p-screw" r="4.4" />
      <path className="rk-p-slot" d="M-3 -1.3 L3 1.3" />
    </svg>
  );
}
