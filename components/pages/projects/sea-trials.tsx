"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { Project, Trial } from "@/lib/content";
import { ANATOMY, PRESSURES } from "@/lib/site";
import { voyage } from "@/lib/voyage";

/**
 * Sea trials: the Projects page.
 *
 * On the crossing the reader sinks paper boats with six pressures. Here
 * the same pressures are put to the real ships. Each project is a vessel;
 * choosing a pressure puts the 3D ship through that weather (the world's
 * trials.ts), and a tag pins to the part of the ship that held, saying
 * what in the project's build held it and linking the proof.
 *
 * Every fact is in the server's HTML: all four vessels, their stories and
 * every trial record. With JavaScript, one vessel shows at a time (the
 * head script's `data-intro` on <html> is the JavaScript signal, so there
 * is no flash of all four), and a record's text appears when its trial is
 * run, like an entry being written into a log.
 */

export type Vessel = {
  project: Project;
  trials: readonly Trial[];
};

const PART = Object.fromEntries(
  ANATOMY.map((part) => [part.part, part] as const),
);

function partOf(pressure: number) {
  const key = PRESSURES[pressure]!.part;
  return PART[key]!;
}

export function SeaTrials({ vessels }: { vessels: readonly Vessel[] }) {
  const [selected, setSelected] = useState(0);
  const [trial, setTrial] = useState(-1);
  // Which trials have been run, per vessel.
  const [run, setRun] = useState<readonly number[][]>(() =>
    vessels.map(() => []),
  );
  const tagRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* The world follows the trial; calm again when the page is left. */
  useEffect(() => {
    voyage.trial(trial);
  }, [trial]);
  useEffect(() => () => voyage.trial(-1), []);

  const choose = useCallback(
    (index: number) => {
      if (index === selected) return;
      setSelected(index);
      setTrial(-1);
    },
    [selected],
  );

  const put = useCallback(
    (pressure: number) => {
      setTrial((now) => (now === pressure ? -1 : pressure));
      setRun((all) =>
        all.map((list, i) =>
          i === selected && !list.includes(pressure)
            ? [...list, pressure]
            : list,
        ),
      );
    },
    [selected],
  );

  /* Escape calms the sea. */
  useEffect(() => {
    if (trial < 0) return;
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setTrial(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trial]);

  /* The tag rides on the ship: each frame, onto the part that held. */
  useEffect(() => {
    const tag = tagRef.current;
    if (!tag) return;
    let shownAt = "";
    return voyage.onFrame((readout) => {
      if (trial < 0) {
        if (shownAt) {
          shownAt = "";
          delete tag.dataset.on;
        }
        return;
      }
      const part = PRESSURES[trial]!.part;
      const anchor = readout.anchors.find((a) => a.id === part);
      const width = window.innerWidth;
      // Only on screens wide enough to have the ship clear of the text.
      const room = width >= 1040 && window.innerHeight >= 560;
      if (!anchor || anchor.visible < 0.5 || !room) {
        if (shownAt) {
          shownAt = "";
          delete tag.dataset.on;
        }
        return;
      }
      const x = Math.round(anchor.x);
      const y = Math.round(anchor.y);
      const key = `${x},${y}`;
      if (key === shownAt) return;
      shownAt = key;
      tag.dataset.on = "";
      tag.style.setProperty("--x", `${x}px`);
      tag.style.setProperty("--y", `${y}px`);
      // The tag opens to whichever side has room.
      tag.dataset.side = x > width * 0.72 ? "left" : "right";
    });
  }, [trial]);

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let next = -1;
    if (event.key in keys)
      next = (selected + keys[event.key]! + vessels.length) % vessels.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = vessels.length - 1;
    if (next < 0) return;
    event.preventDefault();
    choose(next);
    tabRefs.current[next]?.focus();
  }

  const current = vessels[selected]!;
  const held =
    trial >= 0 ? current.trials.find((t) => t.pressure === trial) : undefined;

  return (
    <div className="trials">
      <div
        className="trials__register"
        role="tablist"
        aria-label="Choose a vessel"
        onKeyDown={onTabKey}
      >
        {vessels.map((vessel, index) => (
          <button
            key={vessel.project.name}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`vessel-tab-${index}`}
            aria-controls={`vessel-${index}`}
            aria-selected={index === selected}
            tabIndex={index === selected ? 0 : -1}
            className="trials__tab"
            onClick={() => choose(index)}
          >
            <span className="trials__no">
              No. {String(index + 1).padStart(2, "0")}
            </span>
            <span className="trials__name">{vessel.project.name}</span>
            <span className="trials__class" data-status={vessel.project.status}>
              {vessel.project.status}
            </span>
          </button>
        ))}
      </div>

      {vessels.map((vessel, index) => {
        const { project } = vessel;
        const story = project.story;
        const done = run[index] ?? [];
        return (
          <article
            key={project.name}
            id={`vessel-${index}`}
            role="tabpanel"
            aria-labelledby={`vessel-tab-${index}`}
            className="trials__vessel"
            data-on={index === selected ? "" : undefined}
          >
            <header className="trials__head">
              <p className="key label">
                {project.owner} · {project.status} · {project.years}
              </p>
              <h2 className="display trials__title">{project.name}</h2>
              {story ? (
                <p className="display trials__kicker">{story.kicker}</p>
              ) : (
                <p className="body">{project.line}</p>
              )}
            </header>

            <section
              className="trials__log"
              aria-label={`Sea trials of ${project.name}`}
            >
              <p className="trials__log-head label">
                <span>Sea trials</span>
                <span className="trials__count" aria-live="polite">
                  {done.length} of {vessel.trials.length} run
                </span>
              </p>
              <ol className="trials__records">
                {vessel.trials.map((record) => {
                  const part = partOf(record.pressure);
                  const on = index === selected && trial === record.pressure;
                  const seen = done.includes(record.pressure);
                  return (
                    <li
                      key={record.pressure}
                      className="trials__record"
                      data-on={on ? "" : undefined}
                      data-seen={seen ? "" : undefined}
                    >
                      <button
                        type="button"
                        className="trials__pressure"
                        aria-pressed={on}
                        onClick={() => put(record.pressure)}
                      >
                        <span className="trials__ask display">
                          {PRESSURES[record.pressure]!.ask}
                        </span>
                        <span className="trials__part label">
                          The {part.name.toLowerCase()} · {part.means}
                        </span>
                      </button>
                      <div className="trials__held">
                        <p>{record.held}</p>
                        {record.proof ? (
                          <a
                            className="textlink label"
                            href={record.proof.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Proof: {record.proof.label}
                            <span className="sr-only">
                              {" "}
                              (opens in a new tab)
                            </span>
                          </a>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {story ? (
              <div className="trials__story">
                <section>
                  <h3 className="label">The problem</h3>
                  <p>{story.problem}</p>
                </section>
                <section>
                  <h3 className="label">What I built</h3>
                  <p>{story.built}</p>
                </section>
                <section>
                  <h3 className="label">The hard decisions</h3>
                  <ul className="trials__decisions">
                    {story.decisions.map((decision) => (
                      <li key={decision.title}>
                        <strong className="display">{decision.title}</strong>
                        <span>{decision.body}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="label">The result</h3>
                  <p>{story.result}</p>
                </section>
              </div>
            ) : null}

            <p className="trials__stack label">{project.stack.join(" · ")}</p>
            <p className="trials__links label">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  className="textlink"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </p>
          </article>
        );
      })}

      {/* Pinned to the ship's part while a trial is on (wide screens). */}
      <div ref={tagRef} className="trials__tag" aria-hidden="true">
        {held ? (
          <div className="trials__tag-sheet" key={`${selected}-${trial}`}>
            <p className="label trials__tag-part">
              Held: the {partOf(held.pressure).name.toLowerCase()} ·{" "}
              {partOf(held.pressure).means}
            </p>
            <p className="display trials__tag-text">{held.held}</p>
            <p className="label trials__tag-ship">{current.project.name}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
