/**
 * The unfolding, as plain DOM code (React only renders the pieces).
 *
 * STATE
 * One number per fold, 0 (folded back, out of sight) to 1 (flat). Every
 * transform and opacity on the page is a function of those three numbers,
 * computed in `collect`. Nothing here is React state: the component hears
 * only when the number of open folds changes.
 *
 * MOTION
 *   - Dragging writes inline styles, at most once a frame (requestAnimation-
 *     Frame, requested by pointer moves only; there is no standing loop).
 *   - Everything else (the snap on release, the buttons, the keyboard, the
 *     idle hint) is a Web Animation: a spring is simulated once, sampled
 *     into keyframes of transform and opacity, and handed to the browser,
 *     so it runs on the compositor however busy the 3D world keeps the main
 *     thread. A spring released from a drag starts with the drag's speed.
 *   - Any input interrupts a running animation where it is, so the paper
 *     can be caught mid-fold.
 *   - Under prefers-reduced-motion every step is an instant cut; a drag
 *     still follows the hand, and the release cuts to where it lands.
 */

import { FOLD_COUNT, H, PIECES, RIM, TIP, VIEW, type Piece } from "./geometry";

type Styled = Element & ElementCSSInlineStyle;

export type PieceEls = {
  piece: HTMLElement;
  face: HTMLElement;
  frost: HTMLElement;
  shade: HTMLElement;
  light: HTMLElement;
};

export type Parts = {
  stage: HTMLElement;
  float: HTMLElement;
  sheet: HTMLElement;
  shadows: HTMLElement;
  boatShadow: HTMLElement;
  sheetShadow: HTMLElement;
  pieces: ReadonlyMap<string, PieceEls>;
  creases: readonly Styled[];
};

export type Engine = {
  /** One fold further; from flat, all the way back to the boat. */
  next: () => void;
  back: () => void;
  /** One fold either way, stopping at the ends. */
  step: (d: number) => void;
  to: (level: number) => void;
  destroy: () => void;
};

type Kf = { transform?: string; opacity?: number };
type Sink = (el: Styled, kf: Kf) => void;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const r4 = (n: number) => Math.round(n * 1e4) / 1e4;

/* Light from the upper left, in front: the same side as the world's sun. */
const LIGHT = (() => {
  const v = [-0.35, -0.6, 1];
  const l = Math.hypot(...v);
  return v.map((c) => c / l) as [number, number, number];
})();
const FLAT = LIGHT[2];

/** A damped spring from `from` to `to`, sampled; starts at velocity v0 (per s). */
function spring(
  from: number,
  to: number,
  v0: number,
  zeta: number,
  period: number,
  cap = Infinity,
) {
  const dist = to - from;
  if (Math.abs(dist) < 1e-4) return { curve: () => to, duration: 0 };
  const w = (2 * Math.PI) / period;
  const rate = 120;
  const dt = 1 / 960;
  let x = 0;
  let v = v0 / dist;
  let t = 0;
  let mark = 1 / rate;
  const samples = [0];
  while (t < 1.5) {
    v += (-w * w * (x - 1) - 2 * zeta * w * v) * dt;
    x += v * dt;
    t += dt;
    if (t >= mark) {
      mark += 1 / rate;
      samples.push(Math.min(x, cap));
      if (t > 0.1 && Math.abs(x - 1) < 0.0015 && Math.abs(v) < 0.04) break;
    }
  }
  samples[samples.length - 1] = 1;
  const last = samples.length - 1;
  return {
    duration: (last / rate) * 1000,
    curve: (u: number) => {
      const i = clamp(u) * last;
      const k = Math.floor(i);
      const a = samples[k] ?? 1;
      const b = samples[k + 1] ?? 1;
      return from + dist * (a + (b - a) * (i - k));
    },
  };
}

export function createEngine(
  parts: Parts,
  onLevel: (level: number) => void,
): Engine {
  const prog = [0, 0, 0];
  const byFold = Array.from({ length: FOLD_COUNT }, (_, f) =>
    PIECES.filter((p) => p.fold === f),
  );
  /* How much larger the folded boat is shown: set in CSS per layout. */
  const readZoom = () =>
    parseFloat(getComputedStyle(parts.stage).getPropertyValue("--edu-zoom")) ||
    VIEW.zoom;
  let zoom = readZoom();
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motion.matches;
  /** Once the visitor has done anything, the idle hint stays away. */
  let touched = false;

  /* ---- what the page looks like for a given state ---------------------- */

  function piece(p: Piece, v: number, sink: Sink) {
    const els = parts.pieces.get(p.id);
    if (!els) return;
    const th = p.folded * (1 - v);
    const rad = (th * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    // The face's normal after turning about the crease (u × z = (uy, -ux, 0)).
    const lit = p.uy * sin * LIGHT[0] - p.ux * sin * LIGHT[1] + cos * LIGHT[2];
    const front = cos >= 0;
    const b = front ? lit : -lit;
    const settle = smooth(0.82, 1, v);
    const shade = front
      ? Math.max(clamp((FLAT - b) * 0.5, 0, 0.3), p.rest * settle)
      : clamp(0.06 + (FLAT - b) * 0.42, 0.04, 0.3);
    // Fully folded, a flap is invisible; it is also shrunk to its crease,
    // so its mirrored outline cannot make the page wider or longer.
    sink(els.piece, {
      transform: `rotate3d(${p.ux}, ${p.uy}, 0, ${r4(th)}deg) scale(${r4(clamp(v / 0.015))})`,
    });
    sink(els.face, { opacity: r4(smooth(0.02, 0.15, v)) });
    sink(els.frost, { opacity: front ? 0 : 0.8 });
    sink(els.shade, { opacity: r4(shade) });
    sink(els.light, {
      opacity: r4(front ? clamp((b - FLAT) * 1.5, 0, 0.28) : 0),
    });
  }

  function world(pr: readonly number[], sink: Sink) {
    const a = smooth(0, 0.75, pr[0] ?? 0);
    const c = smooth(0, 1, pr[2] ?? 0);
    const s = lerp(zoom, 1, a);
    const cy = lerp(lerp(VIEW.boat, VIEW.lower, a), VIEW.full, c);
    const ty = (-(cy - H / 2) * s * 100) / H;
    const t = `translate3d(0, ${r4(ty)}%, 0) scale(${r4(s)})`;
    sink(parts.sheet, { transform: t });
    sink(parts.shadows, { transform: t });
    sink(parts.boatShadow, { opacity: r4(1 - smooth(0, 0.45, pr[0] ?? 0)) });
    // The sheet's shadow only grows over paper that has landed.
    const top = lerp(
      lerp(RIM, TIP, smooth(0.6, 1, pr[1] ?? 0)),
      0,
      smooth(0.6, 1, pr[2] ?? 0),
    );
    sink(parts.sheetShadow, {
      opacity: r4(smooth(0.65, 1, pr[0] ?? 0)),
      transform: `scaleY(${r4((H - top) / H)})`,
    });
    // The boat's own light and shade (it is a folded thing, not a flat
    // one) goes as its pieces become part of a flat sheet.
    const hull = parts.pieces.get("hull");
    const sail = parts.pieces.get("sail");
    const folded = [
      1 - smooth(0, 0.6, pr[0] ?? 0),
      1 - smooth(0, 0.6, pr[1] ?? 0),
    ];
    if (hull) {
      sink(hull.shade, { opacity: r4(folded[0] ?? 0) });
      sink(hull.light, { opacity: r4(folded[0] ?? 0) });
    }
    if (sail) {
      sink(sail.shade, { opacity: r4(folded[1] ?? 0) });
      sink(sail.light, { opacity: r4(folded[1] ?? 0) });
    }
  }

  function collect(f: number, v: number, sink: Sink) {
    const pr = prog.slice();
    pr[f] = v;
    for (const p of byFold[f] ?? []) piece(p, v, sink);
    const crease = parts.creases[f];
    if (crease) sink(crease, { opacity: r4(smooth(0.9, 1, v)) });
    world(pr, sink);
  }

  const write: Sink = (el, kf) => {
    if (kf.transform !== undefined) el.style.transform = kf.transform;
    if (kf.opacity !== undefined) el.style.opacity = String(kf.opacity);
  };

  function apply(f: number, v: number) {
    prog[f] = v;
    collect(f, v, write);
  }

  /* ---- animation -------------------------------------------------------- */

  type Group = {
    fold: number;
    curve: (u: number) => number;
    duration: number;
    anims: Animation[];
    done: () => void;
  };
  const groups = new Set<Group>();

  function play(f: number, curve: (u: number) => number, duration: number) {
    if (reduced || duration <= 0) {
      apply(f, curve(1));
      return Promise.resolve();
    }
    const frames = new Map<Styled, Keyframe[]>();
    const n = Math.max(2, Math.round((duration / 1000) * 60));
    for (let k = 0; k <= n; k++) {
      collect(f, curve(k / n), (el, kf) => {
        const list = frames.get(el);
        if (list) list.push({ ...kf });
        else frames.set(el, [{ ...kf }]);
      });
    }
    const anims = [...frames].map(([el, kfs]) =>
      el.animate(kfs, { duration, easing: "linear", fill: "forwards" }),
    );
    return new Promise<void>((resolve) => {
      const group: Group = { fold: f, curve, duration, anims, done: resolve };
      groups.add(group);
      anims[0]?.finished.then(
        () => {
          if (!groups.delete(group)) return;
          apply(f, curve(1));
          for (const a of anims) a.cancel();
          resolve();
        },
        () => undefined,
      );
    });
  }

  /** Stop everything where it is, and hold it there with inline styles. */
  function halt() {
    for (const g of groups) {
      const t = Number(g.anims[0]?.currentTime ?? g.duration);
      apply(g.fold, g.curve(t / g.duration));
      for (const a of g.anims) a.cancel();
      g.done();
    }
    groups.clear();
  }

  const levelNow = () => prog.filter((p) => p > 0.5).length;
  let reported = 0;
  function report() {
    const l = levelNow();
    if (l !== reported) {
      reported = l;
      onLevel(l);
    }
  }

  /* The folded boat rocks gently while it waits. */
  let bob: Animation | null = null;
  let bobTimer = 0;
  function startBob(delay = 0) {
    window.clearTimeout(bobTimer);
    bobTimer = window.setTimeout(() => {
      if (reduced || bob || document.hidden || levelNow() !== 0 || dragging())
        return;
      const ease = "cubic-bezier(0.45, 0, 0.55, 1)";
      bob = parts.float.animate(
        [
          { transform: "translate3d(0, 0, 0) rotate(0deg)", easing: ease },
          {
            transform: "translate3d(0, -0.8%, 0) rotate(-0.9deg)",
            easing: ease,
            offset: 0.5,
          },
          { transform: "translate3d(0, 0, 0) rotate(0deg)" },
        ],
        { duration: 4400, iterations: Infinity },
      );
    }, delay);
  }
  function stopBob() {
    window.clearTimeout(bobTimer);
    if (!bob) return;
    const now = getComputedStyle(parts.float).transform;
    bob.cancel();
    bob = null;
    if (now && now !== "none" && !reduced) {
      parts.float.animate([{ transform: now }, { transform: "none" }], {
        duration: 240,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
  }

  /* Go to a level, one fold at a time. A newer request cancels this one. */
  let seq = 0;
  let goal: number | null = null;
  async function run(target: number) {
    const token = ++seq;
    goal = target;
    halt();
    stopBob();
    touched = true;
    while (token === seq) {
      let f = -1;
      let to = 0;
      for (let i = 0; i < FOLD_COUNT; i++) {
        if (i < target && (prog[i] ?? 0) < 0.999) {
          f = i;
          to = 1;
          break;
        }
      }
      if (f < 0) {
        for (let i = FOLD_COUNT - 1; i >= 0; i--) {
          if (i >= target && (prog[i] ?? 0) > 0.001) {
            f = i;
            to = 0;
            break;
          }
        }
      }
      if (f < 0) break;
      const many = Math.abs(target - levelNow()) > 1;
      const { curve, duration } =
        to === 1
          ? spring(
              prog[f] ?? 0,
              1,
              0,
              many ? 0.8 : 0.62,
              many ? 0.36 : 0.44,
              1.04,
            )
          : spring(prog[f] ?? 0, 0, 0, 0.92, many ? 0.3 : 0.36);
      await play(f, curve, duration);
      if (token === seq) report();
    }
    if (token === seq) {
      goal = null;
      report();
      if (levelNow() === 0) startBob(900);
    }
  }

  const base = () => goal ?? levelNow();
  const next = () => void run(base() >= FOLD_COUNT ? 0 : base() + 1);
  const back = () => void run(Math.max(0, base() - 1));
  const to = (level: number) => void run(clamp(level, 0, FOLD_COUNT));
  const step = (d: number) => to(base() + d);

  /* ---- dragging --------------------------------------------------------- */

  type Drag = {
    id: number;
    x0: number;
    y0: number;
    t0: number;
    type: string;
    mode: "pending" | "drag" | "idle";
    fold: number;
    open: boolean;
    axis: "x" | "y" | "abs";
    span: number;
    p0: number;
    p: number;
    trail: { t: number; p: number }[];
  };
  let drag: Drag | null = null;
  let frame = 0;
  const dragging = () => drag !== null && drag.mode === "drag";

  function choose(dx: number, dy: number) {
    let nextFold = -1;
    for (let i = 0; i < FOLD_COUNT; i++) {
      if ((prog[i] ?? 0) < 0.999) {
        nextFold = i;
        break;
      }
    }
    let last = -1;
    for (let i = FOLD_COUNT - 1; i >= 0; i--) {
      if ((prog[i] ?? 0) > 0.001) {
        last = i;
        break;
      }
    }
    // Each fold opens the way its flaps swing out: the foot down (and the
    // lower corners out), the sail's flanks sideways, the top half up.
    if (Math.abs(dx) > Math.abs(dy)) {
      if (nextFold === 1) return { fold: 1, open: true, axis: "abs" as const };
      if (last === 1) return { fold: 1, open: false, axis: "abs" as const };
      if (nextFold === 0) return { fold: 0, open: true, axis: "abs" as const };
      return null;
    }
    if (dy > 0) {
      if (nextFold === 0) return { fold: 0, open: true, axis: "y" as const };
      if (last === 2) return { fold: 2, open: false, axis: "y" as const };
      return null;
    }
    if (nextFold === 2) return { fold: 2, open: true, axis: "y" as const };
    if (last === 0) return { fold: 0, open: false, axis: "y" as const };
    return null;
  }

  function onDown(e: PointerEvent) {
    if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      t0: performance.now(),
      type: e.pointerType,
      mode: "pending",
      fold: 0,
      open: true,
      axis: "y",
      span: 1,
      p0: 0,
      p: 0,
      trail: [],
    };
    try {
      parts.stage.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety */
    }
  }

  function onMove(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id || drag.mode === "idle") return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (drag.mode === "pending") {
      if (Math.hypot(dx, dy) < 7) return;
      const pick = choose(dx, dy);
      if (!pick) {
        drag.mode = "idle";
        return;
      }
      seq++;
      goal = null;
      halt();
      stopBob();
      touched = true;
      const box = parts.stage.getBoundingClientRect();
      drag.mode = "drag";
      drag.fold = pick.fold;
      drag.open = pick.open;
      drag.axis = pick.axis;
      drag.span =
        pick.axis === "abs"
          ? box.width * (pick.fold === 1 ? 0.28 : 0.32)
          : box.height * (pick.fold === 2 ? 0.5 : 0.36);
      drag.p0 = prog[pick.fold] ?? 0;
      // Measure from here, so the paper does not jump by the threshold.
      drag.x0 = e.clientX;
      drag.y0 = e.clientY;
      parts.stage.dataset.drag = "";
      return;
    }
    let gain: number;
    if (drag.axis === "abs") gain = Math.abs(dx);
    else if (drag.fold === 0) gain = drag.open ? dy : -dy;
    else gain = drag.open ? -dy : dy;
    let p = drag.p0 + ((drag.open ? 1 : -1) * gain) / drag.span;
    // Past flat it resists, like paper pulled taut.
    if (p > 1) p = 1 + Math.min(0.05, (p - 1) * 0.18);
    p = Math.max(0, p);
    drag.p = p;
    const now = performance.now();
    drag.trail.push({ t: now, p });
    while (drag.trail.length > 2 && now - (drag.trail[0]?.t ?? now) > 110)
      drag.trail.shift();
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (drag && drag.mode === "drag") apply(drag.fold, drag.p);
      });
    }
  }

  function onUp(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    delete parts.stage.dataset.drag;
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (d.mode === "pending") {
      // A tap: the next fold.
      if (e.type === "pointerup" && performance.now() - d.t0 < 600) {
        if (levelNow() < FOLD_COUNT || goal !== null) next();
      }
      return;
    }
    if (d.mode !== "drag") return;
    apply(d.fold, d.p);
    const first = d.trail[0];
    const lastS = d.trail[d.trail.length - 1];
    let v = 0;
    if (first && lastS && lastS.t - first.t > 16)
      v = ((lastS.p - first.p) / (lastS.t - first.t)) * 1000;
    v = clamp(v, -8, 8);
    const target = d.p + v * 0.16 >= 0.5 ? 1 : 0;
    const { curve, duration } =
      target === 1
        ? spring(d.p, 1, v, 0.58, 0.42, 1.045)
        : spring(d.p, 0, v, 0.9, 0.36);
    const token = ++seq;
    void play(d.fold, curve, duration).then(() => {
      if (token !== seq) return;
      report();
      if (levelNow() === 0) startBob(900);
    });
    if (target === 1 && d.type === "touch") navigator.vibrate?.(8);
  }

  /* ---- the hint, start-up and teardown ---------------------------------- */

  // Once, a little after the page settles, the corners lift and fall back:
  // there is something folded behind the boat.
  const hints: number[] = [];
  function hint(after: number) {
    hints.push(
      window.setTimeout(() => {
        if (reduced || touched || groups.size || drag || levelNow() !== 0)
          return;
        void play(0, (u) => 0.2 * Math.sin(Math.PI * u) ** 2, 1300);
      }, after),
    );
  }

  const onMotion = () => {
    reduced = motion.matches;
    if (reduced) stopBob();
    else startBob();
  };
  const onVisibility = () => {
    if (document.hidden) stopBob();
    else startBob(400);
  };
  // A change of layout can change the zoom on the folded boat.
  const onResize = () => {
    const z = readZoom();
    if (z === zoom) return;
    zoom = z;
    if (!groups.size && !dragging()) apply(0, prog[0] ?? 0);
  };

  const stage = parts.stage;
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);
  motion.addEventListener("change", onMotion);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", onResize);

  for (let f = 0; f < FOLD_COUNT; f++) apply(f, 0);
  startBob(600);
  hint(1600);
  hint(9000);

  return {
    next,
    back,
    step,
    to,
    destroy() {
      seq++;
      halt();
      stopBob();
      for (const h of hints) window.clearTimeout(h);
      if (frame) cancelAnimationFrame(frame);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    },
  };
}
