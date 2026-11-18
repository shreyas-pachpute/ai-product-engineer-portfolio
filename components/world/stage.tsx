"use client";

import { useEffect, useRef } from "react";
import { Mark } from "@/components/brand/logo";
import { voyage } from "@/lib/voyage";
import type { World, WorldQuality } from "./engine";

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

function pickQuality(): WorldQuality {
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
  const phone = Math.min(window.screen.width, window.screen.height) < 700;
  return cores <= 4 || memory <= 4 || phone ? "low" : "high";
}

export function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let world: World | null = null;
    let cancelled = false;

    function sync(): void {
      if (!world) return;
      world.setStill(reduced.matches);
      world.setRunning(!reduced.matches && !document.hidden);
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
      if (target?.closest("a, button, input, textarea, select, [data-no-fold]"))
        return;
      voyage.fold(event.clientX, event.clientY);
    }

    async function start(): Promise<void> {
      const { createWorld } = await import("./engine");
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
    canvas.addEventListener("webglcontextlost", onContextLost);
    window.addEventListener("click", onClick);

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("click", onClick);
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
        <Mark className="backdrop__boat" />
      </div>
      <canvas ref={canvasRef} className="world" />
    </div>
  );
}
