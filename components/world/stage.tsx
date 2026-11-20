"use client";

import { useEffect, useRef } from "react";
import { SailboatGlyph } from "@/components/brand/logo";
import { voyage } from "@/lib/voyage";
import type { World, WorldQuality } from "./sea";

/**
 * The stage: a fixed, full-viewport canvas behind the page, and the
 * backdrop that stands in for it.
 *
 * LOADING
 * The 3D engine (and three.js with it) is not in the page's JavaScript. It
 * is fetched after the page is already readable, with a dynamic import.
 * Until it arrives — and for good, on a device with no WebGL2 — the
 * backdrop shows the same sky and sea as flat colour, so there is never a
 * blank or a spinner: the page simply gains depth when the world is ready.
 *
 * <html data-world> tracks it: unset while loading, "ready" once the
 * first frame is on screen (the canvas fades in), "fallback" if there will
 * be no canvas (the backdrop adds a drawn boat).
 *
 * RESTRAINT
 * The render loop stops when the tab is hidden. Under reduced motion it
 * never starts: the world draws one still frame each time the scroll
 * position changes, so it still tells the story without moving on its own.
 */

/**
 * A first guess at what this device can run. It only has to be roughly
 * right: the world measures its own frame pacing and steps down by itself
 * if the guess was optimistic (see the governor in sea/index.ts).
 */
function pickQuality(): WorldQuality {
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
  const phone = Math.min(window.screen.width, window.screen.height) < 700;
  if (phone || cores <= 4 || memory <= 4) return "low";
  return cores >= 8 ? "high" : "medium";
}

export function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Screens too small for the stage get a plain document (globals.css).
    const plain = window.matchMedia("(max-height: 17.5rem)");
    let world: World | null = null;
    let cancelled = false;
    let stopBoat: (() => void) | null = null;

    function sync(): void {
      if (!world) return;
      world.setStill(reduced.matches);
      world.setRunning(!reduced.matches && !plain.matches && !document.hidden);
    }

    function resize(): void {
      world?.setSize(canvas!.clientWidth, canvas!.clientHeight);
    }

    function fallBack(): void {
      voyage.attachWorld(null);
      world?.dispose();
      world = null;
      root.dataset.world = "fallback";
    }

    function onContextLost(event: Event): void {
      event.preventDefault();
      fallBack();
    }

    /** A click on open water folds a paper boat (chapter two). */
    function onClick(event: MouseEvent): void {
      const target = event.target as Element | null;
      // Controls, text (which can be selected) and a boat's tag are not
      // the water.
      if (
        target?.closest(
          "a, button, input, h1, h2, p, li, header, nav, [data-no-fold]",
        )
      ) {
        return;
      }
      if (window.getSelection()?.toString()) return;
      voyage.fold(event.clientX, event.clientY);
    }

    async function start(): Promise<void> {
      const { createWorld } = await import("./sea");
      if (cancelled) return;
      const created = await createWorld(canvas!, pickQuality());
      if (cancelled) {
        created?.dispose();
        return;
      }
      if (!created) {
        root.dataset.world = "fallback";
        return;
      }
      world = created;
      resize();
      // Shaders compile in the background; nothing is drawn until they are
      // all ready, so no chapter ever pauses to compile one mid-scroll.
      await created.warm();
      if (cancelled || world !== created) return;
      voyage.attachWorld(created);
      sync();
      // While the opening plays, say where the paper boat is on screen, so
      // the sheet can fold into a boat that lands exactly on it.
      stopBoat = voyage.onFrame((readout) => {
        const intro = root.dataset.intro;
        if (intro !== "play" && intro !== "lift") {
          stopBoat?.();
          stopBoat = null;
          return;
        }
        const boat = readout.boats[0];
        if (!boat || boat.size <= 0) return;
        root.dataset.boat = `${Math.round(boat.tipX)},${Math.round(boat.tipY)},${Math.round(boat.size)}`;
      });
      // Two frames: one to render, one for the browser to present it.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled && world === created) root.dataset.world = "ready";
        }),
      );
    }

    start().catch(() => {
      if (!cancelled) root.dataset.world = "fallback";
    });

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    plain.addEventListener("change", sync);
    canvas.addEventListener("webglcontextlost", onContextLost);
    window.addEventListener("click", onClick);

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      plain.removeEventListener("change", sync);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("click", onClick);
      stopBoat?.();
      voyage.attachWorld(null);
      world?.dispose();
      world = null;
      delete root.dataset.world;
    };
  }, []);

  return (
    <div className="stage" aria-hidden="true">
      <div className="backdrop">
        <span className="backdrop__sun" />
        <SailboatGlyph className="backdrop__boat" />
      </div>
      <canvas ref={canvasRef} className="world" />
    </div>
  );
}
