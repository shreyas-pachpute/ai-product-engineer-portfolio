"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Button } from "@/components/primitives";
import { NAV_CTA, NAV_ITEMS } from "@/components/nav/nav-items";
import { useBodyScrollLock } from "@/lib/utils/use-body-scroll-lock";
import { useEscapeKey } from "@/lib/utils/use-escape-key";
import { useFocusTrap } from "@/lib/utils/use-focus-trap";
import { useHasMounted } from "@/lib/utils/use-has-mounted";
import { motionDuration, motionEasing } from "@/lib/motion/tokens";

const TRIGGER_ID = "mobile-nav-trigger";
const PANEL_ID = "mobile-nav-panel";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  // Portal target (`document.body`) only exists client-side.
  const isMounted = useHasMounted();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation. Adjusted during render (React's documented
  // pattern for "reset state when a prop changes") rather than in a
  // useEffect, which would cost an extra commit and trip the
  // set-state-in-effect lint rule for no benefit here.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  useFocusTrap(panelRef, isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen);
  useBodyScrollLock(isOpen);

  return (
    <div className="flex md:hidden">
      <button
        id={TRIGGER_ID}
        type="button"
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        onClick={() => setIsOpen((open) => !open)}
        className="text-text-primary ease-feedback hover:bg-surface-raised/60 focus-visible:outline-accent-primary relative flex size-10 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
        <span
          aria-hidden="true"
          className="relative flex h-3.5 w-5 flex-col justify-between"
        >
          <m.span
            className="h-px w-full origin-center bg-current"
            animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6.5 : 0 }}
            transition={{
              duration: motionDuration.feedback,
              ease: motionEasing.feedback,
            }}
          />
          <m.span
            className="h-px w-full bg-current"
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{
              duration: motionDuration.feedback,
              ease: motionEasing.feedback,
            }}
          />
          <m.span
            className="h-px w-full origin-center bg-current"
            animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6.5 : 0 }}
            transition={{
              duration: motionDuration.feedback,
              ease: motionEasing.feedback,
            }}
          />
        </span>
      </button>

      {/*
       * Portaled to document.body rather than rendered in place: the
       * Navbar's animated ancestor (`<m.header>`) carries an inline
       * `transform` at all times once Framer Motion is driving it, which
       * per spec makes it the containing block for any `position: fixed`
       * descendant. Left in place, this fullscreen panel would be
       * positioned relative to the small nav capsule instead of the
       * viewport. Portaling out to `body` sidesteps that entirely.
       */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <m.div
                id={PANEL_ID}
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                className="glass-mobile-nav fixed inset-4 top-24 z-[var(--z-overlay)] flex flex-col rounded-lg p-6"
                initial={{ opacity: 0, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{
                  duration: motionDuration.narrative,
                  ease: motionEasing.narrative,
                }}
              >
                <nav
                  aria-label="Mobile"
                  className="flex flex-1 flex-col justify-center gap-1"
                >
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="font-display text-h2 text-text-primary ease-feedback hover:bg-surface-raised/60 rounded-md px-4 py-3 transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <Button asChild variant="primary" size="lg" className="w-full">
                  <Link href={NAV_CTA.href}>{NAV_CTA.label}</Link>
                </Button>
              </m.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
