"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, m, type Variants } from "framer-motion";
import { Button, Container, StatusPill } from "@/components/primitives";
import { HeroBackground } from "@/components/sections/hero/hero-background";
import { HeroPipeline } from "@/components/sections/hero/hero-pipeline";
import { KineticHeadline } from "@/components/sections/hero/kinetic-headline";
import { PersonaToggle } from "@/components/sections/hero/persona-toggle";
import {
  HERO_CTA,
  HERO_HEADLINE,
  HERO_STATUS,
  HERO_SUPPORTING,
  type Persona,
} from "@/components/sections/hero/content";
import { motionDuration, motionEasing } from "@/lib/motion/tokens";

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

/** Entrance-only: opacity + y + a soft blur-to-sharp settle. Used once on load, not for the persona-swap interactions below (those use a plain crossfade — see `swapTransition`). */
const revealBlur: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: motionDuration.narrative,
      ease: motionEasing.narrative,
    },
  },
};

const swapTransition = {
  duration: motionDuration.orientation,
  ease: motionEasing.orientation,
};

export function Hero() {
  const [persona, setPersona] = useState<Persona>("neutral");
  const cta = HERO_CTA[persona];

  return (
    // `-mt-32` cancels the shell's default `pt-32` (app/layout.tsx) so the
    // background bleeds behind the floating nav instead of starting below
    // it; the `pt-40`/`pt-48` below restores — and increases — the actual
    // content's clearance. Only Hero needs this; every other page keeps
    // the shell default.
    //
    // The cursor spotlight used to be local to this section (pointer
    // handlers here, a matching div in HeroBackground) — it's now the
    // sitewide `CursorSpotlight`/`CursorGlowController` pair in the root
    // layout, so Hero no longer needs its own pointer tracking.
    <section className="relative -mt-32 flex min-h-[90dvh] items-center overflow-hidden pt-40 pb-24 md:pt-48 md:pb-32">
      {/* `scroll-drift` moves the light field DOWN while the content above
          moves up — the opposing directions are the parallax. See the
          utility's note in globals.css.

          Vertical headroom (`-inset-y-24`) rather than a flush `inset-0`:
          the drift translates this layer down by up to 4rem, and a
          flush-fitted layer would pull its own top edge into view and
          leave a band of bare canvas above the light field. The section
          clips the overflow, so the extra height costs nothing. */}
      <div className="scroll-drift absolute inset-x-0 -inset-y-24">
        <HeroBackground />
      </div>

      <Container size="content">
        {/*
         * A plain wrapper carrying the scroll-driven exit, deliberately
         * separate from the `m.div` below. CSS animations outrank inline
         * styles in the cascade, so applying `scroll-exit` to the element
         * Framer Motion is already animating would let it override the
         * entrance — the headline would never play its reveal.
         */}
        <div className="scroll-exit">
          <m.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center"
          >
            <m.div variants={revealBlur}>
              {/* Call site 1 of 3 for `aurora-border` sitewide. The
                  availability pill is the right place for the site's one
                  piece of continuously-moving chrome: it is the only
                  element on the page making a claim that is literally
                  time-sensitive. */}
              <StatusPill tone="success" className="aurora-border">
                {HERO_STATUS}
              </StatusPill>
            </m.div>

            <h1 className="flex flex-col gap-4">
              <m.span
                variants={revealBlur}
                className="text-body-lead text-text-secondary md:text-h2 font-sans"
              >
                {HERO_HEADLINE.lead}
              </m.span>
              {/* The payoff is the one line on the site that gets the
                  variable-axis treatment. Everything else reveals; this
                  one settles. */}
              <KineticHeadline
                text={HERO_HEADLINE.payoff}
                className="font-display text-display text-text-primary text-balance"
              />
            </h1>

            <div
              aria-live="polite"
              className="flex min-h-24 max-w-prose items-center justify-center md:min-h-16"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.p
                  key={persona}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={swapTransition}
                  className="text-body-lead text-text-secondary"
                >
                  {HERO_SUPPORTING[persona]}
                </m.p>
              </AnimatePresence>
            </div>

            <m.div variants={revealBlur}>
              <PersonaToggle value={persona} onChange={setPersona} />
            </m.div>

            <m.div variants={revealBlur} className="w-full">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={persona}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={swapTransition}
                  className="flex flex-col items-center justify-center gap-3 sm:flex-row"
                >
                  <Button asChild variant="primary" size="lg">
                    <Link href={cta.primary.href}>{cta.primary.label}</Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <Link href={cta.secondary.href}>{cta.secondary.label}</Link>
                  </Button>
                </m.div>
              </AnimatePresence>
            </m.div>

            <m.div variants={revealBlur} className="mt-6 w-full">
              <HeroPipeline />
            </m.div>
          </m.div>
        </div>
      </Container>
    </section>
  );
}
