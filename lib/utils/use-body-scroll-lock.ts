"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/providers/lenis-provider";

/**
 * Locks page scroll while `isLocked` — for the mobile nav overlay today,
 * any future modal/dialog next. Stops Lenis (if it's running) in addition
 * to the CSS overflow lock, since Lenis drives its own scroll loop
 * independent of the `overflow` property.
 */
export function useBodyScrollLock(isLocked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!isLocked) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [isLocked, lenis]);
}
