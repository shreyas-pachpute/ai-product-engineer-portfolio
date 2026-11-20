"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { Achievement } from "@/lib/content";
import { voyage } from "@/lib/voyage";

/**
 * List of Lights: the Achievements page.
 *
 * Every real light is identified by its character, printed in the List of
 * Lights. Each achievement is a light on the night coast with a character
 * of its own; the 3D world draws them (components/world/sea/beacons.ts).
 * The reader identifies a light, by choosing it from the list, by tapping
 * it on the horizon, or by sweeping the bearing tape across the horizon
 * until one lines up, and its record opens with the proof. Identifying a
 * light is checking a claim.
 *
 * Every fact is in the server's HTML: the list carries each achievement's
 * record. Without the 3D world the list still works; the lights simply
 * are not drawn.
 */

export type Light = {
  achievement: Achievement;
  character: string;
  colour: "W" | "R" | "G";
  /** Degrees right of the shot's line of sight. */
  offset: number;
  distance: number;
  height: number;
};

/**
 * The Achievements shot looks along compass bearing 043° (north is -z in
 * the world; components/world/sea/beacons.ts has the same line of sight).
 */
const LINE_OF_SIGHT = 43;
/** Where a chosen light is brought to: right of the text, clear of the mist. */
const AIM_WIDE = 13;
/** The tape's reach either side of the line of sight. */
const SWEEP = 40;
/** Close enough, while sweeping, to call a light identified. */
const CATCH = 1.8;

/** Numbered marks on the tape, every ten degrees across its sweep. */
const TICKS = Array.from(
  { length: 15 },
  (_, i) => Math.round((LINE_OF_SIGHT - 70) / 10) * 10 + i * 10,
);

function compass(degrees: number): string {
  const d = ((Math.round(degrees) % 360) + 360) % 360;
  return `${String(d).padStart(3, "0")}°`;
}

export function ListOfLights({ lights }: { lights: readonly Light[] }) {
  const [selected, setSelected] = useState(-1);
  const [bearing, setBearing] = useState(0);
  const markersRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; start: number } | null>(null);
  const [aim, setAim] = useState(AIM_WIDE);

  /* The lights go up when the page opens, and out when it closes. */
  useEffect(() => {
    voyage.beacons(
      lights.map((light) => ({
        bearing: light.offset,
        distance: light.distance,
        height: light.height,
        colour: light.colour,
        character: light.character,
      })),
    );
    function measure() {
      setAim(window.innerWidth / window.innerHeight > 1.1 ? AIM_WIDE : 0);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      voyage.beacons([]);
      voyage.bearing(0);
    };
  }, [lights]);

  useEffect(() => {
    voyage.bearing(bearing);
  }, [bearing]);

  const identify = useCallback(
    (index: number) => {
      setSelected(index);
      if (index >= 0) setBearing(lights[index]!.offset - aim);
    },
    [lights, aim],
  );

  /* Markers ride on the lights, written straight to the DOM each frame. */
  useEffect(() => {
    const container = markersRef.current;
    if (!container) return;
    const markers = Array.from(
      container.querySelectorAll<HTMLElement>("[data-light]"),
    );
    const last = markers.map(() => "");
    return voyage.onFrame((readout) => {
      markers.forEach((marker, i) => {
        const beacon = readout.beacons[i];
        const on = !!beacon && beacon.visible;
        const key = on
          ? `${Math.round(beacon.x)},${Math.round(beacon.y)},${beacon.level > 0.5 ? 1 : 0}`
          : "off";
        if (key === last[i]) return;
        last[i] = key;
        if (!on) {
          marker.hidden = true;
          return;
        }
        marker.hidden = false;
        marker.style.transform = `translate3d(${Math.round(beacon.x)}px, ${Math.round(beacon.y)}px, 0)`;
        if (beacon.level > 0.5) marker.dataset.lit = "";
        else delete marker.dataset.lit;
      });
    });
  }, []);

  /* The bearing tape: drag across the horizon; a light that lines up is
     identified. */
  function onTapeDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, start: bearing };
  }
  function onTapeMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const width = event.currentTarget.clientWidth || 1;
    const next = Math.max(
      -SWEEP,
      Math.min(SWEEP, drag.start - ((event.clientX - drag.x) / width) * 60),
    );
    setBearing(next);
    const centre = next + aim;
    const hit = lights.findIndex(
      (light) => Math.abs(light.offset - centre) < CATCH,
    );
    if (hit >= 0 && hit !== selected) setSelected(hit);
  }
  function onTapeUp() {
    dragRef.current = null;
  }
  function onTapeKey(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 5 : 1;
    let next = bearing;
    if (event.key === "ArrowLeft") next -= step;
    else if (event.key === "ArrowRight") next += step;
    else return;
    event.preventDefault();
    next = Math.max(-SWEEP, Math.min(SWEEP, next));
    setBearing(next);
    const centre = next + aim;
    const hit = lights.findIndex(
      (light) => Math.abs(light.offset - centre) < CATCH,
    );
    if (hit >= 0) setSelected(hit);
  }

  const current = selected >= 0 ? lights[selected] : undefined;
  const heading = LINE_OF_SIGHT + bearing + aim;

  return (
    <div className="lol">
      <table className="lol__list">
        <caption className="label">List of Lights · Achievements</caption>
        <thead>
          <tr>
            <th scope="col">No.</th>
            <th scope="col">Light</th>
            <th scope="col">Character</th>
            <th scope="col">Bearing</th>
          </tr>
        </thead>
        <tbody>
          {lights.map((light, index) => (
            <tr
              key={light.achievement.name}
              data-on={index === selected ? "" : undefined}
            >
              <td className="lol__no">{String(index + 1).padStart(2, "0")}</td>
              <th scope="row">
                <button
                  type="button"
                  className="lol__pick"
                  aria-pressed={index === selected}
                  onClick={() => identify(index === selected ? -1 : index)}
                >
                  {light.achievement.name}
                </button>
                <span className="lol__record">
                  {[light.achievement.by, light.achievement.date]
                    .filter(Boolean)
                    .join(" · ")}
                  {light.achievement.why ? (
                    <span className="lol__why">{light.achievement.why}</span>
                  ) : null}
                  {light.achievement.href ? (
                    <a
                      className="textlink"
                      href={light.achievement.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Verify
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null}
                </span>
              </th>
              <td className="lol__char">
                <span
                  className="lol__lamp"
                  data-colour={light.colour}
                  aria-hidden="true"
                />
                {light.character.replace(/^(\S+)/, `$1 ${light.colour}`)}
              </td>
              <td className="lol__brg">
                {compass(LINE_OF_SIGHT + light.offset)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section
        className="lol__card"
        aria-live="polite"
        data-on={current ? "" : undefined}
      >
        {current ? (
          <div key={selected} className="lol__card-in">
            <p className="label lol__card-id">
              Light {String(selected + 1).padStart(2, "0")} identified ·{" "}
              {current.character.replace(/^(\S+)/, `$1 ${current.colour}`)} ·
              bearing {compass(LINE_OF_SIGHT + current.offset)}
            </p>
            <h2 className="display lol__card-name">
              {current.achievement.name}
            </h2>
            <p className="label lol__card-by">
              {[current.achievement.by, current.achievement.date]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {current.achievement.why ? <p>{current.achievement.why}</p> : null}
            {current.achievement.href ? (
              <a
                className="textlink label"
                href={current.achievement.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Check it yourself
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <p className="label lol__card-src">
                Source: my own record of the work
              </p>
            )}
          </div>
        ) : (
          <p className="lol__hint">
            {lights.length} lights on the coast. Choose one from the list
            <span className="lol__wide">
              , tap it on the horizon, or sweep the bearing tape until one lines
              up
            </span>
            .
          </p>
        )}
      </section>

      {/* Over the world: a ring on each light, and the bearing tape. */}
      <div ref={markersRef} className="lol__markers">
        {lights.map((light, index) => (
          <button
            key={light.achievement.name}
            type="button"
            className="lol__marker"
            data-light=""
            data-on={index === selected ? "" : undefined}
            hidden
            onClick={() => identify(index)}
            aria-label={`Light ${index + 1}: ${light.achievement.name}`}
          >
            <span className="lol__marker-no">{index + 1}</span>
          </button>
        ))}
      </div>

      <div
        className="lol__tape"
        role="slider"
        tabIndex={0}
        aria-label="Bearing"
        aria-valuemin={Math.round(LINE_OF_SIGHT - SWEEP)}
        aria-valuemax={Math.round(LINE_OF_SIGHT + SWEEP)}
        aria-valuenow={Math.round(heading)}
        aria-valuetext={`Bearing ${compass(heading)}`}
        onPointerDown={onTapeDown}
        onPointerMove={onTapeMove}
        onPointerUp={onTapeUp}
        onPointerCancel={onTapeUp}
        onKeyDown={onTapeKey}
        style={{ "--rel": heading - LINE_OF_SIGHT } as CSSProperties}
      >
        <span className="lol__tape-scale" aria-hidden="true">
          {TICKS.map((degrees) => (
            <span
              key={degrees}
              style={{ "--at": degrees - LINE_OF_SIGHT } as CSSProperties}
            >
              {compass(degrees)}
            </span>
          ))}
        </span>
        <span className="lol__tape-read label" aria-hidden="true">
          Bearing {compass(heading)}
        </span>
      </div>
    </div>
  );
}
