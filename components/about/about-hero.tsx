import { Eyebrow, Heading, Text } from "@/components/primitives";
import { ABOUT_HERO } from "./content";

/**
 * No GradientSurface — same restraint as Services and Contact.
 *
 * Stays centered. About/Services/Contact were deliberately built as the
 * calm pages of the site, and centered opening blocks are part of that
 * decision rather than an accident of copy-paste — so the rhythm-breaking
 * that the homepage and index pages got does not apply here. The measure
 * widened to `3xl` only because the display scale itself grew; at `2xl` a
 * heading at the new size wraps badly.
 */
export function AboutHero() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Eyebrow className="mb-3">{ABOUT_HERO.eyebrow}</Eyebrow>
      <Heading as="h1" size="display" className="mb-6">
        {ABOUT_HERO.heading}
      </Heading>
      <Text size="lead" tone="secondary">
        {ABOUT_HERO.sub}
      </Text>
    </div>
  );
}
