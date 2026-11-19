"use client";

import { useEffect, useState } from "react";
import { voyage } from "@/lib/voyage";

/**
 * "Fold another", and the tally.
 *
 * In the paper chapter, clicking the water folds another paper boat (the
 * stage handles that click). This is the same action as a real button, so
 * it is reachable by keyboard and obvious on a touch screen. Pressing a
 * boat sinks it (see boat-tags.tsx). The line underneath keeps count,
 * because the joke is the point: however many demos you fold, and however
 * they go down, you still do not have a ship.
 */
export function FoldControl({
  label,
  hint,
  again,
}: {
  label: string;
  hint: string;
  again: string;
}) {
  const [fleet, setFleet] = useState({ afloat: 1, sunk: 0, found: 0 });

  useEffect(() => {
    let afloat = 1;
    let sunk = 0;
    let found = 0;
    // The world reports every frame; the line changes only when a count does.
    return voyage.onFrame((readout) => {
      const now = readout.fleet;
      // Outside the paper chapter the boats are simply not on screen.
      if (readout.chapter < 0.9 || readout.chapter > 1.9) return;
      if (now.afloat === afloat && now.sunk === sunk && now.found === found)
        return;
      afloat = now.afloat;
      sunk = now.sunk;
      found = now.found;
      setFleet({ afloat, sunk, found });
    });
  }, []);

  function fold(): void {
    // Somewhere on the water, in the lower part of the frame.
    const x = window.innerWidth * (0.2 + Math.random() * 0.7);
    const y = window.innerHeight * (0.7 + Math.random() * 0.2);
    voyage.fold(x, y);
  }

  let tally = "";
  if (fleet.sunk > 0) {
    tally =
      fleet.afloat === 0
        ? `${fleet.sunk} sunk. ${again}`
        : `${fleet.afloat} afloat, ${fleet.sunk} sunk. Still no ship.`;
    if (fleet.found === 0b111111) {
      tally = `${fleet.afloat} afloat, ${fleet.sunk} sunk. Six ways down. A ship answers all six.`;
    }
  } else if (fleet.afloat > 1) {
    tally = `${fleet.afloat} paper boats. Still no ship.`;
  }

  return (
    <div
      className="fold-control label fade"
      style={{ "--i": 6 } as React.CSSProperties}
    >
      <button type="button" className="flag" onClick={fold}>
        {label}
      </button>
      <span className="fold-control__hint">{hint}</span>
      <span className="fold-control__count" aria-live="polite">
        {tally}
      </span>
    </div>
  );
}
