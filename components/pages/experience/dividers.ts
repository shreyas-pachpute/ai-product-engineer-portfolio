/**
 * The navigator's dividers: two brass arms on a hinge, a steel point at
 * the end of each.
 *
 * Each point lives on the track, as a position `t` measured in ports (0 is
 * the departure, 1 the next port, 1.5 halfway along the second leg). A
 * point being dragged follows the finger along the track and is drawn
 * towards a port as it nears one; let go, it springs onto the nearest. The
 * hinge is not animated at all: it is wherever two arms of fixed length
 * have to meet, so it opens and closes by itself as the points move.
 *
 * Drawn as if standing on the chart and seen from above: the hinge rises
 * off the paper, so it is drawn displaced to one side of the track, and
 * each part casts a shadow. Everything here is written to the DOM as
 * transforms (compositor only); React hears about it only when a point
 * settles on a different port. The animation frame loop runs only while
 * something is moving, and never in a hidden tab.
 */

type Vec = { x: number; y: number };

export type DividerParts = {
  root: HTMLElement;
  arms: readonly [HTMLElement, HTMLElement];
  shades: readonly [HTMLElement, HTMLElement];
  head: HTMLElement;
  headShade: HTMLElement;
  points: readonly [HTMLElement, HTMLElement];
  plate: HTMLElement;
};

export type DividerOptions = {
  /** The port markers, in order; their centres are the ports. */
  ports: () => readonly HTMLElement[];
  /** 1: the hinge rises to the left of the direction of travel; -1: right. */
  hand: () => 1 | -1;
  /** While moving: the ports the points would settle on, if let go now. */
  onPreview: (a: number, b: number) => void;
  /** The points have been given new ports to settle on. */
  onCommit: (a: number, b: number, how: "drag" | "key" | "go") => void;
  /** A point was tapped rather than dragged. */
  onTap: (port: number) => void;
  /** A point has come to rest on a port. */
  onSettle: (port: number) => void;
};

/** Each point's spring: how stiff, and how much it is damped (1 = no overshoot). */
const SPRING = {
  drag: { k: 1100, zeta: 1 },
  drop: { k: 210, zeta: 0.62 },
  go: { k: 120, zeta: 0.84 },
} as const;
/** How near a port (px along the track) before it starts to pull the point in. */
const MAGNET = 26;
/** The light comes from the upper left; shadows fall this way. */
const SUN: Vec = { x: 0.6, y: 0.8 };

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function unit(v: Vec): Vec {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

export class Dividers {
  private parts: DividerParts;
  private opts: DividerOptions;
  private reduced: boolean;

  private ports: Vec[] = [];
  private legLen: number[] = [];
  private width = 0;
  private height = 0;
  /** Arm length, px: the longest span the dividers can open to, and a bit. */
  private arm = 200;
  /** How much of the hinge's height shows as a sideways shift on screen. */
  private rise = 0.6;

  private t: [number, number];
  private v: [number, number] = [0, 0];
  private goal: [number, number];
  private spring: [keyof typeof SPRING, keyof typeof SPRING] = ["go", "go"];
  private moving: [boolean, boolean] = [false, false];
  private dragging = -1;
  private grab = { x: 0, y: 0, time: 0, moved: 0, touch: false };
  private preview: [number, number] = [-1, -1];

  private raf = 0;
  private last = 0;
  private ready = false;
  private detach: (() => void)[] = [];

  constructor(
    parts: DividerParts,
    opts: DividerOptions,
    start: readonly [number, number],
    open: readonly [number, number],
    reduced: boolean,
  ) {
    this.parts = parts;
    this.opts = opts;
    this.reduced = reduced;
    this.t = reduced ? [open[0], open[1]] : [start[0], start[1]];
    this.goal = [open[0], open[1]];
    this.preview = [open[0], open[1]];

    parts.points.forEach((point, i) => {
      const index = i as 0 | 1;
      const down = (event: PointerEvent) => this.down(index, event);
      const move = (event: PointerEvent) => this.move(index, event);
      const up = (event: PointerEvent) => this.up(index, event, false);
      const cancel = (event: PointerEvent) => this.up(index, event, true);
      const key = (event: KeyboardEvent) => this.key(index, event);
      point.addEventListener("pointerdown", down);
      point.addEventListener("pointermove", move);
      point.addEventListener("pointerup", up);
      point.addEventListener("pointercancel", cancel);
      point.addEventListener("lostpointercapture", cancel);
      point.addEventListener("keydown", key);
      this.detach.push(() => {
        point.removeEventListener("pointerdown", down);
        point.removeEventListener("pointermove", move);
        point.removeEventListener("pointerup", up);
        point.removeEventListener("pointercancel", cancel);
        point.removeEventListener("lostpointercapture", cancel);
        point.removeEventListener("keydown", key);
      });
    });

    const visibility = () => {
      if (document.hidden) this.halt();
      else this.wake();
    };
    document.addEventListener("visibilitychange", visibility);
    this.detach.push(() =>
      document.removeEventListener("visibilitychange", visibility),
    );
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    for (const off of this.detach) off();
    this.detach = [];
  }

  setReduced(reduced: boolean): void {
    this.reduced = reduced;
  }

  /** Read where the ports are now. Call after any change of size or layout. */
  measure(): void {
    const els = this.opts.ports();
    const root = this.parts.root;
    this.width = root.offsetWidth;
    this.height = root.offsetHeight;
    this.ports = els.map((el) => ({
      x: el.offsetLeft + el.offsetWidth / 2,
      y: el.offsetTop + el.offsetHeight / 2,
    }));
    const n = this.ports.length - 1;
    this.legLen = [];
    for (let i = 0; i < n; i++) {
      const a = this.ports[i]!;
      const b = this.ports[i + 1]!;
      this.legLen.push(Math.hypot(b.x - a.x, b.y - a.y) || 1);
    }
    let longest = 0;
    for (const a of this.ports)
      for (const b of this.ports)
        longest = Math.max(longest, Math.hypot(b.x - a.x, b.y - a.y));
    this.arm = Math.max(60, longest / 1.86);
    // Closed, the dividers stand about this tall on screen, whatever the size.
    this.rise = Math.min(0.62, 150 / this.arm);
    for (const el of [...this.parts.arms, ...this.parts.shades])
      el.style.width = `${this.arm.toFixed(1)}px`;
    this.render();
    if (!this.ready && this.ports.length > 1) {
      this.ready = true;
      this.parts.root.dataset.ready = "";
      this.wake();
    }
  }

  /** Walk both points to a new pair of ports (the nearer point takes the nearer port). */
  go(lo: number, hi: number): void {
    const [a, b] = this.t[0] <= this.t[1] ? [lo, hi] : [hi, lo];
    this.goal = [a, b];
    this.spring = ["go", "go"];
    this.opts.onCommit(a, b, "go");
    this.wake();
  }

  /* Input ---------------------------------------------------------------- */

  private local(event: PointerEvent): Vec {
    const rect = this.parts.root.getBoundingClientRect();
    const scale = rect.width / (this.parts.root.offsetWidth || rect.width);
    return {
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale,
    };
  }

  private down(index: 0 | 1, event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (this.ports.length < 2) return;
    event.preventDefault();
    const point = this.parts.points[index];
    point.focus({ preventScroll: true });
    try {
      point.setPointerCapture(event.pointerId);
    } catch {
      /* the pointer has already gone */
    }
    this.dragging = index;
    this.spring[index] = "drag";
    this.grab = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      moved: 0,
      touch: event.pointerType === "touch",
    };
    this.parts.root.dataset.drag = String(index);
    this.parts.root.dataset.touched = "";
    this.wake();
  }

  private move(index: 0 | 1, event: PointerEvent): void {
    if (this.dragging !== index) return;
    this.grab.moved = Math.max(
      this.grab.moved,
      Math.hypot(event.clientX - this.grab.x, event.clientY - this.grab.y),
    );
    this.goal[index] = this.magnet(this.project(this.local(event)));
    this.wake();
  }

  private up(index: 0 | 1, event: PointerEvent, cancelled: boolean): void {
    if (this.dragging !== index) return;
    this.dragging = -1;
    delete this.parts.root.dataset.drag;
    const point = this.parts.points[index];
    if (point.hasPointerCapture?.(event.pointerId))
      point.releasePointerCapture(event.pointerId);
    const tapped =
      !cancelled &&
      this.grab.moved < 6 &&
      performance.now() - this.grab.time < 400;
    const port = Math.round(this.goal[index]);
    this.goal[index] = port;
    this.spring[index] = "drop";
    this.opts.onCommit(this.goal[0], this.goal[1], "drag");
    if (tapped) this.opts.onTap(port);
    this.wake();
  }

  private key(index: 0 | 1, event: KeyboardEvent): void {
    const last = this.ports.length - 1;
    if (last < 1) return;
    const now = Math.round(this.goal[index]);
    let next = now;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
        next = Math.min(last, now + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        next = Math.max(0, now - 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.parts.root.dataset.touched = "";
    if (next === now) return;
    this.goal[index] = next;
    this.spring[index] = "drop";
    this.opts.onCommit(this.goal[0], this.goal[1], "key");
    this.wake();
  }

  /** The nearest place on the track to a point on the sheet, in ports. */
  private project(p: Vec): number {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < this.legLen.length; i++) {
      const a = this.ports[i]!;
      const b = this.ports[i + 1]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const u = Math.min(
        1,
        Math.max(
          0,
          ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy),
        ),
      );
      const dist = Math.hypot(p.x - (a.x + dx * u), p.y - (a.y + dy * u));
      if (dist < bestDist) {
        bestDist = dist;
        best = i + u;
      }
    }
    return best;
  }

  /** Close to a port, the point is drawn in to it, like a needle into a prick. */
  private magnet(t: number): number {
    const n = Math.round(t);
    const leg = Math.min(this.legLen.length - 1, Math.floor(t));
    const px = Math.abs(t - n) * (this.legLen[Math.max(0, leg)] ?? 1);
    if (px >= MAGNET) return t;
    return n + (t - n) * (px / MAGNET) ** 1.7;
  }

  /* The loop --------------------------------------------------------------- */

  private wake(): void {
    if (this.raf || document.hidden || !this.ready) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Hidden tab: stop, and put everything where it was going. */
  private halt(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.dragging >= 0) {
      const index = this.dragging as 0 | 1;
      this.dragging = -1;
      delete this.parts.root.dataset.drag;
      this.goal[index] = Math.round(this.goal[index]);
      this.opts.onCommit(this.goal[0], this.goal[1], "drag");
    }
    this.t = [this.goal[0], this.goal[1]];
    this.v = [0, 0];
    this.render();
  }

  private tick = (time: number): void => {
    this.raf = 0;
    const dt = Math.min(1 / 30, Math.max(0, (time - this.last) / 1000));
    this.last = time;
    let busy = this.dragging >= 0;
    for (const i of [0, 1] as const) {
      const goal = this.goal[i];
      if (this.reduced && this.dragging !== i) {
        this.t[i] = goal;
        this.v[i] = 0;
      } else {
        const { k, zeta } = SPRING[this.spring[i]];
        const c = 2 * Math.sqrt(k) * zeta;
        // Two half steps: stable for the stiff drag spring at 30 fps too.
        for (let s = 0; s < 2; s++) {
          const h = dt / 2;
          this.v[i] += (k * (goal - this.t[i]) - c * this.v[i]) * h;
          this.t[i] += this.v[i] * h;
        }
        if (Math.abs(goal - this.t[i]) < 6e-4 && Math.abs(this.v[i]) < 4e-3) {
          this.t[i] = goal;
          this.v[i] = 0;
        }
      }
      const still = this.t[i] === goal && this.dragging !== i;
      if (!still) busy = true;
      if (still && this.moving[i] && Number.isInteger(goal))
        this.opts.onSettle(goal);
      this.moving[i] = !still;
    }
    this.render();
    if (busy) this.raf = requestAnimationFrame(this.tick);
  };

  /* Drawing ---------------------------------------------------------------- */

  private at(t: number): Vec {
    const n = this.legLen.length;
    const leg = Math.min(n - 1, Math.max(0, Math.floor(t)));
    const f = Math.min(1, Math.max(0, t - leg));
    const a = this.ports[leg]!;
    const b = this.ports[leg + 1]!;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  private render(): void {
    if (this.ports.length < 2) return;
    const hand = this.opts.hand();
    const [ta, tb] = this.t;
    const A = this.at(ta);
    const B = this.at(tb);
    const lo = ta <= tb ? A : B;
    const hi = ta <= tb ? B : A;
    const dx = hi.x - lo.x;
    const dy = hi.y - lo.y;
    const d = Math.hypot(dx, dy);
    const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };

    // Which way the hinge leans: square to the span when the dividers are
    // open (always the same side of it); closed, they stand up and lean in
    // toward the middle of the chart, where there is room.
    const inward = Math.max(
      -1,
      Math.min(1, (this.width / 2 - mid.x) / (this.width * 0.25)),
    );
    const high = smooth(this.height * 0.36, this.height * 0.26, mid.y);
    const closed = unit({ x: inward * 0.6, y: -0.85 + 1.7 * high });
    const span = d > 0.001 ? { x: dy / d, y: -dx / d } : closed;
    const open = { x: span.x * hand, y: span.y * hand };
    const w = smooth(0, 70, d);
    const dir = unit({
      x: closed.x * (1 - w) + open.x * w,
      y: closed.y * (1 - w) + open.y * w - 0.18,
    });

    const half = Math.min(d / 2, this.arm * 0.995);
    const z = Math.sqrt(this.arm * this.arm - half * half);
    let lift = z * this.rise;
    // Keep the hinge, grip and all, on the sheet.
    const m = 32;
    const room = (pos: number, step: number, size: number) =>
      step > 1e-4
        ? (size - m - pos) / step
        : step < -1e-4
          ? (m - pos) / step
          : Infinity;
    lift = Math.max(
      0,
      Math.min(
        lift,
        room(mid.x, dir.x, this.width),
        room(mid.y, dir.y, this.height),
      ),
    );
    const H = { x: mid.x + dir.x * lift, y: mid.y + dir.y * lift };
    const S = {
      x: mid.x + SUN.x * z * 0.3,
      y: mid.y + SUN.y * z * 0.3,
    };

    const drag = this.dragging;
    const tips = [A, B];
    for (const i of [0, 1] as const) {
      const P = tips[i]!;
      const len = Math.hypot(P.x - H.x, P.y - H.y);
      const ang = Math.atan2(P.y - H.y, P.x - H.x);
      this.parts.arms[i].style.transform =
        `translate3d(${H.x.toFixed(1)}px,${H.y.toFixed(1)}px,0) rotate(${ang.toFixed(4)}rad) scaleX(${(len / this.arm).toFixed(4)})`;
      // A point being held is lifted off the paper: its shadow falls away.
      const lifted = drag === i ? 9 : 0;
      const Q = { x: P.x + SUN.x * lifted, y: P.y + SUN.y * lifted };
      const slen = Math.hypot(Q.x - S.x, Q.y - S.y);
      const sang = Math.atan2(Q.y - S.y, Q.x - S.x);
      this.parts.shades[i].style.transform =
        `translate3d(${S.x.toFixed(1)}px,${S.y.toFixed(1)}px,0) rotate(${sang.toFixed(4)}rad) scaleX(${(slen / this.arm).toFixed(4)})`;
      this.parts.points[i].style.transform =
        `translate3d(${P.x.toFixed(1)}px,${P.y.toFixed(1)}px,0)`;
    }
    const turn = Math.atan2(dir.y, dir.x) + Math.PI / 2;
    this.parts.head.style.transform = `translate3d(${H.x.toFixed(1)}px,${H.y.toFixed(1)}px,0) rotate(${turn.toFixed(4)}rad)`;
    this.parts.headShade.style.transform = `translate3d(${S.x.toFixed(1)}px,${S.y.toFixed(1)}px,0)`;
    // The reading rides above the hinge, kept on the sheet.
    const px = Math.min(this.width - 64, Math.max(64, H.x + dir.x * 40));
    const py = Math.min(this.height - 22, Math.max(22, H.y + dir.y * 40));
    this.parts.plate.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;

    // Where the points would settle if let go now.
    const pa = Math.round(this.goal[0]);
    const pb = Math.round(this.goal[1]);
    if (pa !== this.preview[0] || pb !== this.preview[1]) {
      this.preview = [pa, pb];
      this.opts.onPreview(pa, pb);
      // A fingertip feels the point drop into a port.
      if (drag >= 0 && this.grab.touch) navigator.vibrate?.(7);
    }
  }
}
