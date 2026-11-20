import type { Story } from "@/lib/content";

/**
 * The passage, as a navigator would plot it: its shape, and the arithmetic
 * of dates. Built from lib/content.ts by ./build.ts (on the server); this
 * file imports no content, so the browser's bundle does not carry it twice.
 *
 * Plain data only, so it can be handed from the server to the client.
 */

export type When = number | "now" | null;

export type Leg = {
  /** Used in element ids: "log-commercient-sync". */
  id: string;
  title: string;
  company: string;
  start: string;
  end: string;
  place?: string;
  context: string;
  remarks: readonly string[];
  story?: Story;
};

export type Port = {
  /** As the dates are written in lib/content.ts: "Mar 2026", "Present". */
  label: string;
  when: When;
};

export type Harbour = {
  /** The town, from the institution's name: "Surat". */
  name: string;
  institution: string;
  award: string;
  years: string;
  note?: string;
};

export type Voyage = {
  harbour: Harbour | null;
  /** Oldest first. Leg i runs from port i to port i + 1. */
  legs: readonly Leg[];
  ports: readonly Port[];
};

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** "Mar 2026" → months since year 0; "Present" → "now"; else null. */
export function parseWhen(text: string): When {
  const t = text.trim();
  if (/^(present|now)$/i.test(t)) return "now";
  const match = /^([a-z]{3})[a-z]*\.?\s+(\d{4})$/i.exec(t);
  if (!match) return null;
  const month = MONTHS.indexOf(match[1]!.toLowerCase());
  return month < 0 ? null : Number(match[2]) * 12 + month;
}

/** This month, on the reader's clock. Only ever called in the browser. */
export function monthNow(): number {
  const date = new Date();
  return date.getFullYear() * 12 + date.getMonth();
}

/** Whole months from one date to another; null if either is unknown. */
export function monthsBetween(
  from: When,
  to: When,
  now: number | null,
): number | null {
  const a = from === "now" ? now : from;
  const b = to === "now" ? now : to;
  if (a === null || b === null) return null;
  return Math.max(0, b - a);
}

export function monthsText(months: number): string {
  return months === 1 ? "1 month" : `${months} months`;
}

/** What the dividers read between two ports (in either order). */
export type Reading = {
  lo: number;
  hi: number;
  from: string;
  to: string;
  months: number | null;
  /** Legs spanned, oldest first. */
  legs: readonly Leg[];
  fixes: number;
};

export function read(
  voyage: Voyage,
  a: number,
  b: number,
  now: number | null,
): Reading {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const legs = voyage.legs.slice(lo, hi);
  return {
    lo,
    hi,
    from: voyage.ports[lo]?.label ?? "",
    to: voyage.ports[hi]?.label ?? "",
    months:
      lo === hi
        ? 0
        : monthsBetween(
            voyage.ports[lo]?.when ?? null,
            voyage.ports[hi]?.when ?? null,
            now,
          ),
    legs,
    fixes: legs.reduce((sum, leg) => sum + leg.remarks.length, 0),
  };
}
