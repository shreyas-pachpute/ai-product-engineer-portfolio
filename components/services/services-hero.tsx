import { Eyebrow, Heading, Text } from "@/components/primitives";
import { SERVICES_HERO } from "./content";

/**
 * No GradientSurface, no ambient glow — every other page on this site
 * opens with some amount of visual richness; this one deliberately
 * doesn't. "Calmer than the homepage" is a real constraint, not just
 * smaller copy, and the plainest possible opening is what actually reads
 * as confident restraint instead of a quieter version of the same
 * spectacle.
 */
export function ServicesHero() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Eyebrow className="mb-3">{SERVICES_HERO.eyebrow}</Eyebrow>
      <Heading as="h1" size="display" className="mb-6">
        {SERVICES_HERO.heading}
      </Heading>
      <Text size="lead" tone="secondary">
        {SERVICES_HERO.sub}
      </Text>
    </div>
  );
}
