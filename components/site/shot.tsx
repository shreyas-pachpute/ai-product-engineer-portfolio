"use client";

import { useEffect } from "react";
import { voyage } from "@/lib/voyage";

/**
 * Puts the world's camera where a page wants it. Renders nothing.
 *
 * The home page drives the world from its scroll position. Every other
 * page has one fixed view of the same sea, and this cuts to it — a cut,
 * not a flight, because it is a change of page. It also sets the two
 * attributes the header and the flat backdrop read their colours from.
 */
export function Shot({
  at,
  tone,
  scene,
}: {
  at: number;
  tone: "day" | "night";
  scene: "dawn" | "noon" | "paper" | "storm" | "sunrise";
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.tone = tone;
    root.dataset.scene = scene;
    delete root.dataset.port;
    voyage.setChapter(at, true);
  }, [at, tone, scene]);

  return null;
}
