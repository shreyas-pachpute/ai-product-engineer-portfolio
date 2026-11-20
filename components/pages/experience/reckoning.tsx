"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Dividers } from "./dividers";
import { placeVars, type ChartLayout, type Pt } from "./geometry";
import { ArmArt, HeadArt, InstrumentDefs, ShadeArt } from "./instrument";
import { CHART_ID, HARBOUR_ENTRY_ID, legEntryId } from "./log-pages";
import { useMonthNow } from "./months";
import { monthsText, read, type Reading, type Voyage } from "./voyage";

/**
 * Dead reckoning: the chart, the dividers, and the log beside them.
 *
 * One piece of state matters: which two ports the dividers' points stand
 * on. The chart reads out the span between them (months, and the legs and
 * fixes in it) and the log shows the pages for those legs. Choosing a port
 * or a fix walks the dividers over to that leg, which opens its page.
 *
 * Positions on the chart come from ./geometry.ts as CSS custom properties,
 * one pair per layout; the stylesheet picks the pair for the screen. The
 * dividers read the ports' positions back from the DOM, so they work on
 * whichever layout is showing.
 */

type View = { kind: "legs"; lo: number; hi: number } | { kind: "harbour" };

type Intent =
  | { kind: "fix"; leg: number; fix: number }
  | { kind: "page"; focus: boolean }
  | null;

/** The two ports the points would settle on: shared with the readouts only. */
function createPreview(initial: readonly [number, number]) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(a: number, b: number) {
      if (a === value[0] && b === value[1]) return;
      value = [a, b];
      for (const listener of listeners) listener();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
type Preview = ReturnType<typeof createPreview>;

function legsText(reading: Reading): string {
  const { legs } = reading;
  if (legs.length === 1) return `${legs[0]!.title}, ${legs[0]!.company}`;
  return legs.map((leg) => leg.company).join(", then ");
}

function sentence(reading: Reading, voyage: Voyage): string {
  if (reading.lo === reading.hi) {
    return `Dividers closed on ${reading.from}${reading.lo === 0 && voyage.harbour ? `, the departure from ${voyage.harbour.name}` : ""}.`;
  }
  const months =
    reading.months === null ? "" : `: ${monthsText(reading.months)}`;
  return `${reading.from} to ${reading.to}${months}. ${legsText(reading)}, ${reading.fixes} fixes.`;
}

function useReading(preview: Preview, voyage: Voyage): Reading {
  const [a, b] = useSyncExternalStore(
    preview.subscribe,
    preview.get,
    preview.get,
  );
  return read(voyage, a, b, useMonthNow());
}

function Readout({ preview, voyage }: { preview: Preview; voyage: Voyage }) {
  const reading = useReading(preview, voyage);
  const closed = reading.lo === reading.hi;
  return (
    <div className="rk-readout" data-closed={closed ? "" : undefined}>
      <p className="rk-readout__span label">
        {closed ? (
          reading.from
        ) : (
          <>
            {reading.from}
            <span className="rk-readout__to" aria-hidden="true">
              {" "}
              →{" "}
            </span>
            <span className="sr-only"> to </span>
            {reading.to}
          </>
        )}
      </p>
      <p
        className="rk-readout__months display"
        data-pending={reading.months === null ? "" : undefined}
      >
        <span className="rk-readout__n">
          {reading.months === null ? "…" : reading.months}
        </span>{" "}
        <span className="rk-readout__unit">
          {reading.months === 1 ? "month" : "months"}
        </span>
      </p>
      <p className="rk-readout__what">
        {closed ? (
          reading.lo === 0 && voyage.harbour ? (
            `Closed on the departure from ${voyage.harbour.name}.`
          ) : (
            "Closed on one port. Open them across a leg."
          )
        ) : (
          <>
            <span className="rk-readout__legs">{legsText(reading)}</span>
            <span className="rk-readout__fixes">{reading.fixes} fixes</span>
          </>
        )}
      </p>
    </div>
  );
}

function Plate({ preview, voyage }: { preview: Preview; voyage: Voyage }) {
  const reading = useReading(preview, voyage);
  return (
    <span className="rk-plate__text label">
      {reading.months === null ? "…" : monthsText(reading.months)}
    </span>
  );
}

export function Reckoning({
  voyage,
  layouts,
  art,
  pages,
}: {
  voyage: Voyage;
  layouts: readonly ChartLayout[];
  /** The chart drawings, one per layout, rendered on the server. */
  art: ReactNode;
  /** The log pages, rendered on the server. */
  pages: { harbour: ReactNode; legs: readonly ReactNode[] };
}) {
  const last = voyage.ports.length - 1;
  const first = Math.max(0, last - 1);
  const [preview] = useState(() => createPreview([first, last]));
  const [points, setPoints] = useState<[number, number]>([first, last]);
  const [view, setView] = useState<View>({ kind: "legs", lo: first, hi: last });
  const [note, setNoteState] = useState<{ leg: number; fix: number } | null>(
    null,
  );
  // What the note last said, so it can fade out without going blank first.
  const [noteText, setNoteText] = useState<{ leg: number; fix: number }>({
    leg: 0,
    fix: 0,
  });
  const setNote = (next: { leg: number; fix: number } | null) => {
    setNoteState(next);
    if (next) setNoteText(next);
  };
  const [said, setSaid] = useState("");
  const [turn, setTurn] = useState(0);

  const sheetRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const dividersRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Dividers | null>(null);
  const intentRef = useRef<Intent>(null);
  const nowRef = useRef<number | null>(null);
  const now = useMonthNow();

  useEffect(() => {
    nowRef.current = now;
  }, [now]);

  /* The dividers ------------------------------------------------------------ */

  useEffect(() => {
    const root = dividersRef.current;
    const plot = plotRef.current;
    const sheet = sheetRef.current;
    if (!root || !plot || !sheet) return;
    const one = (selector: string) =>
      root.querySelector<HTMLElement>(selector)!;
    const two = (selector: string) => {
      const found = root.querySelectorAll<HTMLElement>(selector);
      return [found[0]!, found[1]!] as const;
    };
    const ports = () =>
      Array.from(plot.querySelectorAll<HTMLElement>(".rk-port"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const mark = (a: number, b: number) => {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const legs: number[] = [];
      for (let i = lo; i < hi; i++) legs.push(i);
      sheet.dataset.legs = legs.join(" ");
      sheet.dataset.ports = `${lo} ${hi}`;
    };

    const engine = new Dividers(
      {
        root,
        arms: two(".rk-arm"),
        shades: two(".rk-shade"),
        head: one(".rk-head"),
        headShade: one(".rk-headshade"),
        points: two(".rk-point"),
        plate: one(".rk-plate"),
      },
      {
        ports,
        hand: () => 1,
        onPreview: (a, b) => {
          preview.set(a, b);
          mark(a, b);
        },
        onCommit: (a, b, how) => {
          preview.set(a, b);
          mark(a, b);
          setPoints([a, b]);
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          if (lo < hi) setView({ kind: "legs", lo, hi });
          else if (lo === 0 && voyage.harbour) setView({ kind: "harbour" });
          if (how !== "go")
            setSaid(sentence(read(voyage, a, b, nowRef.current), voyage));
        },
        // A tap on a point opens the page for the port it stands on.
        onTap: (port) => {
          const leg = Math.min(port, voyage.legs.length - 1);
          intentRef.current = { kind: "page", focus: false };
          engineRef.current?.go(leg, leg + 1);
          setTurn((n) => n + 1);
        },
        onSettle: (port) => {
          if (motion.matches) return;
          ports()
            [port]?.querySelector(".rk-port__ring")
            ?.animate(
              [
                { transform: "scale(0.6)", opacity: 0.9 },
                { transform: "scale(2.4)", opacity: 0 },
              ],
              { duration: 620, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            );
        },
      },
      [last, last],
      [first, last],
      motion.matches,
    );
    engineRef.current = engine;

    const resized = new ResizeObserver(() => engine.measure());
    resized.observe(plot);
    // The leg in use is inked in as the dividers open, once the page is live.
    const inked = requestAnimationFrame(() => {
      sheet.dataset.drawn = "";
    });
    const onMotion = () => engine.setReduced(motion.matches);
    motion.addEventListener("change", onMotion);
    return () => {
      cancelAnimationFrame(inked);
      resized.disconnect();
      motion.removeEventListener("change", onMotion);
      engine.destroy();
      engineRef.current = null;
    };
    // The engine is made once; its callbacks only use setters and refs.
  }, [preview, voyage, first, last]);

  /* Choosing ------------------------------------------------------------------ */

  function openLeg(leg: number, intent: Intent): void {
    intentRef.current = intent;
    engineRef.current?.go(leg, leg + 1);
    setTurn((n) => n + 1);
  }

  function openHarbour(intent: Intent): void {
    if (!voyage.harbour) return;
    intentRef.current = intent;
    engineRef.current?.go(0, 0);
    setTurn((n) => n + 1);
  }

  function openPort(port: number): void {
    openLeg(Math.min(port, voyage.legs.length - 1), {
      kind: "page",
      focus: false,
    });
  }

  function onLogClick(event: MouseEvent<HTMLElement>): void {
    const link = (event.target as Element).closest<HTMLElement>("[data-go]");
    if (!link) return;
    event.preventDefault();
    const go = link.dataset.go ?? "";
    const intent: Intent = { kind: "page", focus: true };
    if (go === "harbour") openHarbour(intent);
    else if (go.startsWith("leg:")) openLeg(Number(go.slice(4)), intent);
  }

  /* After a page is opened: bring it (or the fix) into view. */
  useEffect(() => {
    const intent = intentRef.current;
    intentRef.current = null;
    const log = logRef.current;
    if (!intent || !log) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const headerHeight =
      document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 72;
    for (const old of log.querySelectorAll("[data-hot]"))
      old.removeAttribute("data-hot");

    let target: HTMLElement | null = null;
    if (intent.kind === "fix") {
      const leg = voyage.legs[intent.leg];
      target = leg
        ? log.querySelector<HTMLElement>(
            `#${legEntryId(leg)} [data-fix="${intent.fix + 1}"]`,
          )
        : null;
      if (target) target.dataset.hot = "";
    } else {
      target = log.querySelector<HTMLElement>(".rk-entry[data-on] .rk-page");
    }
    if (!target) return;
    const rect = target.getBoundingClientRect();
    // Clear of the header and the mist that closes over it.
    const clear = headerHeight + 56;
    const seen = rect.top >= clear && rect.top <= window.innerHeight * 0.72;
    if (!seen) {
      // A page is brought up to its top; a fix, to a third of the way down.
      const want =
        intent.kind === "fix"
          ? Math.max(clear, window.innerHeight * 0.34)
          : clear - 32;
      window.scrollTo({
        top: window.scrollY + rect.top - want,
        behavior: reduced ? "auto" : "smooth",
      });
    }
    if (intent.kind === "page" && intent.focus) {
      target.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    }
  }, [turn, view, voyage.legs]);

  /* The pencilled note beside a fix, while it is pointed at. */
  useLayoutEffect(() => {
    const el = noteRef.current;
    const plot = plotRef.current;
    if (!el || !plot || !note) return;
    const fix = plot.querySelector<HTMLElement>(
      `.rk-fix[data-leg="${note.leg}"][data-fix="${note.fix}"]`,
    );
    if (!fix) return;
    const fx = fix.offsetLeft + fix.offsetWidth / 2;
    const fy = fix.offsetTop + fix.offsetHeight / 2;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const right = fx < plot.offsetWidth / 2;
    const x = right ? fx + 20 : fx - 20 - w;
    const y = Math.min(plot.offsetHeight - h - 10, Math.max(10, fy - h / 2));
    el.style.transform = `translate3d(${Math.max(6, Math.min(plot.offsetWidth - w - 6, x)).toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.dataset.side = right ? "right" : "left";
  }, [note]);

  /* Rendering ------------------------------------------------------------------ */

  const at = (pick: (layout: ChartLayout) => Pt): CSSProperties =>
    placeVars(layouts, pick) as CSSProperties;
  const boxVars = (): CSSProperties => {
    const vars: Record<string, string> = {};
    for (const layout of layouts) {
      const box = layout.cartouche;
      if (!box) continue;
      vars[`--x-${layout.id}`] = (box.x / layout.w).toFixed(5);
      vars[`--y-${layout.id}`] = (box.y / layout.h).toFixed(5);
      vars[`--w-${layout.id}`] = (box.w / layout.w).toFixed(5);
    }
    return vars as CSSProperties;
  };
  const legendVars = (): CSSProperties => {
    const vars: Record<string, string> = {};
    for (const layout of layouts) {
      const box = layout.legend;
      vars[`--x-${layout.id}`] = (box.x / layout.w).toFixed(5);
      vars[`--y-${layout.id}`] = (box.y / layout.h).toFixed(5);
      vars[`--w-${layout.id}`] = (box.w / layout.w).toFixed(5);
    }
    return vars as CSSProperties;
  };

  /** Which side of its port a date is written on, per layout. */
  const sideVars = (port: number): CSSProperties => {
    const vars: Record<string, number> = {};
    for (const layout of layouts) {
      const side = layout.tags[port] ?? "right";
      vars[`--sx-${layout.id}`] =
        side === "left" ? -1 : side === "right" ? 1 : 0;
      vars[`--sy-${layout.id}`] =
        side === "above" ? -1 : side === "below" ? 1 : 0;
    }
    return vars as CSSProperties;
  };

  const legCount = voyage.legs.length;
  const shown = (leg: number) =>
    view.kind === "legs" && leg >= view.lo && leg < view.hi;
  const noted = voyage.legs[noteText.leg];
  const initialLegs = Array.from(
    { length: last - first },
    (_, i) => first + i,
  ).join(" ");

  const sliderText = (port: number) => {
    const label = voyage.ports[port]?.label ?? "";
    return port === 0 && voyage.harbour ? `${label}, the departure` : label;
  };

  return (
    <>
      <section
        id={CHART_ID}
        className="rk-chart"
        aria-labelledby="rk-title"
        tabIndex={-1}
      >
        <div
          ref={sheetRef}
          className="rk-sheet"
          data-legs={initialLegs}
          data-ports={`${first} ${last}`}
        >
          <div className="rk-cart" style={boxVars()}>
            <h2 id="rk-title" className="rk-cart__title display">
              Dead reckoning
            </h2>
            <Readout preview={preview} voyage={voyage} />
            <p className="rk-cart__how">
              <span className="rk-cart__hint">
                Drag a point of the dividers onto a port, or{" "}
              </span>
              <button
                type="button"
                className="rk-cart__all"
                onClick={() => {
                  intentRef.current = null;
                  engineRef.current?.go(0, last);
                }}
              >
                measure the whole passage
              </button>
            </p>
          </div>

          <div ref={plotRef} className="rk-plot">
            {art}
            <InstrumentDefs />

            <div className="rk-spots">
              {voyage.harbour ? (
                <button
                  type="button"
                  className="rk-harbour rk-at"
                  style={at((layout) => layout.harbour)}
                  aria-pressed={view.kind === "harbour"}
                  onClick={() => openHarbour({ kind: "page", focus: false })}
                >
                  <span className="rk-harbour__name">
                    {voyage.harbour.name}
                  </span>
                  <span className="rk-harbour__years label">
                    {voyage.harbour.years}
                  </span>
                  <span className="sr-only">
                    , the harbour of departure: {voyage.harbour.award}. Opens
                    its log page.
                  </span>
                </button>
              ) : null}

              {voyage.legs.map((leg, l) =>
                leg.remarks.map((remark, k) => (
                  <button
                    key={`${leg.id}-${k}`}
                    type="button"
                    className="rk-fix rk-at"
                    data-leg={l}
                    data-fix={k}
                    style={at((layout) => layout.fixes[l]?.[k] ?? [0, 0])}
                    onClick={() => openLeg(l, { kind: "fix", leg: l, fix: k })}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse")
                        setNote({ leg: l, fix: k });
                    }}
                    onPointerLeave={() => setNote(null)}
                    onFocus={(event) => {
                      if (event.currentTarget.matches(":focus-visible"))
                        setNote({ leg: l, fix: k });
                    }}
                    onBlur={() => setNote(null)}
                  >
                    <span className="rk-fix__mark" aria-hidden="true" />
                    <span className="sr-only">
                      {leg.company}, fix {k + 1} of {leg.remarks.length}:{" "}
                      {remark}
                    </span>
                  </button>
                )),
              )}

              {voyage.ports.map((port, p) => {
                const leg = voyage.legs[Math.min(p, legCount - 1)];
                return (
                  <button
                    key={p}
                    type="button"
                    className="rk-port rk-at"
                    data-port={p}
                    data-now={port.when === "now" ? "" : undefined}
                    style={{
                      ...at((layout) => layout.ports[p] ?? [0, 0]),
                      ...sideVars(p),
                    }}
                    onClick={() => openPort(p)}
                  >
                    <span className="rk-port__ring" aria-hidden="true" />
                    <span className="rk-port__mark" aria-hidden="true" />
                    <span className="rk-port__tag label">{port.label}</span>
                    {leg ? (
                      <span className="sr-only">
                        {p === 0 ? ", departure" : ""}: opens the log page for{" "}
                        {leg.title}, {leg.company}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div
              ref={noteRef}
              className="rk-note"
              data-on={note ? "" : undefined}
              aria-hidden="true"
            >
              {noted ? (
                <>
                  <span className="rk-note__head label">
                    {noted.company} · fix {noteText.fix + 1} of{" "}
                    {noted.remarks.length}
                  </span>
                  <span className="rk-note__text">
                    {noted.remarks[noteText.fix]}
                  </span>
                </>
              ) : null}
            </div>

            <div ref={dividersRef} className="rk-dividers">
              <div className="rk-shades" aria-hidden="true">
                <div className="rk-shade">
                  <ShadeArt />
                </div>
                <div className="rk-shade">
                  <ShadeArt />
                </div>
                <div className="rk-headshade" />
              </div>
              <div className="rk-arm" aria-hidden="true">
                <ArmArt />
              </div>
              <div className="rk-arm" aria-hidden="true">
                <ArmArt />
              </div>
              <div className="rk-head" aria-hidden="true">
                <HeadArt />
              </div>
              {([0, 1] as const).map((i) => (
                <div
                  key={i}
                  className="rk-point"
                  data-i={i}
                  role="slider"
                  tabIndex={0}
                  aria-label={`Dividers, ${i === 0 ? "first" : "second"} point`}
                  aria-valuemin={0}
                  aria-valuemax={last}
                  aria-valuenow={points[i]}
                  aria-valuetext={sliderText(points[i])}
                  aria-describedby="rk-readout-said"
                >
                  <span className="rk-point__ring" aria-hidden="true" />
                  <span className="rk-point__prick" aria-hidden="true" />
                </div>
              ))}
              <div className="rk-plate" aria-hidden="true">
                <Plate preview={preview} voyage={voyage} />
              </div>
            </div>

            <p className="rk-legend" style={legendVars()}>
              <span className="rk-legend__item">
                <span className="rk-legend__port" aria-hidden="true" /> Port: a
                date
              </span>
              <span className="rk-legend__item">
                <span className="rk-legend__fix" aria-hidden="true" /> Fix:
                something built or done
              </span>
              <span className="rk-legend__item rk-legend__scale">
                Legs not to scale
              </span>
            </p>
          </div>
        </div>
        <p id="rk-readout-said" className="sr-only" role="status">
          {said}
        </p>
      </section>

      <section
        ref={logRef}
        className="rk-log"
        aria-label="The log"
        onClick={onLogClick}
      >
        {pages.harbour ? (
          <div
            className="rk-entry"
            data-entry={HARBOUR_ENTRY_ID}
            data-on={view.kind === "harbour" ? "" : undefined}
          >
            {pages.harbour}
          </div>
        ) : null}
        {pages.legs.map((page, i) => (
          <div
            key={i}
            className="rk-entry"
            data-entry={voyage.legs[i] ? legEntryId(voyage.legs[i]!) : i}
            data-on={shown(i) ? "" : undefined}
          >
            {page}
          </div>
        ))}
      </section>
    </>
  );
}
