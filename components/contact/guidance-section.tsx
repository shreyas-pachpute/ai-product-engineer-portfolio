import type { ReactNode } from "react";
import { Eyebrow, Heading } from "@/components/primitives";

type GuidanceSectionProps = {
  label: string;
  heading: string;
  children: ReactNode;
};

/**
 * Deliberately not imported from components/services/prose-section —
 * that component takes a plain `string[]`, and this page's "what's
 * useful to include" section needs an inline link to /services mid-
 * paragraph. Rather than change ProseSection's contract (touching the
 * Services page's own component) or fork it, Contact gets its own small
 * version that accepts children directly. A few duplicated lines here
 * are cheaper than coupling two independently-evolving pages together.
 */
export function GuidanceSection({
  label,
  heading,
  children,
}: GuidanceSectionProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Eyebrow className="mb-3">{label}</Eyebrow>
      <Heading as="h2" size="h1" className="mb-6">
        {heading}
      </Heading>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
