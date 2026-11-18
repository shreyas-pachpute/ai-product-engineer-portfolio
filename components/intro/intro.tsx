"use client";

import { useEffect, useRef } from "react";
import { MARK } from "@/components/brand/logo";
import { INTRO_STORAGE_KEY } from "@/lib/intro";
import { IDENTITY } from "@/lib/site";
import { voyage } from "@/lib/voyage";

/**
 * The opening.
 *
 * The mark assembles standing on a horizon line: the wave runs in, the
 * mast goes up, the sail fills. The line runs out to the edges of the
 * screen, the page opens along it — so the logo's wave has become the
 * world's horizon — and the mark sails up into its place in the header.
 * About two and a half seconds, once per browser session.
 *
 * It is not a loading screen. Nothing waits on it: the page underneath is
 * already rendered and the 3D world is loading behind it the whole time.
 * And it never holds anyone: a click, a key, a touch or a turn of the
 * wheel skips straight to the hand-off.
 *
 * Whether it plays at all is decided before first paint by the script in
 * lib/intro.ts (never on a repeat visit, never under reduced motion), and
 * every visual step is CSS keyed to `data-intro` on <html> — see section 9
 * of app/globals.css. This component only keeps time and does the one
 * thing CSS cannot: fly the mark to wherever the header's mark is.
 */

/** When the drawing has finished and been held for a moment. */
const PLAY_MS = 2050;
const LIFT_MS = 980;
const LIFT_FAST_MS = 400;

export function Intro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = ref.current;
    const root = document.documentElement;
    if (!overlay || root.dataset.intro !== "play") return;

    let lifted = false;
    let autoTimer = 0;
    let doneTimer = 0;
    let holdTimer = 0;

    function lift(fast: boolean): void {
      if (lifted) return;
      lifted = true;
      window.clearTimeout(autoTimer);
      removeSkipListeners();
      try {
        sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      } catch {
        // Storage blocked: the intro will simply play again next time.
      }

      if (fast) root.dataset.introSkip = "";
      const duration = fast ? LIFT_FAST_MS : LIFT_MS;

      // Fly the mark from where it was drawn to the header's mark.
      const mark = overlay!.querySelector<HTMLElement>(".intro__mark");
      const target = document.querySelector<SVGElement>(".brand svg");
      if (mark && target) {
        const from = mark.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        mark.animate(
          [
            { transform: "none" },
            {
              transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})`,
            },
          ],
          {
            duration: duration * 0.82,
            delay: fast ? 0 : 120,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            fill: "forwards",
          },
        );
      }

      root.dataset.introPlayed = "";
      root.dataset.intro = "lift";
      doneTimer = window.setTimeout(() => {
        root.dataset.intro = "done";
        delete root.dataset.introSkip;
      }, duration);
      // The hero's entrance delay is only for this first arrival.
      holdTimer = window.setTimeout(() => {
        delete root.dataset.introPlayed;
      }, 4000);
    }

    const skip = () => lift(true);
    const skipEvents = [
      "wheel",
      "touchmove",
      "keydown",
      "pointerdown",
    ] as const;
    function removeSkipListeners(): void {
      for (const name of skipEvents) window.removeEventListener(name, skip);
    }
    for (const name of skipEvents) {
      window.addEventListener(name, skip, { passive: true });
    }

    // Open along the world's real horizon when it is already up.
    const horizon = voyage.horizon();
    if (horizon && horizon > 0)
      overlay.style.setProperty("--split", `${Math.round(horizon)}px`);

    // The drawing is CSS and starts at first paint; this effect starts
    // whenever React hydrates, which can be a second later on a slow
    // connection. Time the hand-off from the paint, not from here, so the
    // two never drift apart.
    const painted =
      performance.getEntriesByName("first-contentful-paint")[0]?.startTime ??
      performance.now();
    const elapsed = Math.max(0, performance.now() - painted);
    autoTimer = window.setTimeout(
      () => lift(false),
      Math.max(250, PLAY_MS - elapsed),
    );

    return () => {
      window.clearTimeout(autoTimer);
      window.clearTimeout(doneTimer);
      window.clearTimeout(holdTimer);
      removeSkipListeners();
      // Torn down mid-hand-off: finish it, so the page is never left
      // behind a half-open curtain. (If it had not started yet, the state
      // stays "play" and the next mount picks it up — which is also what
      // React's development double-mount relies on.)
      if (lifted) {
        root.dataset.intro = "done";
        delete root.dataset.introSkip;
        delete root.dataset.introPlayed;
      }
    };
  }, []);

  return (
    <div ref={ref} className="intro" role="presentation">
      <div className="intro__half intro__half--sky" />
      <div className="intro__half intro__half--sea" />
      <div className="intro__line" />
      {/*
       * The mark, as three stacked layers (one per shape) rather than one
       * SVG. Each layer is an HTML element, so its animation is a plain
       * transform that the browser's compositor runs on its own thread:
       * the drawing stays smooth even while the 3D world is starting up
       * on the main thread behind it.
       */}
      <div className="intro__mark" aria-hidden="true">
        <span className="intro__part intro__part--mast">
          <svg viewBox={MARK.viewBox}>
            <rect {...MARK.mast} fill="currentColor" />
          </svg>
        </span>
        <span className="intro__part intro__part--sail">
          <svg viewBox={MARK.viewBox}>
            <path d={MARK.sail} fill="var(--color-vermilion)" />
          </svg>
        </span>
        <span className="intro__part wipe intro__part--wave">
          <span>
            <svg viewBox={MARK.viewBox} fill="none">
              <path
                d={MARK.wave}
                stroke="currentColor"
                strokeWidth={MARK.waveWidth}
                strokeLinecap="round"
              />
            </svg>
          </span>
        </span>
      </div>
      <div className="intro__words" aria-hidden="true">
        <span className="wordmark intro__name wipe">
          <span>{IDENTITY.name}</span>
        </span>
        <span className="label intro__role">{IDENTITY.role}</span>
      </div>
      <button type="button" className="label intro__skip">
        Skip
      </button>
    </div>
  );
}
