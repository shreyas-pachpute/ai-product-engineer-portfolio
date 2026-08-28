"use client";

import { m } from "framer-motion";
import { STAGES } from "./content";
import { motionEasing } from "@/lib/motion/tokens";

/**
 * The section's signature visual: a system diagram that builds itself,
 * one node per stage, as `activeStage` advances — culminating in a closed
 * loop (a dashed return path from the last node back to the first) rather
 * than a linear pipeline. That shape is the argument: full lifecycle
 * ownership isn't "model → done," it's a loop that feeds back into
 * itself. No numbers, no chart — the geometry carries the meaning.
 *
 * Pure presentational component driven entirely by the `activeStage`
 * prop; all scroll-tracking logic lives in the parent (DesktopExperience).
 */

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 640;
const NODE_X = 176;
const TOP_MARGIN = 56;
const BOTTOM_MARGIN = 56;
const NODE_RADIUS = 10;

function nodeY(index: number) {
  const step = (VIEW_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN) / (STAGES.length - 1);
  return TOP_MARGIN + index * step;
}

const loopPath = `M ${NODE_X} ${nodeY(STAGES.length - 1)} C 36 ${nodeY(STAGES.length - 1) - 70}, 36 ${nodeY(0) + 70}, ${NODE_X} ${nodeY(0)}`;

type LifecycleDiagramProps = {
  activeStage: number;
};

export function LifecycleDiagram({ activeStage }: LifecycleDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="h-full w-full"
      aria-hidden="true"
    >
      {STAGES.slice(0, -1).map((stage, i) => {
        const revealed = activeStage >= i + 1;
        return (
          <m.line
            key={`edge-${stage.index}`}
            x1={NODE_X}
            y1={nodeY(i) + NODE_RADIUS + 4}
            x2={NODE_X}
            y2={nodeY(i + 1) - NODE_RADIUS - 4}
            className={
              revealed
                ? "stroke-accent-primary transition-colors duration-300"
                : "stroke-border-highlight transition-colors duration-300"
            }
            strokeWidth={1.5}
            initial={false}
            animate={{ pathLength: revealed ? 1 : 0 }}
            transition={{ duration: 0.6, ease: motionEasing.narrative }}
          />
        );
      })}

      <m.path
        d={loopPath}
        fill="none"
        className="stroke-accent-primary"
        strokeWidth={1.5}
        strokeDasharray="4 5"
        initial={false}
        animate={{
          pathLength: activeStage >= STAGES.length - 1 ? 1 : 0,
          opacity: activeStage >= STAGES.length - 1 ? 1 : 0,
        }}
        transition={{ duration: 0.9, ease: motionEasing.narrative }}
      />

      {STAGES.map((stage, i) => {
        const state =
          activeStage > i
            ? "settled"
            : activeStage === i
              ? "active"
              : "upcoming";

        return (
          <g key={stage.index} transform={`translate(${NODE_X}, ${nodeY(i)})`}>
            <m.circle
              r={NODE_RADIUS}
              initial={false}
              animate={{
                opacity: state === "upcoming" ? 0.3 : 1,
                scale: state === "active" ? 1.15 : 1,
              }}
              transition={{ duration: 0.5, ease: motionEasing.orientation }}
              className={
                state === "active"
                  ? "animate-pulse-glow fill-accent-primary stroke-accent-primary"
                  : state === "settled"
                    ? "fill-surface-base stroke-text-secondary"
                    : "fill-surface-base stroke-border-subtle"
              }
              strokeWidth={1.5}
            />
            <m.text
              x={24}
              y={5}
              initial={false}
              animate={{ opacity: state === "upcoming" ? 0.35 : 1 }}
              transition={{ duration: 0.4, ease: motionEasing.orientation }}
              className={
                "font-sans text-[13px] " +
                (state === "active"
                  ? "fill-text-primary"
                  : "fill-text-secondary")
              }
            >
              {stage.number} · {stage.title}
            </m.text>
          </g>
        );
      })}
    </svg>
  );
}
