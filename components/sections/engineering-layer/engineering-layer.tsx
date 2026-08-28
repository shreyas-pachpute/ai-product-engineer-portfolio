import { Eyebrow, Heading, Section, Text } from "@/components/primitives";
import { LayerStack } from "./layer-stack";
import {
  ENGINEERING_EYEBROW,
  ENGINEERING_HEADING,
  ENGINEERING_SUBHEADING,
} from "./content";

/**
 * Server Component — LayerStack is the only client boundary (accordion state
 * + height animation).
 *
 * Laid out as a sticky editorial split: the heading holds position in the
 * left column while the layer stack scrolls past it on the right.
 *
 * The accordion itself was deliberately left alone. A scroll-pinned card
 * stack was the more fashionable option and would have looked impressive in
 * isolation, but this content is a reference list someone scans for the one
 * layer they care about — progressive disclosure they control beats a
 * sequence the page controls, and replacing a working accordion with
 * scroll-driven choreography would have traded real usability for motion.
 * The rhythm break comes from the layout around it instead, which costs the
 * reader nothing.
 *
 * The sticky column also does something the centered version could not: the
 * heading stays on screen while you read the layers, so the framing it
 * provides is available the whole way down instead of being scrolled away
 * at the first item.
 */
export function EngineeringLayer() {
  return (
    <Section spacing="lg" aria-labelledby="engineering-layer-heading">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          {/*
           * `top-32` clears the floating nav capsule, which sits at
           * `top-6` and is roughly 60px tall (see Navbar). Sticky only
           * from `lg` — below that the grid is a single column and a
           * sticky heading would just consume most of a phone screen.
           */}
          <div className="lg:sticky lg:top-32">
            <Eyebrow className="mb-3">{ENGINEERING_EYEBROW}</Eyebrow>
            <Heading
              id="engineering-layer-heading"
              as="h2"
              size="h1"
              className="mb-4"
            >
              {ENGINEERING_HEADING}
            </Heading>
            <Text size="lead" tone="secondary">
              {ENGINEERING_SUBHEADING}
            </Text>
          </div>
        </div>

        <div className="lg:col-span-7">
          <LayerStack />
        </div>
      </div>
    </Section>
  );
}
