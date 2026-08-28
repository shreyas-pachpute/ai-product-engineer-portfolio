"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Text } from "@/components/primitives";
import { cn } from "@/lib/utils/cn";
import { motionDuration, motionEasing } from "@/lib/motion/tokens";
import { LAYERS } from "./content";

/**
 * A stack, not a grid or a loop — the point is that these are layers of
 * one system, not independent facts. Click/tap to expand (not hover-only:
 * hover-gated content is unusable on touch and unreachable by keyboard,
 * and the brief's "hover should reveal understanding" is about the
 * interaction paying off, not about the specific input device). One layer
 * open at a time, first one open by default so the interaction — and the
 * strongest line in the section — is visible without anyone needing to
 * discover it.
 */
export function LayerStack() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-border-subtle border-border-subtle divide-y rounded-md border">
      {LAYERS.map((layer, index) => {
        const isOpen = openIndex === index;
        const panelId = `layer-panel-${index}`;
        const buttonId = `layer-trigger-${index}`;

        return (
          <div key={layer.number}>
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className={cn(
                "ease-feedback flex w-full items-center gap-5 px-5 py-5 text-left transition-colors duration-150 md:px-8 md:py-6",
                "hover:bg-surface-raised/60 focus-visible:outline-accent-primary focus-visible:outline-2 focus-visible:-outline-offset-2",
              )}
            >
              <span
                className={cn(
                  "text-caption ease-feedback font-mono tabular-nums transition-colors duration-150",
                  isOpen ? "text-accent-primary-hover" : "text-text-tertiary",
                )}
              >
                {layer.number}
              </span>

              <span className="flex-1">
                <Text
                  as="h3"
                  size="body"
                  tone="primary"
                  className="font-display text-h3 mb-1 block"
                >
                  {layer.title}
                </Text>
                <Text as="span" size="body" tone="secondary" className="block">
                  {layer.summary}
                </Text>
              </span>

              <m.svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="text-text-tertiary size-4 shrink-0"
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{
                  duration: motionDuration.feedback,
                  ease: motionEasing.feedback,
                }}
              >
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </m.svg>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: motionDuration.orientation,
                    ease: motionEasing.orientation,
                  }}
                  className="overflow-hidden"
                >
                  <Text
                    size="body"
                    tone="secondary"
                    className="px-5 pb-6 md:px-8 md:pb-8 md:pl-[4.75rem]"
                  >
                    {layer.detail}
                  </Text>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
