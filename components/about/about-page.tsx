import { Divider, Section } from "@/components/primitives";
import { RevealOnScroll } from "@/components/motion";
import { AboutHero } from "./about-hero";
import { IntroSection } from "./intro-section";
import { BeliefSection } from "./belief-section";
import { ClosingSection } from "./closing-section";
import { BELIEFS } from "./content";

/**
 * One continuous reading column (max-w-2xl, same measure as Services/
 * Contact/Work), and — unlike those pages — no dividers between the five
 * beliefs themselves. Services used rules to separate genuinely distinct
 * topics; these five are meant to read as one train of thought, so only
 * the intro gets a rule to mark where the essay's framing ends and the
 * actual content begins. Motion is the same restrained per-section fade
 * used everywhere else — nothing new invented for this page either.
 */
export function AboutPage() {
  return (
    <Section spacing="lg">
      <div className="flex flex-col gap-16 md:gap-20">
        <RevealOnScroll>
          <AboutHero />
        </RevealOnScroll>

        <RevealOnScroll>
          <IntroSection />
        </RevealOnScroll>

        <div className="mx-auto w-full max-w-2xl">
          <Divider />
        </div>

        {BELIEFS.map((belief) => (
          <RevealOnScroll key={belief.was}>
            <BeliefSection belief={belief} />
          </RevealOnScroll>
        ))}

        <div className="mx-auto w-full max-w-2xl">
          <Divider />
        </div>

        <RevealOnScroll>
          <ClosingSection />
        </RevealOnScroll>
      </div>
    </Section>
  );
}
