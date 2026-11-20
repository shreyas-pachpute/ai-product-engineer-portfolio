"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ORDERS, SKILLS } from "@/lib/content";
import { Rigging } from "./motion";
import {
  BOWSPRIT,
  H,
  HULL,
  HULL_LINES,
  LINES,
  MASTS,
  ORDER_LINES,
  SAILS,
  SAIL_IDS,
  SAIL_ORDERS,
  STANDING,
  USED,
  W,
  WATERLINE_Y,
  mastPath,
  orderNo,
  ordersAttr,
  ropePath,
  sailPath,
  yardPaths,
  type Line,
  type MastId,
  type SailId,
} from "./plan";

/**
 * The sail plan: the order board, the drawing, and what the chosen order
 * takes.
 *
 * Which order is chosen lives in the radio buttons themselves, and the
 * stylesheet reads it with :has(), so the inking, the sails and every
 * per-order panel follow the choice even with no JavaScript at all. What
 * this component adds is motion (lines hauled taut and let go, sails
 * filling: see motion.ts), the tag that hangs off a line when it is
 * pointed at, focused or chosen, and keyboard travel between the lines.
 */

const ALL = -1;

const isLive = (line: Line, order: number) =>
  order === ALL ? line.orders.length > 0 : line.orders.includes(order);

/** Lines down each column, top to bottom. */
const COLUMN = {
  l: LINES.filter((line) => line.side === "l").sort((a, b) => a.slot - b.slot),
  r: LINES.filter((line) => line.side === "r").sort((a, b) => a.slot - b.slot),
};

const pct = (value: number, of: number) =>
  `${((value / of) * 100).toFixed(3)}%`;

const MAST_IDS = Object.keys(MASTS) as MastId[];

type Handles = {
  ropes: (SVGPathElement | null)[];
  hits: (SVGPathElement | null)[];
  sails: Record<
    SailId,
    { cut: SVGPathElement | null; seams: SVGPathElement | null }
  >;
  pennant: SVGPathElement | null;
};

function lineFrom(target: EventTarget | null): number | null {
  const el = (target as Element | null)?.closest?.("[data-n]");
  if (!el) return null;
  const n = Number(el.getAttribute("data-n"));
  return Number.isInteger(n) ? n : null;
}

function ordersInWords(orders: readonly number[]): string {
  if (orders.length === 0) return "Not used by any order on this page.";
  const nos = orders.map(orderNo);
  return `Used in order${nos.length > 1 ? "s" : ""} ${nos.join(" and ")}.`;
}

/* The order in hand is whichever radio is checked: the document is the
   store, so the page, the stylesheet and a browser that restores the form
   on going back all agree. */
function readOrder(): number {
  const checked = document.querySelector<HTMLInputElement>(
    'input[name="sp-order"]:checked',
  );
  if (!checked) return 0;
  return checked.value === "all" ? ALL : Number(checked.value);
}
function watchOrder(onChange: () => void): () => void {
  const listener = (event: Event) => {
    if ((event.target as HTMLInputElement | null)?.name === "sp-order") {
      onChange();
    }
  };
  document.addEventListener("change", listener);
  return () => document.removeEventListener("change", listener);
}

type Part = "rope" | "hit" | "cut" | "seams" | "pennant";

export function SailPlan({ children }: { children?: ReactNode }) {
  const order = useSyncExternalStore(watchOrder, readOrder, () => 0);
  const [hover, setHover] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [cursor, setCursor] = useState(COLUMN.l[0]?.n ?? 0);
  const [told, setTold] = useState("");
  const [size, setSize] = useState(0);

  const handles = useRef<Handles>({
    ropes: [],
    hits: [],
    sails: Object.fromEntries(
      SAIL_IDS.map((id) => [id, { cut: null, seams: null }]),
    ) as Handles["sails"],
    pennant: null,
  });
  /* How the drawing hands its moving parts over, as they mount. */
  const register = useCallback(
    (part: Part, key: number | SailId, el: SVGPathElement | null) => {
      const h = handles.current;
      if (part === "rope") h.ropes[key as number] = el;
      else if (part === "hit") h.hits[key as number] = el;
      else if (part === "pennant") h.pennant = el;
      else h.sails[key as SailId][part] = el;
    },
    [],
  );
  const rig = useRef<Rigging | null>(null);
  const calloutRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const windowRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<SVGPathElement>(null);
  const firstRef = useRef(true);

  const shown = hover ?? focused ?? pinned;
  const line = shown !== null ? LINES[shown] : undefined;

  /* The rigging, once. */
  useEffect(() => {
    rig.current = new Rigging(
      handles.current.ropes,
      handles.current.hits,
      handles.current.sails,
    );
    return () => {
      rig.current?.destroy();
      rig.current = null;
    };
  }, []);

  /* Haul for the order in hand. The first time, once the sheet has been
     drawn (see "The sheet is drawn" in skills.css), so the haul is seen. */
  useEffect(() => {
    // The chosen order, where the stylesheet reads it (see skills.css).
    document
      .querySelector("main.page--skills")
      ?.setAttribute("data-order", order === ALL ? "all" : String(order));
    const first = firstRef.current;
    firstRef.current = false;
    const delay = first ? 1150 : 0;
    rig.current?.set(
      LINES.map((l) => isLive(l, order)),
      delay,
    );
    // The pennant at the main truck streams out as the new order is given.
    const pennant = handles.current.pennant;
    if (
      pennant &&
      !document.hidden &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      pennant.animate(
        [
          { transform: "none" },
          { transform: "scaleX(0.55) skewY(9deg)", offset: 0.22 },
          { transform: "scaleX(1.12) skewY(-5deg)", offset: 0.5 },
          { transform: "scaleX(0.96) skewY(2deg)", offset: 0.75 },
          { transform: "none" },
        ],
        { duration: 1100, delay: delay + 80, easing: "ease-out" },
      );
    }
  }, [order]);

  /* Mark the line in hand everywhere it appears. */
  useEffect(() => {
    if (shown === null) return;
    const nodes = document.querySelectorAll(
      `.page--skills [data-n="${shown}"]`,
    );
    nodes.forEach((node) => node.setAttribute("data-hot", ""));
    return () => nodes.forEach((node) => node.removeAttribute("data-hot"));
  }, [shown]);

  /* A press anywhere else lets go of a chosen line. */
  useEffect(() => {
    if (pinned === null) return;
    function onDown(event: globalThis.PointerEvent): void {
      const target = event.target as Element | null;
      if (target?.closest(".sp-plate, .sp-slip, .sp-tag, .sp-more")) return;
      setPinned(null);
    }
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [pinned]);

  /* The tag follows the drawing's size. */
  useEffect(() => {
    const win = windowRef.current;
    if (!win) return;
    const observer = new ResizeObserver(() => setSize((s) => s + 1));
    observer.observe(win);
    return () => observer.disconnect();
  }, []);

  /* Hang the tag beside the line's pin, on the side the rope is not. */
  useLayoutEffect(() => {
    const tag = tagRef.current;
    const win = windowRef.current;
    const plate = plateRef.current;
    const thread = threadRef.current;
    if (!tag || !win || !plate || !thread) return;
    if (shown === null) {
      thread.removeAttribute("d");
      return;
    }
    const line = LINES[shown]!;
    const docked =
      getComputedStyle(tag).getPropertyValue("--docked").trim() === "1";
    if (docked) {
      tag.style.removeProperty("transform");
      thread.removeAttribute("d");
      return;
    }
    const box = win.getBoundingClientRect();
    const sheet = plate.getBoundingClientRect();
    const px = sheet.left - box.left + (line.pin.x / W) * sheet.width;
    const py = sheet.top - box.top + (line.pin.y / H) * sheet.height;
    const tw = tag.offsetWidth;
    const th = tag.offsetHeight;
    const reach = Math.max(14, sheet.width * 0.024);
    const margin = 8;
    let x = line.side === "l" ? px + reach : px - reach - tw;
    x = Math.min(box.width - tw - margin, Math.max(margin, x));
    // Away from the rope: below it if the rope climbs from the pin.
    let below = line.anchor.y <= line.pin.y;
    const yFor = (b: boolean) => (b ? py + reach : py - reach - th);
    const fits = (y: number) => y >= margin && y + th <= box.height - margin;
    if (!fits(yFor(below)) && fits(yFor(!below))) below = !below;
    const y = Math.min(box.height - th - margin, Math.max(margin, yFor(below)));
    tag.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    // A short string from the pin to the tag's nearest corner.
    const cx = line.side === "l" ? x + 12 : x + tw - 12;
    const cy = below ? y + 6 : y + th - 6;
    const sag = 6 + Math.hypot(cx - px, cy - py) * 0.12;
    thread.setAttribute(
      "d",
      `M${px.toFixed(1)} ${py.toFixed(1)}Q${((px + cx) / 2).toFixed(1)} ${((py + cy) / 2 + sag).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`,
    );
  }, [shown, size]);

  function choose(next: number): void {
    setPinned(null);
    if (next === ALL) {
      setTold(
        `Every line. ${USED} of ${LINES.length} are used by at least one order.`,
      );
    } else {
      const lines = ORDER_LINES[next]!;
      setTold(
        `Order ${orderNo(next)} takes ${lines.length} lines: ${lines.map((l) => l.name).join(", ")}. Done at ${ORDERS[next]!.where}.`,
      );
    }
  }

  /* Pointing, focusing and choosing lines: shared by the drawing and the
     list under it. */
  function onPointerOver(event: PointerEvent): void {
    if (event.pointerType === "touch") return;
    const n = lineFrom(event.target);
    if (n !== hover) {
      setHover(n);
      if (n !== null) rig.current?.pluck(n);
    }
  }
  function onPointerLeave(event: PointerEvent): void {
    if (event.pointerType === "touch") return;
    setHover(null);
  }
  function onClick(event: MouseEvent): void {
    const n = lineFrom(event.target);
    if (n === null) {
      setPinned(null);
      return;
    }
    rig.current?.pluck(n);
    setPinned((now) => (now === n ? null : n));
  }
  function onFocus(event: FocusEvent): void {
    const n = lineFrom(event.target);
    if (n === null) return;
    if (event.target.closest(".sp-callouts")) setCursor(n);
    if ((event.target as Element).matches(":focus-visible")) {
      setFocused(n);
      rig.current?.pluck(n);
    }
  }
  function onBlur(event: FocusEvent): void {
    if (lineFrom(event.relatedTarget) === null) setFocused(null);
  }

  function onCalloutKey(event: KeyboardEvent<HTMLUListElement>): void {
    const n = lineFrom(event.target);
    if (n === null) return;
    const at = LINES[n]!;
    const same = COLUMN[at.side];
    const other = COLUMN[at.side === "l" ? "r" : "l"];
    let next: Line | undefined;
    switch (event.key) {
      case "ArrowDown":
        next = same[at.slot + 1] ?? other[0];
        break;
      case "ArrowUp":
        next = same[at.slot - 1] ?? other[other.length - 1];
        break;
      case "ArrowRight":
        next =
          at.side === "l" ? other[at.slot] : (same[at.slot + 1] ?? other[0]);
        break;
      case "ArrowLeft":
        next =
          at.side === "r"
            ? other[at.slot]
            : (same[at.slot - 1] ?? other[other.length - 1]);
        break;
      case "Home":
        next = COLUMN.l[0];
        break;
      case "End":
        next = COLUMN.r[COLUMN.r.length - 1];
        break;
      case "Escape":
        if (pinned !== null || focused !== null) {
          event.preventDefault();
          setPinned(null);
          setFocused(null);
        }
        return;
      default:
        return;
    }
    if (!next) return;
    event.preventDefault();
    setCursor(next.n);
    calloutRefs.current[next.n]?.focus();
  }

  const lineEvents = {
    onPointerOver,
    onPointerLeave,
    onClick,
    onFocus,
    onBlur,
  };

  return (
    <>
      <section className="sp-board" aria-labelledby="sp-board-title">
        <h2 id="sp-board-title" className="label sp-board__title">
          Give the ship an order
        </h2>
        <p className="sp-board__hint">
          Each order is a job I have done. The lines it takes haul taut; the
          rest go slack.
        </p>
        <fieldset className="sp-orders">
          <legend className="sr-only">Orders</legend>
          {ORDERS.map((o, i) => (
            <label className="sp-order" key={o.order}>
              <input
                type="radio"
                name="sp-order"
                id={`sp-o-${i}`}
                value={i}
                defaultChecked={i === 0}
                className="sp-order__input"
                onChange={() => choose(i)}
              />
              <span className="sp-order__no" aria-hidden="true">
                {orderNo(i)}
              </span>
              <span className="sp-order__body">
                <span className="sp-order__text">{o.order}</span>
                <span className="sp-order__meta">
                  Done at {o.where} · {o.skills.length} lines
                </span>
              </span>
            </label>
          ))}
          <label className="sp-order sp-order--all">
            <input
              type="radio"
              name="sp-order"
              id="sp-o-all"
              value="all"
              className="sp-order__input"
              onChange={() => choose(ALL)}
            />
            <span className="sp-order__no" aria-hidden="true">
              <svg viewBox="0 0 20 20">
                <path d="M3 10h14M10 3v14M5 5l10 10M15 5L5 15" />
              </svg>
            </span>
            <span className="sp-order__body">
              <span className="sp-order__text">Every line at once</span>
              <span className="sp-order__meta">
                {USED} of {LINES.length} lines are in at least one order
              </span>
            </span>
          </label>
        </fieldset>
        <p className="sr-only" role="status">
          {told}
        </p>
      </section>

      <figure className="sp-sheet" aria-labelledby="sp-sheet-name">
        <div className="sp-tape sp-tape--l" aria-hidden="true" />
        <div className="sp-tape sp-tape--r" aria-hidden="true" />
        <div className="sp-window" ref={windowRef}>
          <div className="sp-crop">
            <div className="sp-plate" ref={plateRef} {...lineEvents}>
              <Drawing register={register} />

              {MAST_IDS.map((id) => {
                const mast = MASTS[id];
                const group = SKILLS[mast.group];
                if (!group) return null;
                return (
                  <p
                    key={id}
                    className={`sp-mast sp-mast--${id}`}
                    style={
                      {
                        "--x": pct(mast.x, W),
                        "--y": pct(mast.truck - (id === "main" ? 32 : 12), H),
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  >
                    <span className="sp-mast__name">{mast.name}</span>
                    <span className="sp-mast__group">
                      {group.name} · {group.skills.length}
                    </span>
                  </p>
                );
              })}

              <ul
                className="sp-callouts"
                aria-label="Lines on the plan: one per skill"
                onKeyDown={onCalloutKey}
              >
                {LINES.map((l) => {
                  const live = isLive(l, order);
                  return (
                    <li
                      key={l.n}
                      className={`sp-callout sp-callout--${l.side}`}
                      data-n={l.n}
                      data-o={ordersAttr(l.orders)}
                      data-strong={l.strong ? "" : undefined}
                      style={
                        {
                          "--y": pct(l.pin.y, H),
                          "--i": l.slot,
                        } as CSSProperties
                      }
                    >
                      <button
                        type="button"
                        ref={(el) => {
                          calloutRefs.current[l.n] = el;
                        }}
                        className="sp-callout__button"
                        data-n={l.n}
                        tabIndex={l.n === cursor ? 0 : -1}
                        aria-describedby={`sp-d-${l.n}`}
                        aria-pressed={pinned === l.n}
                      >
                        <span className="sp-ball" aria-hidden="true">
                          {l.n + 1}
                        </span>
                        <span className="sp-callout__name">{l.name}</span>
                        <span className="sr-only">
                          {live ? ", taken by this order" : ", slack"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <svg className="sp-thread" aria-hidden="true">
            <path ref={threadRef} />
          </svg>

          <div
            className="sp-tag"
            ref={tagRef}
            hidden={!line}
            aria-hidden="true"
            data-side={line?.side}
          >
            {line ? (
              <div className="sp-tag__sheet" key={line.n}>
                <p className="sp-tag__head">
                  <span>
                    Line {line.n + 1} · {MASTS[line.mast].name}
                  </span>
                  {line.strong ? (
                    <span className="sp-tag__lead">One I lead with</span>
                  ) : null}
                </p>
                <p className="sp-tag__name">{line.name}</p>
                {line.evidence ? (
                  <p className="sp-tag__evidence">{line.evidence}</p>
                ) : null}
                {line.orders.length ? (
                  <ul className="sp-tag__orders">
                    {line.orders.map((o) => (
                      <li
                        key={o}
                        data-on={o === order || order === ALL ? "" : undefined}
                      >
                        <span className="sp-tag__no">{orderNo(o)}</span>
                        <span>{ORDERS[o]!.order}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="sp-tag__none">Not used by any order here.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <figcaption className="sp-title">
          <span className="sp-title__cell sp-title__cell--name">
            <span className="sp-title__k">Drawing</span>
            <span id="sp-sheet-name" className="sp-title__v sp-title__v--name">
              Sail plan
            </span>
          </span>
          <span className="sp-title__cell sp-title__cell--order">
            <span className="sp-title__k">Order in hand</span>
            {ORDERS.map((o, i) => (
              <span className="sp-title__v" data-for={i} key={o.order}>
                <b>No. {orderNo(i)}</b> · done at {o.where}
              </span>
            ))}
            <span className="sp-title__v" data-for="all">
              <b>Every line</b> · all {ORDERS.length} orders
            </span>
          </span>
          <span className="sp-title__cell sp-title__cell--count">
            <span className="sp-title__k">Lines taut</span>
            {ORDER_LINES.map((lines, i) => (
              <span className="sp-title__v" data-for={i} key={i}>
                <b>{lines.length}</b> of {LINES.length}
              </span>
            ))}
            <span className="sp-title__v" data-for="all">
              <b>{USED}</b> of {LINES.length}
            </span>
          </span>
          <span
            className="sp-title__cell sp-title__cell--key"
            aria-hidden="true"
          >
            <span className="sp-title__k">Key</span>
            <span className="sp-key">
              <span className="sp-key__item">
                <svg viewBox="0 0 28 8">
                  <path d="M1 4H27" className="sp-key__w sp-key__w--0" />
                </svg>
                no order
              </span>
              <span className="sp-key__item">
                <svg viewBox="0 0 28 8">
                  <path d="M1 4H27" className="sp-key__w sp-key__w--1" />
                </svg>
                one
              </span>
              <span className="sp-key__item">
                <svg viewBox="0 0 28 8">
                  <path d="M1 4H27" className="sp-key__w sp-key__w--2" />
                </svg>
                two
              </span>
              <span className="sp-key__item">
                <span className="sp-key__lead" />
                one I lead with
              </span>
            </span>
          </span>
        </figcaption>

        <div hidden>
          {LINES.map((l) => (
            <span key={l.n} id={`sp-d-${l.n}`}>
              {l.evidence ? `${l.evidence} ` : ""}
              {ordersInWords(l.orders)}
              {l.strong ? " One I lead with." : ""}
            </span>
          ))}
        </div>
      </figure>

      <section
        className="sp-slip"
        aria-label="What the order in hand takes"
        {...lineEvents}
      >
        {ORDER_LINES.map((lines, i) => (
          <div className="sp-slip__card" data-for={i} key={i}>
            <p className="sp-slip__head">
              <span className="sp-slip__no">{orderNo(i)}</span>
              <span>
                takes {lines.length} lines, done at {ORDERS[i]!.where}
              </span>
            </p>
            <ol className="sp-slip__lines">
              {lines.map((l) => (
                <li key={l.n}>
                  <button
                    type="button"
                    className="sp-slip__line"
                    data-n={l.n}
                    data-strong={l.strong ? "" : undefined}
                    aria-describedby={`sp-d-${l.n}`}
                  >
                    <span className="sp-ball" aria-hidden="true">
                      {l.n + 1}
                    </span>
                    <span>{l.name}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ))}
        <div className="sp-slip__card" data-for="all">
          <p className="sp-slip__head">
            <span className="sp-slip__no">All</span>
            <span>
              {USED} of {LINES.length} lines are used by at least one order. The
              heavier the line, the more orders use it.
            </span>
          </p>
        </div>
      </section>

      {/* The schedule (a server component) beside the drawing: pointing at
          a row points at its line. */}
      {children ? (
        <div className="sp-more" {...lineEvents}>
          {children}
        </div>
      ) : null}
    </>
  );
}

/* ---------------------------------------------------------------------------
   The drawing. Rendered once; after that only motion.ts touches it.
   ------------------------------------------------------------------------- */

const ZONES_X = 8;
const ZONES_Y = 6;
const FRAME = 22;

/** When (and how long) a part is inked in as the sheet first appears. */
const ink = (delay: number, duration = 600) =>
  ({ "--d": `${delay}ms`, "--t": `${duration}ms` }) as CSSProperties;

const Drawing = memo(function Drawing({
  register,
}: {
  register: (
    part: Part,
    key: number | SailId,
    el: SVGPathElement | null,
  ) => void;
}) {
  const zoneW = (W - FRAME * 2) / ZONES_X;
  const zoneH = (H - FRAME * 2) / ZONES_Y;
  const yards = SAIL_IDS.flatMap((id) => {
    const sail = SAILS[id];
    return sail.kind === "square" ? [sail.head] : [];
  });
  return (
    <svg
      className="sp-drawing"
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id="sp-hatch"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <path d="M0 0V7" className="sp-hatch" />
        </pattern>
        <clipPath id="sp-under">
          <rect x="0" y={WATERLINE_Y} width={W} height={H - WATERLINE_Y} />
        </clipPath>
      </defs>

      {/* The sheet's border, with zone references between its two rules. */}
      <g className="sp-frame">
        <rect
          className="sp-ink"
          pathLength={1}
          x="8"
          y="8"
          width={W - 16}
          height={H - 16}
        />
        <rect
          className="sp-frame__inner sp-ink"
          pathLength={1}
          style={ink(90)}
          x={FRAME}
          y={FRAME}
          width={W - FRAME * 2}
          height={H - FRAME * 2}
        />
        <path
          d={
            Array.from({ length: ZONES_X - 1 }, (_, i) => {
              const x = FRAME + zoneW * (i + 1);
              return `M${x} 8V${FRAME}M${x} ${H - FRAME}V${H - 8}`;
            }).join("") +
            Array.from({ length: ZONES_Y - 1 }, (_, i) => {
              const y = FRAME + zoneH * (i + 1);
              return `M8 ${y}H${FRAME}M${W - FRAME} ${y}H${W - 8}`;
            }).join("")
          }
        />
        {Array.from({ length: ZONES_X }, (_, i) => (
          <g key={`x${i}`}>
            <text x={FRAME + zoneW * (i + 0.5)} y="18.5">
              {i + 1}
            </text>
            <text x={FRAME + zoneW * (i + 0.5)} y={H - 11.5}>
              {i + 1}
            </text>
          </g>
        ))}
        {Array.from({ length: ZONES_Y }, (_, i) => (
          <g key={`y${i}`}>
            <text x="15" y={FRAME + zoneH * (i + 0.5) + 3}>
              {String.fromCharCode(65 + i)}
            </text>
            <text x={W - 15} y={FRAME + zoneH * (i + 0.5) + 3}>
              {String.fromCharCode(65 + i)}
            </text>
          </g>
        ))}
      </g>

      {/* Construction: the waterline and baseline across the sheet, a
          hairline at every yard, and a chain line down each mast. */}
      <g className="sp-construct">
        <path
          d={yards.map((y) => `M244 ${y}H756`).join("")}
          className="sp-construct__yards"
        />
        <path
          d={MAST_IDS.map(
            (id) => `M${MASTS[id].x} ${MASTS[id].truck - 26}V902`,
          ).join("")}
          className="sp-construct__centre"
        />
        <path d={`M30 ${WATERLINE_Y}H970`} className="sp-construct__dwl" />
        <path d="M30 884H970" className="sp-construct__base" />
        <text x="34" y={WATERLINE_Y - 5} className="sp-note">
          DWL
        </text>
        <text x="34" y="879" className="sp-note">
          BASE
        </text>
      </g>

      <path
        className="sp-standing sp-ink"
        pathLength={1}
        style={ink(700, 900)}
        d={STANDING}
      />

      <g className="sp-sails">
        {SAIL_IDS.map((id, j) => {
          const { cut, seams } = sailPath(id, 0);
          return (
            <g
              key={id}
              className="sp-sail"
              data-sail={id}
              data-o={ordersAttr(SAIL_ORDERS[id])}
            >
              <path
                className="sp-sail__cut sp-ink"
                pathLength={1}
                style={ink(430 + j * 45)}
                d={cut}
                ref={(el) => register("cut", id, el)}
              />
              <path
                className="sp-sail__seams"
                d={seams}
                ref={(el) => register("seams", id, el)}
              />
            </g>
          );
        })}
      </g>

      <g className="sp-spars">
        {MAST_IDS.map((id, i) => (
          <path
            key={id}
            className="sp-mastpole"
            style={ink(260 + i * 70)}
            d={mastPath(id)}
          />
        ))}
        <path
          className="sp-yard sp-ink"
          pathLength={1}
          style={ink(400, 650)}
          d={yardPaths()}
        />
        <path
          className="sp-bowsprit sp-ink"
          pathLength={1}
          style={ink(300, 400)}
          d={`M${BOWSPRIT.from.x} ${BOWSPRIT.from.y}L${BOWSPRIT.to.x} ${BOWSPRIT.to.y}`}
        />
        {/* The pennant at the main truck. */}
        <path className="sp-staff" d="M500 151V122" />
        <path
          className="sp-pennant"
          d="M501 123L551 129.5L539 135L551 140.5L501 139Z"
          ref={(el) => register("pennant", 0, el)}
        />
      </g>

      <g className="sp-hullgroup">
        <path className="sp-hull" d={HULL} />
        <path
          className="sp-hull__under"
          d={HULL}
          clipPath="url(#sp-under)"
          fill="url(#sp-hatch)"
        />
        <path
          className="sp-hull__lines sp-ink"
          pathLength={1}
          style={ink(300)}
          d={HULL_LINES}
        />
        <path
          className="sp-hull__edge sp-ink"
          pathLength={1}
          style={ink(120, 800)}
          d={HULL}
        />
      </g>

      {/* A dimension under the hull, stern to stem. */}
      <g className="sp-dim">
        <path
          className="sp-ink"
          pathLength={1}
          style={ink(560)}
          d="M294 806V926M712 784V926M298 914H708"
        />
        <path
          className="sp-dim__arrow"
          d="M298 914l9 -3.2v6.4zM708 914l-9 -3.2v6.4z"
        />
        <rect x="408" y="905" width="194" height="18" className="sp-knock" />
        <text x="505" y="918">
          {LINES.length} lines · 3 masts · {ORDERS.length} orders
        </text>
      </g>

      <g className="sp-lines">
        {LINES.map((l) => (
          <g
            key={l.n}
            className="sp-line"
            data-n={l.n}
            data-o={ordersAttr(l.orders)}
            data-strong={l.strong ? "" : undefined}
            style={{ "--w": l.weight.toFixed(2) } as CSSProperties}
          >
            <path
              className="sp-rope"
              d={ropePath(l, 1)}
              ref={(el) => register("rope", l.n, el)}
            />
            <circle
              className="sp-block"
              cx={l.anchor.x}
              cy={l.anchor.y}
              r="3.4"
            />
          </g>
        ))}
      </g>

      <g className="sp-hits">
        {LINES.map((l) => (
          <path
            key={l.n}
            className="sp-hit"
            data-n={l.n}
            d={ropePath(l, 1)}
            ref={(el) => register("hit", l.n, el)}
          />
        ))}
      </g>
    </svg>
  );
});
