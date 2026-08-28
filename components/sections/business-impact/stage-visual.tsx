"use client";

import { m } from "framer-motion";
import { motionEasing } from "@/lib/motion/tokens";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils/cn";

type StageVisualProps = {
  stageIndex: number;
  isActive: boolean;
  className?: string;
};

/**
 * The desktop experience's one addition beyond text: a small animated mark
 * per stage that acts out its concept rather than illustrating it literally
 * — scattered nodes resolving into order for Problem, a grid drawing itself
 * for Architecture, a rising value curve for Economics, a monitor pulse for
 * Reliability, an ascending ship-out for Deployment, a closing loop for
 * Iteration. Same stroke/node grammar as `stage-icons.tsx` (the mobile
 * version) and the main lifecycle diagram, just larger and genuinely
 * animated — one coherent visual system, not six unrelated graphics.
 *
 * Decorative only (`aria-hidden`) — the real content is the headline/detail
 * text next to it, same as the main diagram below. `isActive` gates the
 * animation so each mark plays/loops only while its own stage is current,
 * rather than six pieces animating simultaneously off-screen.
 */
export function StageVisual({
  stageIndex,
  isActive,
  className,
}: StageVisualProps) {
  const reducedMotion = useReducedMotion();
  const loop = isActive && !reducedMotion;
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("text-accent-primary size-24", className)}
      aria-hidden="true"
    >
      {stageIndex === 0 && (
        <>
          {[
            { restX: 10, scatterX: 6, scatterY: 14 },
            { restX: 24, scatterX: 30, scatterY: 46 },
            { restX: 38, scatterX: 46, scatterY: 10 },
            { restX: 52, scatterX: 20, scatterY: 40 },
          ].map((node, i) => (
            <m.circle
              key={i}
              r={3}
              {...stroke}
              initial={false}
              animate={
                isActive
                  ? { cx: node.restX, cy: 32 }
                  : { cx: node.scatterX, cy: node.scatterY }
              }
              transition={{
                duration: 0.9,
                delay: isActive ? i * 0.08 : 0,
                ease: motionEasing.orientation,
              }}
            />
          ))}
          <m.line
            x1={10}
            y1={32}
            x2={52}
            y2={32}
            {...stroke}
            initial={false}
            animate={{
              pathLength: isActive ? 1 : 0,
              opacity: isActive ? 1 : 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: motionEasing.narrative,
            }}
          />
        </>
      )}

      {stageIndex === 1 && (
        <>
          {["M14 14H50V50H14V14Z", "M14 32H50", "M32 14V50"].map((d, i) => (
            <m.path
              key={d}
              d={d}
              {...stroke}
              initial={false}
              animate={{
                pathLength: isActive ? 1 : 0,
                opacity: isActive ? 1 : 0.15,
              }}
              transition={{
                duration: 0.7,
                delay: isActive ? i * 0.18 : 0,
                ease: motionEasing.narrative,
              }}
            />
          ))}
          <m.circle
            cx={32}
            cy={32}
            r={2.4}
            fill="currentColor"
            stroke="none"
            initial={false}
            animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.5 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          />
        </>
      )}

      {stageIndex === 2 && (
        <>
          {[
            { x: 14, h: 14 },
            { x: 26, h: 22 },
            { x: 38, h: 30 },
            { x: 50, h: 38 },
          ].map((bar, i) => (
            <m.line
              key={bar.x}
              x1={bar.x}
              x2={bar.x}
              y1={50}
              {...stroke}
              initial={false}
              animate={{ y2: isActive ? 50 - bar.h : 50 }}
              transition={{
                duration: 0.6,
                delay: isActive ? i * 0.1 : 0,
                ease: motionEasing.orientation,
              }}
            />
          ))}
        </>
      )}

      {stageIndex === 3 && (
        <>
          <circle cx={32} cy={32} r={19} {...stroke} opacity={0.3} />
          <m.path
            d="M12 32H22L27 20L34 44L39 32H52"
            {...stroke}
            initial={false}
            animate={
              isActive
                ? { pathLength: [0, 1], opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{
              duration: 1.4,
              ease: motionEasing.narrative,
              repeat: loop ? Infinity : 0,
              repeatDelay: 0.6,
            }}
          />
        </>
      )}

      {stageIndex === 4 && (
        <>
          <m.line
            x1={32}
            y1={50}
            x2={32}
            y2={16}
            {...stroke}
            initial={false}
            animate={{ pathLength: isActive ? 1 : 0 }}
            transition={{ duration: 0.5, ease: motionEasing.narrative }}
          />
          <m.path
            d="M22 26L32 14L42 26"
            {...stroke}
            initial={false}
            animate={
              isActive
                ? { opacity: [0, 1, 1, 0], y: [6, 0, 0, -6] }
                : { opacity: 0 }
            }
            transition={{
              duration: 1.6,
              times: [0, 0.25, 0.7, 1],
              ease: motionEasing.orientation,
              repeat: loop ? Infinity : 0,
            }}
          />
          <line x1={16} y1={50} x2={48} y2={50} {...stroke} />
        </>
      )}

      {stageIndex === 5 && (
        <>
          <m.path
            d="M14 32C14 22.06 22.06 14 32 14C38.5 14 44.2 17.4 47.4 22.5"
            {...stroke}
            initial={false}
            animate={{
              pathLength: isActive ? [0, 1] : 0,
              opacity: isActive ? 1 : 0.25,
            }}
            transition={{
              duration: 1.2,
              ease: motionEasing.narrative,
              repeat: loop ? Infinity : 0,
              repeatType: "loop",
            }}
          />
          <path d="M47.4 15V22.5H39.9" {...stroke} opacity={0.6} />
          <m.path
            d="M50 32C50 41.94 41.94 50 32 50C25.5 50 19.8 46.6 16.6 41.5"
            {...stroke}
            initial={false}
            animate={{
              pathLength: isActive ? [0, 1] : 0,
              opacity: isActive ? 1 : 0.25,
            }}
            transition={{
              duration: 1.2,
              delay: 0.15,
              ease: motionEasing.narrative,
              repeat: loop ? Infinity : 0,
              repeatType: "loop",
            }}
          />
          <path d="M16.6 49V41.5H24.1" {...stroke} opacity={0.6} />
        </>
      )}
    </svg>
  );
}
