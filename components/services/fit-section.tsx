import { Eyebrow, Heading, Text } from "@/components/primitives";
import { FIT_SECTION } from "./content";

/**
 * Two stacked lists, not a side-by-side comparison table — the brief was
 * explicit about avoiding the feature-matrix pattern, and stacking them
 * (rather than placing them as competing columns) is what actually keeps
 * this reading as two honest statements instead of a "good vs. bad"
 * scorecard. No red/green semantic coloring for the same reason — this
 * isn't a pass/fail check, it's a filter someone applies to themselves.
 */
export function FitSection() {
  return (
    <div className="mx-auto max-w-2xl">
      <Eyebrow className="mb-3">{FIT_SECTION.label}</Eyebrow>
      <Heading as="h2" size="h1" className="mb-8">
        {FIT_SECTION.heading}
      </Heading>

      <div className="flex flex-col gap-10">
        <div>
          <Text size="body" tone="primary" className="mb-4 font-medium">
            {FIT_SECTION.reachOutHeading}
          </Text>
          <ul className="flex flex-col gap-3">
            {FIT_SECTION.reachOut.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="bg-accent-primary mt-2.5 size-1.5 shrink-0 rounded-full"
                />
                <Text size="lead" tone="secondary">
                  {item}
                </Text>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Text size="body" tone="primary" className="mb-4 font-medium">
            {FIT_SECTION.notFitHeading}
          </Text>
          <ul className="flex flex-col gap-3">
            {FIT_SECTION.notFit.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="bg-text-tertiary mt-2.5 size-1.5 shrink-0 rounded-full"
                />
                <Text size="lead" tone="secondary">
                  {item}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
