import {
  Card,
  Eyebrow,
  Grid,
  Heading,
  IconWrapper,
  Section,
  SectionHeader,
  Text,
} from "@/components/primitives";
import { Reveal, RevealGroup } from "@/components/motion";
import {
  CAPABILITIES,
  CAPABILITIES_EYEBROW,
  CAPABILITIES_HEADING,
  CAPABILITIES_SUBHEADING,
} from "./content";

/**
 * Server Component, same pattern as ProofBar: structure and content are
 * static HTML, `Reveal`/`RevealGroup` are the only client boundary. Cards
 * are deliberately not links — unlike the Proof Bar (which points at
 * evidence), this section is a taxonomy of breadth, and every card
 * pointing at the same generic /work destination would be a hollow
 * affordance rather than a real one. Hover here is tactile feedback, not
 * navigation.
 *
 * Laid out as a bento rather than the previous 3×2 grid of identical
 * cards. Six equal tiles tell the eye that all six are equally important,
 * which is both untrue and boring — a uniform grid has no focal point, so
 * the reader either scans all of it or none of it. Varying the widths
 * creates an order to read in.
 */

/**
 * Column spans on the 6-column large-screen grid, by position. Presentation,
 * so it lives here rather than in content.ts — the data has no opinion about
 * how wide a tile is.
 *
 * The pattern is 4/2, 2/4, 3/3: a wide-then-narrow row, its mirror, then a
 * balanced row to close. The mirroring matters — repeating 4/2 three times
 * would just be a different uniform grid, and the alternation is what keeps
 * the eye moving down the section instead of straight down one column.
 *
 * Spelled out as literal class names because Tailwind's scanner cannot see
 * an interpolated `lg:col-span-${n}` — the same constraint documented in the
 * Grid primitive.
 */
const BENTO_SPANS = [
  "lg:col-span-4",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-4",
  "lg:col-span-3",
  "lg:col-span-3",
] as const;

export function Capabilities() {
  return (
    <Section spacing="lg" aria-labelledby="capabilities-heading">
      <SectionHeader
        id="capabilities-heading"
        align="split"
        eyebrow={CAPABILITIES_EYEBROW}
        heading={CAPABILITIES_HEADING}
        subheading={CAPABILITIES_SUBHEADING}
      />

      <RevealGroup>
        <Grid cols={1} colsMd={2} colsLg={6} gap="md">
          {CAPABILITIES.map((capability, index) => {
            // The two widest tiles get the accent icon treatment, so the
            // emphasis the layout already implies is reinforced rather
            // than contradicted by the color.
            const isFeature = BENTO_SPANS[index] === "lg:col-span-4";

            return (
              <Reveal key={capability.label} className={BENTO_SPANS[index]}>
                <Card
                  variant="raised"
                  interactive
                  spotlight
                  className="group flex h-full flex-col"
                >
                  <IconWrapper
                    variant="tile"
                    tone={isFeature ? "accent" : "neutral"}
                    className="ease-feedback group-hover:text-accent-primary mb-5 transition-colors duration-150"
                  >
                    <capability.icon className="size-5" />
                  </IconWrapper>

                  <Eyebrow tone="tertiary" className="mb-3">
                    {capability.label}
                  </Eyebrow>

                  <Heading as="h3" size="h3" className="mb-2">
                    {capability.headline}
                  </Heading>

                  <Text size="body" tone="secondary" className="flex-1">
                    {capability.detail}
                  </Text>
                </Card>
              </Reveal>
            );
          })}
        </Grid>
      </RevealGroup>
    </Section>
  );
}
