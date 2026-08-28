import {
  GradientSurface,
  Section,
  SectionHeader,
} from "@/components/primitives";
import { DesktopExperience } from "./desktop-experience";
import { MobileExperience } from "./mobile-experience";
import {
  BUSINESS_IMPACT_EYEBROW,
  BUSINESS_IMPACT_HEADING,
  BUSINESS_IMPACT_SUBHEADING,
  STAGES,
} from "./content";

/**
 * Server Component. The only client boundaries below are DesktopExperience
 * (scroll-linked diagram) and the Reveal/RevealGroup pair inside
 * MobileExperience — everything else, including this file, is static HTML.
 */
export function BusinessImpact() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="business-impact-heading"
      className="relative"
    >
      <GradientSurface
        tone="neutral"
        intensity="subtle"
        className="opacity-50"
      />

      {/* `relative` keeps the header above the GradientSurface, which is
          absolutely positioned behind it. The larger bottom margin is
          this section's own — the scroll-linked diagram below needs more
          clearance before it starts than a grid of cards does. */}
      <SectionHeader
        id="business-impact-heading"
        align="split"
        eyebrow={BUSINESS_IMPACT_EYEBROW}
        heading={BUSINESS_IMPACT_HEADING}
        subheading={BUSINESS_IMPACT_SUBHEADING}
        className="relative mb-16 md:mb-24"
      />

      {/* Complete, linear-order content for assistive tech — compensates
          for DesktopExperience gating its text behind scroll position.
          Plain paragraphs, not headings, so it doesn't produce six
          duplicate entries in a screen reader's heading-navigation list
          alongside MobileExperience's real ones. */}
      <ol className="sr-only">
        {STAGES.map((stage) => (
          <li key={stage.index}>
            <p>
              <strong>
                {stage.number} — {stage.title}: {stage.headline}
              </strong>{" "}
              {stage.detail}
            </p>
          </li>
        ))}
      </ol>

      <DesktopExperience />
      <MobileExperience />
    </Section>
  );
}
