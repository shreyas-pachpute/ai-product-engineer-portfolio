"use client";

import Link from "next/link";
import { useState } from "react";
import { m } from "framer-motion";
import { Button, GlassPanel } from "@/components/primitives";
import { Logo } from "@/components/nav/logo";
import { NavLink } from "@/components/nav/nav-link";
import { MobileNav } from "@/components/nav/mobile-nav";
import { NAV_CTA, NAV_ITEMS } from "@/components/nav/nav-items";
import { CommandTrigger } from "@/components/command/command-trigger";
import { useScrollDirection } from "@/lib/motion/use-scroll-direction";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { motionSpring } from "@/lib/motion/springs";

/**
 * Floating capsule shell. This is the one client boundary for the whole
 * nav system (scroll direction + active route both require it) — Footer
 * and everything else in the shell stays server-rendered.
 */
export function Navbar() {
  const { direction, scrolledPast } = useScrollDirection();
  const reducedMotion = useReducedMotion();
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

  // Never hide a nav that currently contains keyboard focus — a hidden
  // (translated off-canvas) element with a focused descendant is a real
  // keyboard-trap risk, not a theoretical one.
  const isHidden =
    !reducedMotion && scrolledPast && direction === "down" && !hasFocusWithin;

  return (
    <m.header
      animate={{ y: isHidden ? -96 : 0, opacity: isHidden ? 0 : 1 }}
      transition={motionSpring.gentle}
      onFocus={() => setHasFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHasFocusWithin(false);
        }
      }}
      className="fixed inset-x-0 top-6 z-[var(--z-nav)] flex justify-center px-4"
    >
      {/* `max-w-nav` directly, not the Container primitive: Container also
          adds its own horizontal gutter padding meant for page content,
          which would double up against this capsule's own tight px-3
          pill padding. Centering here comes from the parent's
          `justify-center`, not Container's `mx-auto`. */}
      <GlassPanel
        as="nav"
        aria-label="Primary"
        blur="nav"
        radius="full"
        // `shadow-lg` removed: the `glass-nav` utility now sets its own
        // box-shadow (rim light + depth — see globals.css). Both write the
        // same property, and which one won would have come down to the
        // order Tailwind happened to emit them, with the rim light — the
        // part that makes the capsule read as glass — as the likely
        // casualty. The utility owns the material; the call site no longer
        // second-guesses it.
        className="specular-border max-w-nav flex w-full items-center justify-between gap-2 px-3 py-2"
      >
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <CommandTrigger />
          <Button asChild variant="primary" size="sm">
            <Link href={NAV_CTA.href}>{NAV_CTA.label}</Link>
          </Button>
        </div>

        <MobileNav />
      </GlassPanel>
    </m.header>
  );
}
