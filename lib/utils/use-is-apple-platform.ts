"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the visitor is on an Apple platform — used only to label a
 * keyboard shortcut (⌘ vs Ctrl). Same `useSyncExternalStore` shape as
 * `useReducedMotion`, for the same reason: reading a browser-only value
 * during render without a setState-in-effect cascade, and with an explicit
 * server snapshot so SSR and the first client render agree.
 *
 * `subscribe` is intentionally a no-op returning an empty cleanup — the
 * platform cannot change during a session, so there is nothing to listen
 * to. The hook exists for the render-safety, not for reactivity.
 */

function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  return /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** The server can't know the visitor's OS; `null` renders a platform-neutral label until the client corrects it. */
function getServerSnapshot(): boolean | null {
  return null;
}

export function useIsApplePlatform(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
