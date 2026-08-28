import { Eyebrow, Heading, Text } from "@/components/primitives";
import { CONTACT_HERO } from "./content";

/** No GradientSurface, same as Services — this page is meant to be even calmer, and the plainest opening is what reads as confident restraint. */
export function ContactHero() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Eyebrow className="mb-3">{CONTACT_HERO.eyebrow}</Eyebrow>
      <Heading as="h1" size="display" className="mb-6">
        {CONTACT_HERO.heading}
      </Heading>
      <Text size="lead" tone="secondary">
        {CONTACT_HERO.sub}
      </Text>
    </div>
  );
}
