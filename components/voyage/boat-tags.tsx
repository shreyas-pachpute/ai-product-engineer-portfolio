"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { MAX_EXTRA_BOATS } from "@/components/world/sea/limits";
import { ANATOMY, COPY, PRESSURES } from "@/lib/site";
import { voyage } from "@/lib/voyage";

/**
 * Leaning on the paper boats.
 *
 * "Then somebody leans on it." This is the somebody. Every paper boat on
 * the water can be pressed; a paper tag on a string unfolds from it,
 * listing six things a real product has to survive. Choose one and the
 * boat goes down the way a hull without that part would (the world does
 * that: components/world/sea/fates.ts). When it is past saving, a slip of
 * paper says what would have held, which is one of the six parts of the
 * ship in the next chapter.
 *
 * The boats are drawn in the 3D world, so what the pointer and the
 * keyboard meet here are invisible buttons, one per boat, that the world's
 * readout keeps positioned over them every frame. As with the anatomy
 * pins, those positions are written straight to the DOM; React only
 * re-renders when a tag opens or a boat is lost.
 */

const SLOTS = MAX_EXTRA_BOATS + 1;
/** The handles are this size before they are scaled to fit their boat. */
const HANDLE = 100;
/** How long the slip saying what would have held stays up, ms. */
const SLIP_MS = 6500;
/** The chapter coordinate at which "Then somebody leans on it." appears. */
const INVITED_FROM = 1.42;

const PART_NAME = Object.fromEntries(
  ANATOMY.map((part) => [part.part, part.name.toLowerCase()]),
);

function bits(mask: number): number {
  let count = 0;
  for (let m = mask; m; m >>= 1) count += m & 1;
  return count;
}

export function BoatTags() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const slipRef = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [found, setFound] = useState(0);
  const [told, setTold] = useState<{ serial: number; kind: number } | null>(
    null,
  );
  // What the per-frame code needs to see without re-subscribing.
  const openRef = useRef<number | null>(null);
  const pointedRef = useRef<number | null>(null);
  const focusedRef = useRef<number | null>(null);
  const snapRef = useRef(true);

  useEffect(() => {
    openRef.current = open;
    snapRef.current = true;
    if (open !== null) {
      // Into the menu, as a menu button does.
      tagRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]')
        ?.focus({ preventScroll: true });
    }
  }, [open]);

  /* The slip comes down by itself. */
  useEffect(() => {
    if (!told) return;
    const timer = setTimeout(() => setTold(null), SLIP_MS);
    return () => clearTimeout(timer);
  }, [told]);

  /* A press anywhere else puts the tag away (and is not a tap on the water). */
  useEffect(() => {
    if (open === null) return;
    function onPointerDown(event: PointerEvent): void {
      const target = event.target as Element | null;
      if (target?.closest(".boat-tag, .boat-handle")) return;
      voyage.hush();
      setOpen(null);
    }
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  /* Every frame: keep the handles, the tag, its string and the slip on
     their boats. */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handles = Array.from(
      container.querySelectorAll<HTMLButtonElement>(".boat-handle"),
    );
    const thread = container.querySelector<SVGPathElement>(".boat-thread path");
    const cue = container.querySelector<HTMLElement>(".boat-cue");
    const ring = container.querySelector<SVGElement>(".boat-ring");
    const shown = handles.map(() => false);
    const written = handles.map(() => "");
    const stacked = handles.map(() => -1);
    let tagX = 0;
    let tagY = 0;
    let tagWidth = 0;
    let tagHeight = 0;
    let serial = 0;
    let cueOn = false;
    let ringOn = false;
    let threadOn = false;
    let measuredSlip: HTMLElement | null = null;
    let slipWidth = 0;
    // Nothing is set under the header.
    let topLimit = 70;
    function measure(): void {
      topLimit =
        document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 70;
    }
    measure();
    window.addEventListener("resize", measure);

    const stop = voyage.onFrame((readout) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      for (let slot = 0; slot < handles.length; slot++) {
        const handle = handles[slot]!;
        const boat = readout.boats[slot];
        const here = boat !== undefined && boat.phase === 1;
        if (here !== shown[slot]) {
          shown[slot] = here;
          handle.hidden = !here;
          if (!here) {
            written[slot] = "";
            if (pointedRef.current === slot) pointedRef.current = null;
            if (focusedRef.current === slot) focusedRef.current = null;
          }
        }
        if (!here) continue;
        // A box round the boat, sail and all; never smaller than a fingertip.
        const w = Math.max(48, boat.size * 1.5);
        const h = Math.max(48, boat.y - boat.tipY + boat.size * 0.35);
        const left = Math.round((boat.x - w / 2) * 2) / 2;
        const top = Math.round((boat.tipY - h * 0.08) * 2) / 2;
        const transform = `translate3d(${left}px, ${top}px, 0) scale(${(w / HANDLE).toFixed(3)}, ${(h / HANDLE).toFixed(3)})`;
        if (transform !== written[slot]) {
          written[slot] = transform;
          handle.style.transform = transform;
        }
        // Lower on the screen is nearer the camera: that boat's button is on top.
        const depth = Math.round(boat.y / 4);
        if (depth !== stacked[slot]) {
          stacked[slot] = depth;
          handle.style.zIndex = String(depth);
        }
      }

      // A lost boat takes its tag with it.
      const current = openRef.current;
      if (current !== null && readout.boats[current]?.phase !== 1) {
        setOpen(null);
      }

      // The tag: above and to the right of the sail, on a string.
      const tag = tagRef.current;
      const tied = current !== null ? readout.boats[current] : undefined;
      if (tag && thread && tied && tied.phase === 1) {
        const fresh = snapRef.current;
        if (fresh) {
          // Measured once, when it opens: its size does not change after.
          tagWidth = tag.offsetWidth;
          tagHeight = tag.offsetHeight;
        }
        const wantX = Math.min(
          width - tagWidth - 10,
          Math.max(10, tied.tipX + 26),
        );
        const wantY = Math.min(
          height - tagHeight - 10,
          Math.max(topLimit + 6, tied.tipY - tagHeight - 22),
        );
        if (fresh) {
          snapRef.current = false;
          tagX = wantX;
          tagY = wantY;
        } else {
          // It trails the boat a little, as something on a string would.
          tagX += (wantX - tagX) * 0.16;
          tagY += (wantY - tagY) * 0.16;
        }
        tag.style.transform = `translate3d(${tagX.toFixed(1)}px, ${tagY.toFixed(1)}px, 0)`;
        // From the sail tip to the eyelet in the tag's bottom corner.
        const eyeX = tagX + 15;
        const eyeY = tagY + tagHeight - 13;
        const sag = 8 + Math.hypot(eyeX - tied.tipX, eyeY - tied.tipY) * 0.14;
        thread.setAttribute(
          "d",
          `M${tied.tipX.toFixed(1)} ${tied.tipY.toFixed(1)}Q${((tied.tipX + eyeX) / 2).toFixed(1)} ${((tied.tipY + eyeY) / 2 + sag).toFixed(1)} ${eyeX.toFixed(1)} ${eyeY.toFixed(1)}`,
        );
        if (!threadOn) {
          threadOn = true;
          thread.style.opacity = "1";
        }
      } else if (thread && threadOn) {
        threadOn = false;
        thread.style.opacity = "0";
      }

      // The small label that says a boat can be pressed: on whichever boat
      // the pointer or the keyboard is on, or, until the first boat has
      // been sunk, on the first boat once the page has made the invitation.
      const invited =
        readout.fleet.sunk === 0 && readout.chapter >= INVITED_FROM ? 0 : null;
      const cued =
        current !== null
          ? null
          : (pointedRef.current ?? focusedRef.current ?? invited);
      const cuedBoat = cued !== null ? readout.boats[cued] : undefined;
      if (cue) {
        const on = cuedBoat !== undefined && cuedBoat.phase === 1;
        if (on) {
          const x = Math.min(width - 150, Math.max(8, cuedBoat.tipX + 14));
          const y = Math.max(8, cuedBoat.tipY - 40);
          // Position first, then the tilt: a CSS `rotate` would swing it
          // round the corner of the screen instead.
          cue.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(-4deg)`;
        }
        if (on !== cueOn) {
          cueOn = on;
          if (on) cue.dataset.on = "";
          else delete cue.dataset.on;
        }
      }

      // The focus ring: drawn round the boat itself, at any size.
      const focused = focusedRef.current;
      const focusedBoat = focused !== null ? readout.boats[focused] : undefined;
      if (ring) {
        const on = focusedBoat !== undefined && focusedBoat.phase === 1;
        if (on) ring.style.transform = handles[focused!]!.style.transform;
        if (on !== ringOn) {
          ringOn = on;
          ring.style.opacity = on ? "1" : "0";
        }
      }

      // A boat has just been lost.
      if (readout.told.serial !== serial) {
        serial = readout.told.serial;
        setTold({ serial, kind: readout.told.kind });
        setFound(readout.fleet.found);
      }
      const slip = slipRef.current;
      if (slip) {
        if (slip !== measuredSlip) {
          measuredSlip = slip;
          slipWidth = slip.offsetWidth;
        }
        const x = Math.min(
          width - slipWidth - 10,
          Math.max(10, readout.told.x - slipWidth / 2),
        );
        const y = Math.min(
          height - 90,
          Math.max(topLimit + 6, readout.told.y - 76),
        );
        slip.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(1.3deg)`;
      }
    });

    return () => {
      stop();
      window.removeEventListener("resize", measure);
    };
  }, []);

  function choose(kind: number): void {
    const slot = openRef.current;
    setOpen(null);
    if (slot === null) return;
    voyage.lean(slot, kind);
    // The boat's own button is about to go; hand the keyboard somewhere useful.
    document
      .querySelector<HTMLElement>(".fold-control .flag")
      ?.focus({ preventScroll: true });
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>): void {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % items.length;
    else if (event.key === "ArrowUp")
      next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else if (event.key === "Escape" || event.key === "Tab") {
      const slot = openRef.current;
      setOpen(null);
      if (event.key === "Escape" && slot !== null) {
        event.preventDefault();
        containerRef.current
          ?.querySelector<HTMLElement>(`.boat-handle[data-slot="${slot}"]`)
          ?.focus({ preventScroll: true });
      }
      return;
    }
    if (next >= 0) {
      event.preventDefault();
      items[next]!.focus({ preventScroll: true });
    }
  }

  const count = bits(found);
  const lost = told ? PRESSURES[told.kind] : undefined;

  return (
    <div ref={containerRef} className="boats" data-no-fold="">
      {Array.from({ length: SLOTS }, (_, slot) => (
        <button
          key={slot}
          type="button"
          className="boat-handle"
          data-slot={slot}
          hidden
          aria-haspopup="menu"
          aria-expanded={open === slot}
          aria-label={`Paper boat ${slot + 1}. ${COPY.paper.lean}.`}
          onClick={() => setOpen((now) => (now === slot ? null : slot))}
          onPointerEnter={() => {
            pointedRef.current = slot;
          }}
          onPointerLeave={() => {
            if (pointedRef.current === slot) pointedRef.current = null;
          }}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible"))
              focusedRef.current = slot;
          }}
          onBlur={() => {
            if (focusedRef.current === slot) focusedRef.current = null;
          }}
        />
      ))}

      <svg
        className="boat-ring"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="98" height="98" rx="10" />
        <rect x="1" y="1" width="98" height="98" rx="10" />
      </svg>

      <span className="boat-cue label" aria-hidden="true">
        {COPY.paper.lean}
      </span>

      <svg className="boat-thread" aria-hidden="true">
        <path />
      </svg>

      {open !== null ? (
        <div className="boat-tag" ref={tagRef}>
          <div
            className="boat-tag__sheet"
            role="menu"
            aria-label={`${COPY.paper.lean}: what should this boat survive?`}
            onKeyDown={onMenuKey}
          >
            <p className="boat-tag__head label" role="presentation">
              <span>{COPY.paper.lean}</span>
              <span>{count} of 6 found</span>
            </p>
            {PRESSURES.map((pressure, kind) => (
              <button
                key={pressure.part}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="boat-tag__ask"
                data-found={found & (1 << kind) ? "" : undefined}
                onClick={() => choose(kind)}
              >
                {pressure.ask}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {told && lost ? (
        <p
          key={told.serial}
          ref={slipRef}
          className="boat-slip"
          aria-hidden="true"
        >
          <span className="display boat-slip__held">{lost.held}</span>
          <span className="label boat-slip__part">
            On a ship: the {PART_NAME[lost.part]}
          </span>
        </p>
      ) : null}

      <p className="sr-only" role="status">
        {told && lost
          ? `${lost.ask}: the boat sank. ${lost.held} On a ship, that is the ${PART_NAME[lost.part]}. ${count} of 6 ways found.`
          : ""}
      </p>
    </div>
  );
}
