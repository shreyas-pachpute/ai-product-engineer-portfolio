"use client";

import { useSyncExternalStore } from "react";
import { monthNow, monthsBetween, monthsText, parseWhen } from "./voyage";

const never = () => () => {};

/**
 * This month on the reader's clock, or null while the server renders (it
 * cannot know when the page will be read, and a static page is rendered
 * once, long before). The client fills it in right after hydration.
 */
export function useMonthNow(): number | null {
  return useSyncExternalStore(never, monthNow, () => null);
}

/** "26 months", from two dates as written; nothing until it can be known. */
export function Months({ from, to }: { from: string; to: string }) {
  const now = useMonthNow();
  const months = monthsBetween(parseWhen(from), parseWhen(to), now);
  if (months === null) return null;
  return <span className="rk-months">{monthsText(months)}</span>;
}
