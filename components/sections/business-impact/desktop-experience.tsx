"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Eyebrow, Heading, Text } from "@/components/primitives";
import { cn } from "@/lib/utils/cn";
import { motionDuration, motionEasing } from "@/lib/motion/tokens";
import { LifecycleDiagram } from "./lifecycle-diagram";
import { StageVisual } from "./stage-visual";
import { STAGES } from "./content";

const VH_PER_STAGE = 100;

/**
 * `position: sticky` does the pinning — no scroll-jacking, native scroll
 * physics untouched, keyboard/Page-Down/touch scrolling all behave
 * normally.
 *
 * Stage progress is read via a plain native `scroll` listener + manual
 * `getBoundingClientRect()` math (replicating what Framer Motion's
 * `useScroll({ target, offset: ["start start", "end end"] })` computes),
 * not Framer's own hook — Framer's target-based scroll tracking reads stale
 * position data against Lenis's rAF-driven scroll here, so `activeStage`
 * silently never advanced past 0 no matter how far the page scrolled. The
 * navbar's hide-on-scroll (`useScrollDirection`) already uses this exact
 * plain-listener pattern against the same Lenis setup and works correctly,
 * which is why the fix is "stop going through Framer" rather than trying to
 * force the two libraries into sync.
 *
 * `setActiveStage` only fires when the computed integer actually changes,
 * not on every scroll pixel.
 *
 * `aria-hidden`: this entire experience is a visual, scroll-position-gated
 * presentation of content that's given to assistive tech in full, in
 * normal reading order, via the sr-only list in business-impact.tsx —
 * duplicating it here would mean AT users hitting six fragments of
 * scroll-dependent text in an order that has nothing to do with how they
 * navigate.
 */
export function DesktopExperience() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    function updateActiveStage() {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      // Same range `offset: ["start start", "end end"]` describes: 0 when
      // the wrapper's top edge reaches the viewport top, 1 when its bottom
      // edge reaches the viewport bottom. `scrollableDistance <= 0` guards
      // both a not-yet-measured (zero-height) wrapper and a viewport taller
      // than the wrapper, either of which would otherwise divide by ~0 and
      // produce NaN/Infinity — which would index STAGES out of bounds.
      const scrollableDistance = rect.height - window.innerHeight;
      if (scrollableDistance <= 0) return;

      const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
      const next = Math.min(
        STAGES.length - 1,
        Math.max(0, Math.floor(progress * STAGES.length)),
      );
      setActiveStage((current) => (current === next ? current : next));
    }

    updateActiveStage();
    window.addEventListener("scroll", updateActiveStage, { passive: true });
    window.addEventListener("resize", updateActiveStage);
    return () => {
      window.removeEventListener("scroll", updateActiveStage);
      window.removeEventListener("resize", updateActiveStage);
    };
  }, []);

  const stage = STAGES[activeStage] ?? STAGES[0]!;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="relative hidden md:block"
      style={{ height: `${STAGES.length * VH_PER_STAGE}vh` }}
    >
      <div className="sticky top-32 flex h-[calc(100dvh-10rem)] max-h-[760px] items-center">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-12 lg:gap-20">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              {STAGES.map((s) => (
                <span
                  key={s.index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    s.index <= activeStage
                      ? "bg-accent-primary"
                      : "bg-border-subtle",
                  )}
                />
              ))}
            </div>

            {/* `initial={false}` — same as Hero's persona swap, and load-bearing
                here rather than cosmetic: without it the first stage mounts at
                its `initial` state (opacity 0) and depends on a mount animation
                to ever become visible, which left the entire left column blank
                at the section's resting position. Key changes still crossfade
                normally; only the very first render skips the fade, which is
                the correct behavior for content that should simply be present. */}
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={stage.index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: motionDuration.orientation,
                  ease: motionEasing.orientation,
                }}
              >
                <StageVisual
                  stageIndex={stage.index}
                  isActive
                  className="mb-7"
                />
                <Eyebrow className="mb-3">
                  {stage.number} — {stage.title}
                </Eyebrow>
                <Heading as="h3" size="h1" className="mb-4">
                  {stage.headline}
                </Heading>
                <Text size="lead" tone="secondary">
                  {stage.detail}
                </Text>
              </m.div>
            </AnimatePresence>
          </div>

          <div className="h-[calc(100dvh-10rem)] max-h-[760px]">
            <LifecycleDiagram activeStage={activeStage} />
          </div>
        </div>
      </div>
    </div>
  );
}
