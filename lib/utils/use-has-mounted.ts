"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * True only once the client has mounted — for gating SSR-unsafe APIs
 * (`document`, portals) until after hydration. Built on
 * `useSyncExternalStore` rather than `useState` + `useEffect` so mounting
 * doesn't trigger the setState-in-effect render cascade that pattern
 * produces; there's nothing to actually subscribe to here, mount status
 * never changes after it flips once, so `subscribe` is a no-op.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
