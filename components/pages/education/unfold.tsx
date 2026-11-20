"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createEngine, type Engine, type PieceEls } from "./engine";
import { CREASES, FOLD_COUNT, H, PIECES, W } from "./geometry";

/**
 * Unfold the boat.
 *
 * The opening on the home page folds a sheet into a paper boat. Here the
 * visitor unfolds it again, one fold at a time, and the sheet turns out to
 * be the plans of a ship: each fold opened shows one of the things he
 * learned the trade from, written on the panel it uncovers.
 *
 * The paper is a slider (0 folded, 3 flat): drag it, tap it, use the arrow
 * keys on it, or the buttons under it. `facts` (the same facts as HTML) and
 * `plan` (the drawing) are rendered on the server and passed in.
 *
 * Without JavaScript the sheet is simply shown flat (the <noscript> rules).
 */

const NO_SCRIPT = [
  ".page--education .edu-piece,.page--education .edu-sheet,.page--education .edu-shadows{transform:none!important}",
  ".page--education .edu-face,.page--education .edu-crease,.page--education .edu-fact{opacity:1!important}",
  ".page--education .edu-shadow--boat,.page--education .edu-piece--still .edu-shade,.page--education .edu-piece--still .edu-light{opacity:0!important}",
  ".page--education .edu-shadow--sheet{opacity:1!important;transform:none!important}",
  ".page--education .edu-controls,.page--education .edu-caption{display:none!important}",
  ".page--education .edu-stage{cursor:auto}",
  ".page--education .edu-fact__no::before{transform:none!important}",
  ".page--education .edu-fact__no{color:var(--color-paper)!important;border-color:transparent!important}",
].join("");

function crease(line: readonly (readonly [number, number])[], key: string) {
  const [a, b] = line;
  if (!a || !b) return null;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  // A crease, opened: a soft valley, a dark edge, and a lit edge beside it.
  const nx = (-(b[1] - a[1]) / len) * 1.6;
  const ny = ((b[0] - a[0]) / len) * 1.6;
  const at = (dx: number, dy: number) => ({
    x1: a[0] + dx,
    y1: a[1] + dy,
    x2: b[0] + dx,
    y2: b[1] + dy,
  });
  return (
    <g key={key}>
      <line {...at(0, 0)} className="edu-crease__soft" />
      <line {...at(-nx / 2, -ny / 2)} className="edu-crease__dark" />
      <line {...at(nx / 2, ny / 2)} className="edu-crease__lit" />
    </g>
  );
}

export function Unfold({
  facts,
  plan,
  names,
}: {
  facts: ReactNode;
  plan: ReactNode;
  /** What each fold reveals, in order. */
  names: readonly string[];
}) {
  const [level, setLevel] = useState(0);
  const [said, setSaid] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const namesRef = useRef(names);

  useEffect(() => {
    const box = stage.current;
    if (!box) return;
    const q = <T extends Element>(sel: string, from: ParentNode = box) =>
      from.querySelector<T>(sel);
    const float = q<HTMLElement>(".edu-float");
    const sheet = q<HTMLElement>(".edu-sheet");
    const shadows = q<HTMLElement>(".edu-shadows");
    const boatShadow = q<HTMLElement>(".edu-shadow--boat");
    const sheetShadow = q<HTMLElement>(".edu-shadow--sheet");
    if (!float || !sheet || !shadows || !boatShadow || !sheetShadow) return;

    const pieces = new Map<string, PieceEls>();
    for (const el of box.querySelectorAll<HTMLElement>("[data-piece]")) {
      const face = q<HTMLElement>(".edu-face", el);
      const frost = q<HTMLElement>(".edu-frost", el);
      const shade = q<HTMLElement>(".edu-shade", el);
      const light = q<HTMLElement>(".edu-light", el);
      const id = el.dataset.piece;
      if (id && face && frost && shade && light)
        pieces.set(id, { piece: el, face, frost, shade, light });
    }
    const creases = [...box.querySelectorAll<SVGSVGElement>(".edu-crease")];

    engine.current = createEngine(
      {
        stage: box,
        float,
        sheet,
        shadows,
        boatShadow,
        sheetShadow,
        pieces,
        creases,
      },
      (l) => {
        setLevel(l);
        const n = namesRef.current;
        setSaid(
          l === 0
            ? "Folded back into a paper boat."
            : `Fold ${l} of ${FOLD_COUNT} open: ${n[l - 1] ?? ""}.${l === FOLD_COUNT ? " The sheet is flat." : ""}`,
        );
      },
    );
    if (root.current) root.current.dataset.ready = "";
    return () => {
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const en = engine.current;
    if (!en) return;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
      case "PageUp":
        en.step(1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
      case "PageDown":
        en.step(-1);
        break;
      case "Home":
        en.to(0);
        break;
      case "End":
        en.to(FOLD_COUNT);
        break;
      case "Enter":
      case " ":
        en.next();
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  const caption =
    level === 0
      ? "Drag the boat open, or press Unfold."
      : level < FOLD_COUNT
        ? `${level} of ${FOLD_COUNT} · ${names[level - 1] ?? ""}`
        : "Flat. The plans were in the paper boat all along.";

  return (
    <div className="edu" ref={root} data-level={level}>
      {facts}
      <div className="edu-figure">
        <div
          ref={stage}
          className="edu-stage"
          role="slider"
          tabIndex={0}
          aria-label="Paper boat, folded from the plans"
          aria-valuemin={0}
          aria-valuemax={FOLD_COUNT}
          aria-valuenow={level}
          aria-valuetext={
            level === 0
              ? "Folded"
              : level === FOLD_COUNT
                ? "Flat"
                : `${level} of ${FOLD_COUNT} folds open`
          }
          onKeyDown={onKey}
        >
          <div className="edu-shadows">
            <i className="edu-shadow edu-shadow--boat" />
            <i className="edu-shadow edu-shadow--sheet" />
          </div>
          <div className="edu-float">
            <div className="edu-sheet">
              {PIECES.map((p) => (
                <div
                  key={p.id}
                  data-piece={p.id}
                  className={
                    p.fold === null ? "edu-piece edu-piece--still" : "edu-piece"
                  }
                  style={
                    {
                      ...p.box,
                      transformOrigin: p.origin,
                      "--ux": p.ux,
                      "--uy": p.uy,
                      "--a0": `${p.folded}deg`,
                    } as CSSProperties
                  }
                >
                  <div className="edu-face" style={{ clipPath: p.clip }}>
                    <div className="edu-paper" style={p.inner}>
                      <svg
                        viewBox={`0 0 ${W} ${H}`}
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <use href="#edu-plan" />
                      </svg>
                    </div>
                    <i className="edu-frost" />
                    <i className="edu-shade" />
                    <i className="edu-light" />
                  </div>
                </div>
              ))}
              {CREASES.map((lines, i) => (
                <svg
                  key={i}
                  className="edu-crease"
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  {lines.map((l, j) => crease(l, `${i}-${j}`))}
                </svg>
              ))}
            </div>
          </div>
        </div>

        <div className="edu-controls">
          <button
            type="button"
            className="edu-back label"
            aria-disabled={level === 0 ? true : undefined}
            onClick={() => engine.current?.back()}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M8 5 3.5 9.5 8 14M4 9.5h7.5a5 5 0 0 1 0 10H10" />
            </svg>
            Fold back
          </button>
          <ol className="edu-pips" aria-hidden="true">
            {Array.from({ length: FOLD_COUNT }, (_, i) => (
              <li key={i} data-on={i < level ? "" : undefined}>
                {i + 1}
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="flag label edu-next"
            onClick={() => engine.current?.next()}
          >
            {level < FOLD_COUNT ? "Unfold" : "Fold it up"}
          </button>
        </div>
        <p className="edu-caption label" aria-hidden="true">
          {caption}
        </p>
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
      </div>
      {plan}
      <noscript>
        <style>{NO_SCRIPT}</style>
      </noscript>
    </div>
  );
}
