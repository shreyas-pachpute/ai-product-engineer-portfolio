"use client";

import { useEffect } from "react";
import { voyage } from "@/lib/voyage";

/**
 * The scroll driver. Renders nothing.
 *
 * WHAT IT DOES
 * Scrolling is left entirely to the browser. This reads where the page has
 * scrolled to, converts it to the chapter coordinate (0–5, see lib/site.ts)
 * and does three small things with it:
 *
 *   1. publishes it, which is what moves the 3D world;
 *   2. switches "beats" on and off. A beat is any element with a
 *      `data-from` (and optionally `data-to`): it gets a `data-on`
 *      attribute while the coordinate is inside that range. All the text
 *      choreography is CSS reacting to that attribute — this file never
 *      animates anything;
 *   3. keeps three attributes on <html> current: `data-tone` (day or
 *      night, for the header's colour), `data-port` (which chapter the
 *      rail should mark) and `data-scene` (the backdrop behind the canvas).
 *
 * Links marked `data-go` travel to a chapter and take keyboard focus with
 * them, to that chapter's heading.
 *
 * It only writes to the DOM when a value actually changes, so a scroll
 * frame usually costs one subtraction and a loop of comparisons.
 *
 * KEYBOARD AND ASSISTIVE TECH
 * Chapter text stays in the document (and in the accessibility tree) the
 * whole time; a chapter that is not showing is only transparent. So when
 * focus lands inside one — by Tab, or a screen reader's cursor — the page
 * travels there, and the reader sees what they are focused on.
 */

/** The backdrop scenes of the three daytime chapters before the storm. */
const SCENES = ["dawn", "noon", "paper"] as const;

/**
 * The stretch of the crossing that is dark enough for light type. The ends
 * sit at the midpoints of the two palette blends in the world's timeline
 * (drawing board to storm, storm to sunrise).
 */
const NIGHT_FROM = 3.04;
const NIGHT_TO = 4.05;

type Beat = { element: HTMLElement; from: number; to: number; on: boolean };

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function VoyageDriver() {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]"),
    );
    if (sections.length === 0) return;
    const last = sections.length - 1;

    const beats: Beat[] = Array.from(
      document.querySelectorAll<HTMLElement>("[data-from]"),
    ).map((element) => ({
      element,
      from: Number(element.dataset.from),
      to: element.dataset.to ? Number(element.dataset.to) : Infinity,
      on: element.hasAttribute("data-on"),
    }));

    let tops: number[] = [];
    let heights: number[] = [];
    let maxScroll = 1;
    let frame = 0;
    let tone = root.dataset.tone ?? "";
    let port = -1;
    let scene = "";
    let first = true;
    // What had focus when the window lost it, and what this file focused
    // itself: two kinds of focus event that are not the reader moving.
    let heldAtBlur: Element | null = null;
    let placed: Element | null = null;

    function measure(): void {
      const y = window.scrollY;
      tops = sections.map((section) => section.getBoundingClientRect().top + y);
      heights = sections.map((section) => section.offsetHeight);
      maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
    }

    /** Scroll position → chapter coordinate. */
    function coordinateAt(y: number): number {
      let index = 0;
      for (let i = last; i > 0; i--) {
        if (y >= tops[i]!) {
          index = i;
          break;
        }
      }
      const top = tops[index]!;
      // The last chapter ends where the page does, so the coordinate
      // reaches its maximum exactly at the bottom of the scroll.
      const span = index === last ? maxScroll - top : heights[index]!;
      return index + clamp01((y - top) / Math.max(1, span));
    }

    /** Chapter coordinate → scroll position. */
    function positionOf(coordinate: number): number {
      const index = Math.min(last, Math.max(0, Math.floor(coordinate)));
      const top = tops[index]!;
      const span = index === last ? maxScroll - top : heights[index]!;
      return top + clamp01(coordinate - index) * span;
    }

    function apply(): void {
      frame = 0;
      const c = coordinateAt(window.scrollY);
      // Arriving from another page, the world is somewhere else entirely:
      // cut to the crossing rather than flying there through every scene.
      voyage.setChapter(c, first);
      first = false;

      for (const beat of beats) {
        const on = c >= beat.from && c < beat.to;
        if (on !== beat.on) {
          beat.on = on;
          beat.element.toggleAttribute("data-on", on);
        }
      }

      // Day or night flips where the sky behind the header is halfway
      // between the two: before that point dark type reads better, after
      // it light type does. (Measured, not guessed: flipping late left
      // cream type on an orange sky.)
      const night = c > NIGHT_FROM && c < NIGHT_TO;
      const nextTone = night ? "night" : "day";
      if (nextTone !== tone) {
        tone = nextTone;
        root.dataset.tone = nextTone;
      }

      // A chapter "starts" a little before its number: by then the world
      // is already most of the way into the next scene.
      const nextPort = Math.min(last, Math.floor(c + 0.04));
      if (nextPort !== port) {
        port = nextPort;
        root.dataset.port = String(nextPort);
      }

      // The flat backdrop changes scene in step with the tone, so the
      // header is never the wrong colour for what is behind it.
      const nextScene = night
        ? "storm"
        : c >= NIGHT_TO
          ? "sunrise"
          : (SCENES[Math.min(2, nextPort)] ?? "dawn");
      if (nextScene !== scene) {
        scene = nextScene;
        root.dataset.scene = nextScene;
      }
    }

    function schedule(): void {
      if (!frame) frame = requestAnimationFrame(apply);
    }

    function onResize(): void {
      measure();
      schedule();
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    voyage.setNavigator((target, instant = false) => {
      measure();
      window.scrollTo({
        top: positionOf(target),
        behavior: instant || reduced.matches ? "auto" : "smooth",
      });
    });

    /** Links marked `data-go="<coordinate>"` travel instead of jumping. */
    function onClick(event: MouseEvent): void {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const link = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-go]",
      );
      if (!link) return;
      event.preventDefault();
      voyage.go(Number(link.dataset.go));
      const hash = link.getAttribute("href");
      if (!hash?.startsWith("#")) return;
      history.replaceState(null, "", hash);
      // Take focus along to the chapter's heading, as a normal in-page
      // link would. Otherwise "Skip to contact" scrolls the page but
      // leaves a keyboard user ten Tab presses away from the contact.
      const heading = document.getElementById(hash.slice(1) + "-title");
      if (heading) {
        placed = heading;
        heading.focus({ preventScroll: true });
      }
    }

    /**
     * The hash changed without going through a link above: typed into the
     * address bar, or reached with Back or Forward. Two things need doing.
     * The browser stops at the chapter's top edge, before any of its text
     * has appeared, so land inside it instead. And the browser made that
     * history entry without telling the router: going Back to an entry the
     * router does not know changes the address but not the page. Marking
     * the entry makes the router reload it, which shows the right page.
     */
    function onHashChange(): void {
      const index = sections.findIndex(
        (section) => `#${section.id}` === window.location.hash,
      );
      if (index >= 0) {
        const target = Number(sections[index]!.dataset.target);
        if (Number.isFinite(target)) {
          measure();
          window.scrollTo({ top: positionOf(target) });
        }
      }
      if (!history.state) history.replaceState({}, "", window.location.href);
    }

    function onWindowBlur(): void {
      heldAtBlur = document.activeElement;
    }

    /** Focus moved into a chapter that is not showing: go there. */
    function onFocusIn(event: FocusEvent): void {
      const target = event.target as Element | null;
      // Coming back to the window re-announces whatever already had focus,
      // and a heading focused by a link above is already being travelled
      // to. Neither is the reader moving, so neither may move the page.
      // Without this, switching tabs and back threw the reader to the
      // chapter of whichever link they had last clicked.
      const stale =
        target !== null && (target === heldAtBlur || target === placed);
      heldAtBlur = null;
      placed = null;
      if (stale) return;
      const beat = target?.closest<HTMLElement>("[data-from]");
      if (!beat || beat.hasAttribute("data-on")) return;
      const panel = target?.closest<HTMLElement>(".panel") ?? beat;
      const from = Math.max(
        Number(beat.dataset.from),
        Number(panel.dataset.from),
      );
      voyage.go(Math.max(0, from + 0.06), true);
    }

    measure();

    // Arriving with a chapter in the URL: land inside it, not on its edge.
    const hashed = window.location.hash
      ? sections.findIndex(
          (section) => `#${section.id}` === window.location.hash,
        )
      : -1;
    if (hashed > 0) {
      const target = Number(sections[hashed]!.dataset.target);
      if (Number.isFinite(target)) window.scrollTo({ top: positionOf(target) });
    }

    apply();

    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("click", onClick);
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("hashchange", onHashChange);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("hashchange", onHashChange);
      voyage.setNavigator(null);
    };
  }, []);

  return null;
}
