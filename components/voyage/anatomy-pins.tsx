"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ANATOMY, type AnatomyPart } from "@/lib/site";
import { voyage } from "@/lib/voyage";

/**
 * Numbered callouts on the ship.
 *
 * Each number is pinned to a point on the 3D model. The world reports
 * where those points are on screen once per frame (and whether the part
 * has been built yet); this writes that straight into each pin's transform
 * and opacity. No React state is involved, so nothing re-renders.
 *
 * `lead` is the short leader line from the point to the number: an angle
 * in degrees (0 = right, 90 = down) and a length in pixels, chosen per
 * part so the numbers sit clear of the model and of each other.
 */
const LEAD: Record<AnatomyPart, { angle: number; length: number }> = {
  keel: { angle: 118, length: 48 },
  ballast: { angle: 78, length: 50 },
  hull: { angle: 205, length: 58 },
  stores: { angle: 52, length: 46 },
  compass: { angle: -52, length: 56 },
  rigging: { angle: -18, length: 72 },
};

export function AnatomyPins() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const pins = new Map<string, HTMLElement>();
    for (const pin of container.querySelectorAll<HTMLElement>("[data-part]")) {
      pins.set(pin.dataset.part!, pin);
    }
    // Last values written, so an unchanged frame writes nothing.
    const last = new Map<string, { x: number; y: number; visible: number }>();

    return voyage.onFrame((readout) => {
      for (const anchor of readout.anchors) {
        const pin = pins.get(anchor.id);
        if (!pin) continue;
        const previous = last.get(anchor.id);
        const visible = Math.round(anchor.visible * 50) / 50;
        const x = Math.round(anchor.x * 2) / 2;
        const y = Math.round(anchor.y * 2) / 2;
        if (
          previous &&
          previous.visible === visible &&
          (visible === 0 || (previous.x === x && previous.y === y))
        ) {
          continue;
        }
        last.set(anchor.id, { x, y, visible });
        pin.style.opacity = String(visible);
        if (visible > 0) pin.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    });
  }, []);

  return (
    <div ref={ref} className="pins" aria-hidden="true">
      {ANATOMY.map((part, index) => {
        const lead = LEAD[part.part];
        const radians = (lead.angle * Math.PI) / 180;
        return (
          <span
            key={part.part}
            className="pin"
            data-part={part.part}
            style={
              {
                "--angle": `${lead.angle}deg`,
                "--len": lead.length,
                "--dx": (Math.cos(radians) * lead.length).toFixed(1),
                "--dy": (Math.sin(radians) * lead.length).toFixed(1),
              } as CSSProperties
            }
          >
            <span className="pin__lead" />
            <span className="pin__dot" />
            <span className="badge">{index + 1}</span>
          </span>
        );
      })}
    </div>
  );
}
