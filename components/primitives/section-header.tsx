import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Heading, type HeadingSize } from "@/components/primitives/heading";
import { Text } from "@/components/primitives/text";

/**
 * Eyebrows render as a plain element with the `eyebrow` utility rather than
 * through the Text primitive, and that is deliberate.
 *
 * Text always emits `font-sans` and a `text-*` size class. The `eyebrow`
 * utility sets `font-family`, `font-size` and the rest itself, so layering
 * the two puts competing declarations in the same cascade layer, where the
 * winner is decided by the order Tailwind happens to emit them — not by the
 * order of the class names. `cn()` cannot arbitrate it either, since
 * tailwind-merge has no knowledge of a project-defined utility and will
 * keep both. Rather than depend on emit order, the conflict is removed.
 */
const eyebrowToneClass = {
  // The text-safe accent step: the base accent measures 4.06:1 on the page
  // canvas and fails AA as standalone text. See the note in globals.css.
  accent: "text-accent-primary-hover",
  tertiary: "text-text-tertiary",
  ember: "text-accent-ember",
} as const;

export type EyebrowTone = keyof typeof eyebrowToneClass;

/** The mono label that opens a section or titles a card. */
export function Eyebrow({
  children,
  tone = "accent",
  className,
}: {
  children: ReactNode;
  tone?: EyebrowTone;
  className?: string;
}) {
  return (
    <p className={cn("eyebrow", eyebrowToneClass[tone], className)}>
      {children}
    </p>
  );
}

/**
 * The eyebrow → heading → subheading block that opens almost every section
 * on this site.
 *
 * It existed already — spelled out by hand in fourteen separate files,
 * each one centered, each one identical:
 *
 *     <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
 *       <Text size="caption" tone="accent" mono className="mb-3 tracking-[0.2em] uppercase">
 *       <Heading as="h2" size="h1" className="mb-4">
 *       <Text size="lead" tone="secondary">
 *
 * That duplication was not just a maintenance cost. It was the single
 * biggest reason the homepage read as templated: five consecutive sections
 * opened with the same centered stack at the same width with the same
 * spacing, so the page had one rhythm and never varied it. Nothing could
 * stand out, because everything was introduced identically.
 *
 * Extracting it fixes the duplication. The `align` prop is what fixes the
 * monotony — alternating between the three variants down a page does more
 * for perceived design quality than any amount of decoration on the
 * sections themselves:
 *
 *   center  The original. Right for openers and for short, punchy
 *           statements. Should now appear once or twice per page, not five
 *           times.
 *   left    Ragged-right, constrained measure. Reads as editorial rather
 *           than as a landing page, and gives the eye a different entry
 *           point on the line.
 *   split   Heading left, supporting copy in a right-hand column. The
 *           strongest break in rhythm available, because it changes the
 *           section's underlying grid, not just its text alignment. Falls
 *           back to stacked below `md` where two columns cannot breathe.
 */

type SectionHeaderProps = {
  /** Mono label above the heading. Optional — not every section needs one, and a page where all of them have one is back to being uniform. */
  eyebrow?: string;
  heading: ReactNode;
  /** Supporting line under (or beside) the heading. */
  subheading?: ReactNode;
  align?: "center" | "left" | "split";
  /** Visual scale of the heading. Independent of `headingAs` — see the Heading primitive on why those are decoupled. */
  headingSize?: HeadingSize;
  /**
   * Semantic level. `h2` for a section inside a page; `h1` for a page's own
   * opening block, where this component is the page title rather than a
   * section heading. Only ever one `h1` per document.
   */
  headingAs?: "h1" | "h2";
  /** Color of the eyebrow. Accent by default; `ember` marks the one or two sections that should read as a different voice. */
  eyebrowTone?: EyebrowTone;
  /** Wired to the section's `aria-labelledby`. */
  id?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  heading,
  subheading,
  align = "center",
  headingSize = "h1",
  headingAs = "h2",
  eyebrowTone = "accent",
  id,
  className,
}: SectionHeaderProps) {
  const eyebrowNode = eyebrow ? (
    <Eyebrow tone={eyebrowTone} className="mb-3">
      {eyebrow}
    </Eyebrow>
  ) : null;

  if (align === "split") {
    return (
      <div
        className={cn(
          "mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end md:gap-10",
          className,
        )}
      >
        <div className="md:col-span-7">
          {eyebrowNode}
          <Heading id={id} as={headingAs} size={headingSize}>
            {heading}
          </Heading>
        </div>
        {subheading ? (
          // Bottom-aligned against the heading rather than top-aligned:
          // with a fluid heading the two columns have very different
          // heights, and aligning their baselines at the bottom is what
          // makes them read as one unit instead of two stacked blocks.
          <Text size="lead" tone="secondary" className="md:col-span-5 md:pb-1">
            {subheading}
          </Text>
        ) : null}
      </div>
    );
  }

  const isCentered = align === "center";

  /*
   * Display-scale headings get a wider measure. The scale now tops out
   * around 6.5rem rather than 3.75rem, and a 2xl (672px) column at that
   * size wraps a short heading into four or five lines — which reads as a
   * layout accident, not as emphasis. Widening the container is what lets
   * the larger scale actually be larger rather than just be taller.
   */
  const measure =
    headingSize === "display"
      ? isCentered
        ? "mx-auto max-w-3xl text-center"
        : "max-w-4xl"
      : isCentered
        ? "mx-auto max-w-2xl text-center"
        : "max-w-3xl";

  return (
    <div className={cn("mb-12 md:mb-16", measure, className)}>
      {eyebrowNode}
      <Heading id={id} as={headingAs} size={headingSize} className="mb-4">
        {heading}
      </Heading>
      {subheading ? (
        <Text size="lead" tone="secondary">
          {subheading}
        </Text>
      ) : null}
    </div>
  );
}
