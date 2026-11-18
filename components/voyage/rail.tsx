"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { CHAPTERS, LAST_CHAPTER } from "@/lib/site";
import { voyage } from "@/lib/voyage";

/**
 * The route rail: where you are in the crossing, and a way to jump.
 *
 * Drawn as a mast with the five ports marked along it and a small sail
 * that rides up and down as the page scrolls. The sail's position is one
 * CSS variable (`--p`, 0–1) written on scroll; the current port is marked
 * with aria-current so it is announced, not just shown.
 */
export function Rail() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    const ports = Array.from(rail.querySelectorAll<HTMLElement>(".rail__port"));
    let current = -1;

    return voyage.onChapter((coordinate) => {
      rail.style.setProperty("--p", (coordinate / LAST_CHAPTER).toFixed(4));
      const index = Math.min(ports.length - 1, Math.floor(coordinate + 0.04));
      if (index === current) return;
      current = index;
      ports.forEach((port, i) => {
        if (i === index) port.setAttribute("aria-current", "step");
        else port.removeAttribute("aria-current");
      });
    });
  }, []);

  return (
    <nav ref={ref} className="rail" aria-label="Chapters">
      <span className="rail__line" />
      <span className="rail__sled">
        <span className="rail__sail" />
      </span>
      {CHAPTERS.map((entry, index) => (
        <a
          key={entry.id}
          className="rail__port"
          href={`#${entry.id}`}
          data-go={entry.target}
          aria-current={index === 0 ? "step" : undefined}
          style={{ "--at": entry.target / LAST_CHAPTER } as CSSProperties}
        >
          <span className="rail__name label">{entry.port}</span>
        </a>
      ))}
    </nav>
  );
}
