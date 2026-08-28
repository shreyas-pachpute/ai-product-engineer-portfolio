"use client";

import { useEffect, useState } from "react";
import { Text } from "@/components/primitives";
import { cn } from "@/lib/utils/cn";
import type { TocHeading } from "@/lib/content/toc";

type SectionNavProps = {
  headings: TocHeading[];
};

/**
 * Sticky table of contents for Signature case studies only — Build Log
 * entries are short enough that a TOC would be clutter, not navigation.
 * `IntersectionObserver` (not a scroll-percentage calculation) decides the
 * active section, since section lengths vary — the standard, most robust
 * approach for "which heading is currently in view." Desktop-only
 * (`lg:`): a sidebar TOC doesn't have room to exist well below that width,
 * and the reading-progress bar already gives narrower viewports a
 * position cue.
 */
export function SectionNav({ headings }: SectionNavProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Sections"
      className="sticky top-32 hidden self-start lg:block"
    >
      <Text
        size="caption"
        tone="tertiary"
        mono
        className="mb-4 tracking-[0.15em] uppercase"
      >
        On this page
      </Text>
      <ul className="border-border-subtle flex flex-col gap-1 border-l">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "text-caption ease-feedback -ml-px block border-l-2 py-1 pl-4 transition-colors duration-150",
                activeId === heading.id
                  ? "border-accent-primary text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary border-transparent",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
