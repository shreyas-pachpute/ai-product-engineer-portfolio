import Link from "next/link";
import { Divider, Section, Text } from "@/components/primitives";
import { RevealOnScroll } from "@/components/motion";
import { ContactHero } from "./contact-hero";
import { ContactMethods } from "./contact-methods";
import { GuidanceSection } from "./guidance-section";
import { INCLUDE_SECTION, NEXT_SECTION } from "./content";

/**
 * The calmest page on the site, by design: no ambient background (same
 * restraint as Services), a narrower reading measure, more vertical
 * space between blocks than anywhere else, and motion limited to the
 * same gentle per-section fade already established — nothing new
 * invented for this page. It ends here on purpose; there's no further
 * CTA below the contact methods and guidance because the page has
 * already made its point by the time a visitor reaches it.
 */
export function ContactPage() {
  return (
    <Section spacing="lg">
      <div className="flex flex-col gap-20 md:gap-28">
        <RevealOnScroll>
          <ContactHero />
        </RevealOnScroll>

        <RevealOnScroll>
          <ContactMethods />
        </RevealOnScroll>

        <div className="mx-auto w-full max-w-2xl">
          <Divider />
        </div>

        <RevealOnScroll>
          <GuidanceSection
            label={INCLUDE_SECTION.label}
            heading={INCLUDE_SECTION.heading}
          >
            {INCLUDE_SECTION.paragraphs.map((paragraph) => (
              <Text key={paragraph} size="lead" tone="secondary">
                {paragraph}
              </Text>
            ))}
            <Text size="lead" tone="secondary">
              {INCLUDE_SECTION.fitNote}{" "}
              <Link
                href={INCLUDE_SECTION.fitLinkHref}
                className="text-accent-primary-hover decoration-accent-primary/30 ease-feedback hover:text-text-primary underline underline-offset-4 transition-colors duration-150"
              >
                {INCLUDE_SECTION.fitLinkLabel}
              </Link>
              .
            </Text>
          </GuidanceSection>
        </RevealOnScroll>

        <RevealOnScroll>
          <GuidanceSection
            label={NEXT_SECTION.label}
            heading={NEXT_SECTION.heading}
          >
            {NEXT_SECTION.paragraphs.map((paragraph) => (
              <Text key={paragraph} size="lead" tone="secondary">
                {paragraph}
              </Text>
            ))}
          </GuidanceSection>
        </RevealOnScroll>
      </div>
    </Section>
  );
}
