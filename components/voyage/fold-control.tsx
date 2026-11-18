"use client";

import { useEffect, useState } from "react";
import { voyage } from "@/lib/voyage";

/**
 * "Fold another": the one toy on the page.
 *
 * In the paper chapter, clicking the water folds another paper boat (the
 * stage handles that click). This is the same action as a real button, so
 * it is reachable by keyboard and obvious on a touch screen, plus a line
 * that keeps count — because the joke is the point: however many demos
 * you fold, you still do not have a ship.
 */
export function FoldControl({ label, hint }: { label: string; hint: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => voyage.onFold(setCount), []);

  function fold(): void {
    // Somewhere on the water, in the lower part of the frame.
    const x = window.innerWidth * (0.2 + Math.random() * 0.7);
    const y = window.innerHeight * (0.7 + Math.random() * 0.2);
    voyage.fold(x, y);
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
        {count > 0 ? `${count + 1} paper boats. Still no ship.` : ""}
      </span>
    </div>
  );
}
