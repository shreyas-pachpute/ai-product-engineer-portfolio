import { LINES, SAIL_IDS, ropePath, sailPath, type SailId } from "./plan";

/**
 * Rope and canvas, moved by springs.
 *
 * Every line has one number, its slack (1 hanging at its slackest, 0 bar
 * taut), and every sail one number, how full it is. Each is a damped
 * spring. Hauled, a line is stiff and under-damped, so it comes up past
 * straight, twangs and settles, the way rope does when it takes load; let
 * go, it is soft and falls back into its curve with a small bounce. A sail
 * fills just after its lines haul, and overshoots a little as it snaps
 * full.
 *
 * The springs are stepped in one requestAnimationFrame loop that writes the
 * SVG path data directly (no React state per frame). The loop stops when
 * everything has settled, and when the tab is hidden everything is put
 * where it is going and the loop does not run at all. With reduced motion
 * there is no loop: states are written at once.
 */

type Spring = {
  x: number;
  v: number;
  to: number;
  k: number;
  c: number;
  /** Not before this time (ms, performance.now). */
  start: number;
  /** The value last written to the DOM. */
  shown: number;
};

const HAUL = { k: 240, c: 15.5 };
const EASE_OFF = { k: 62, c: 7.2 };
const FILL = { k: 150, c: 10.5 };
const SPILL = { k: 55, c: 8.5 };

function spring(x: number): Spring {
  return { x, v: 0, to: x, k: HAUL.k, c: HAUL.c, start: 0, shown: x };
}

export class Rigging {
  private ropes: Spring[];
  private sails: Spring[];
  private raf = 0;
  private last = 0;
  private reduced: boolean;
  private readonly media: MediaQueryList;

  constructor(
    private readonly ropeEls: readonly (SVGPathElement | null)[],
    private readonly hitEls: readonly (SVGPathElement | null)[],
    private readonly sailEls: Readonly<
      Record<
        SailId,
        { cut: SVGPathElement | null; seams: SVGPathElement | null }
      >
    >,
  ) {
    // Everything starts as the server drew it: slack and empty.
    this.ropes = LINES.map(() => spring(1));
    this.sails = SAIL_IDS.map(() => spring(0));
    this.media = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = this.media.matches;
    this.media.addEventListener("change", this.onMotionPref);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.media.removeEventListener("change", this.onMotionPref);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  /** Haul the lines that are live, let the rest go. */
  set(live: readonly boolean[], delay = 0): void {
    const now = performance.now() + delay;
    const hauling: number[] = [];
    LINES.forEach((line, i) => {
      const s = this.ropes[i]!;
      const to = live[i] ? 0 : 1;
      if (s.to === to) return;
      s.to = to;
      if (to === 0) {
        hauling.push(i);
      } else {
        s.k = EASE_OFF.k;
        s.c = EASE_OFF.c;
        // Not all at once: rope does not let go in step.
        s.start = now + (line.n % 4) * 22;
      }
    });
    // Hauled one after another, top to bottom, a beat after the others go.
    hauling
      .sort((a, b) => LINES[a]!.anchor.y - LINES[b]!.anchor.y)
      .forEach((i, rank) => {
        const s = this.ropes[i]!;
        s.k = HAUL.k;
        s.c = HAUL.c;
        s.start = now + 120 + rank * 70;
      });

    SAIL_IDS.forEach((id, j) => {
      const s = this.sails[j]!;
      const firstHaul = hauling.findIndex((i) => LINES[i]!.sail === id);
      const full = LINES.some((line, i) => live[i] && line.sail === id);
      const to = full ? 1 : 0;
      if (s.to === to) return;
      s.to = to;
      if (to === 1) {
        s.k = FILL.k;
        s.c = FILL.c;
        s.start = now + 120 + Math.max(0, firstHaul) * 70 + 140;
      } else {
        s.k = SPILL.k;
        s.c = SPILL.c;
        s.start = now + 40;
      }
    });
    this.kick();
  }

  /** A touch on a line: it shivers, more if it is taut. */
  pluck(i: number): void {
    if (this.reduced || document.hidden) return;
    const s = this.ropes[i];
    if (!s) return;
    const now = performance.now();
    if (s.start > now) return;
    s.v += s.to === 0 ? -2.4 : 1.2;
    this.kick();
  }

  private kick(): void {
    if (this.reduced || document.hidden) {
      this.settleAll();
      return;
    }
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  private readonly frame = (now: number): void => {
    // A long gap (a dropped frame, a slow device) is stepped as one
    // ordinary frame rather than all at once.
    const dt = Math.min(0.034, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    let moving = false;
    for (let i = 0; i < this.ropes.length; i++) {
      const s = this.ropes[i]!;
      if (this.step(s, now, dt)) moving = true;
      if (Math.abs(s.x - s.shown) > 0.0015) {
        s.shown = s.x;
        this.ropeEls[i]?.setAttribute("d", ropePath(LINES[i]!, s.x));
        if (s.x === s.to) this.writeHit(i);
      }
    }
    for (let j = 0; j < this.sails.length; j++) {
      const s = this.sails[j]!;
      if (this.step(s, now, dt)) moving = true;
      if (Math.abs(s.x - s.shown) > 0.002) {
        s.shown = s.x;
        this.writeSail(j);
      }
    }
    this.raf = moving ? requestAnimationFrame(this.frame) : 0;
  };

  private writeSail(j: number): void {
    const id = SAIL_IDS[j]!;
    const els = this.sailEls[id];
    const { cut, seams } = sailPath(id, this.sails[j]!.x);
    els.cut?.setAttribute("d", cut);
    els.seams?.setAttribute("d", seams);
  }

  /** Advances one spring; true while it is still moving or waiting. */
  private step(s: Spring, now: number, dt: number): boolean {
    if (s.x === s.to && s.v === 0) return false;
    if (now < s.start) return true;
    // Semi-implicit Euler in small steps: stable at these stiffnesses.
    const n = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / n;
    for (let k = 0; k < n; k++) {
      s.v += (-s.k * (s.x - s.to) - s.c * s.v) * h;
      s.x += s.v * h;
    }
    if (Math.abs(s.x - s.to) < 0.0015 && Math.abs(s.v) < 0.02) {
      s.x = s.to;
      s.v = 0;
      return false;
    }
    return true;
  }

  private writeHit(i: number): void {
    this.hitEls[i]?.setAttribute("d", ropePath(LINES[i]!, this.ropes[i]!.x));
  }

  /** Everything where it is going, written at once. */
  private settleAll(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ropes.forEach((s, i) => {
      s.x = s.to;
      s.v = 0;
      if (s.shown !== s.x) {
        s.shown = s.x;
        this.ropeEls[i]?.setAttribute("d", ropePath(LINES[i]!, s.x));
      }
      this.writeHit(i);
    });
    this.sails.forEach((s, j) => {
      s.x = s.to;
      s.v = 0;
      if (s.shown !== s.x) {
        s.shown = s.x;
        this.writeSail(j);
      }
    });
  }

  private readonly onVisibility = (): void => {
    if (document.hidden) this.settleAll();
  };

  private readonly onMotionPref = (event: MediaQueryListEvent): void => {
    this.reduced = event.matches;
    if (this.reduced) this.settleAll();
  };
}
