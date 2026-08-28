"use client";

import { m } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { motionSpring } from "@/lib/motion/springs";
import {
  PERSONA_OPTIONS,
  type Persona,
} from "@/components/sections/hero/content";

type PersonaToggleProps = {
  value: Persona;
  onChange: (value: Persona) => void;
};

/**
 * Deliberately not a generic on/off switch — this reuses the same
 * shared-`layoutId` pill mechanic as the nav's active-route indicator
 * (different `layoutId`, same visual language) so the one recurring
 * "selection" affordance on the site behaves identically everywhere it
 * appears. Neither option is pre-selected: `value === "neutral"` (Hero's
 * default) renders both as unselected rather than guessing which persona
 * the visitor is before they've said so.
 */
export function PersonaToggle({ value, onChange }: PersonaToggleProps) {
  return (
    <div
      role="group"
      aria-label="Tailor this page for"
      className="glass-panel inline-flex items-center gap-1 rounded-full p-1"
    >
      {PERSONA_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(isSelected ? "neutral" : option.value)}
            className={cn(
              "text-caption ease-feedback relative rounded-full px-4 py-2 font-medium tracking-wide uppercase transition-colors duration-150",
              isSelected
                ? "text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {isSelected && (
              <m.span
                layoutId="persona-toggle-pill"
                className="bg-accent-primary/15 absolute inset-0 -z-10 rounded-full"
                transition={motionSpring.snappy}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
