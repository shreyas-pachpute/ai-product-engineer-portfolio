import { Divider, Section } from "@/components/primitives";
import { RevealOnScroll } from "@/components/motion";
import { ServicesHero } from "./services-hero";
import { FitSection } from "./fit-section";
import { ProseSection } from "./prose-section";
import { ClosingSection } from "./closing-section";
import {
  PROCESS_SECTION,
  STANDARDS_SECTION,
  EXPECTATIONS_SECTION,
  PRICING_SECTION,
} from "./content";

/**
 * A single narrow reading column throughout (max-w-2xl, same measure as
 * the Work case-study body) — no grids, no cards, no bento layout. Every
 * other page on this site uses the wider max-w-content measure for
 * multi-column sections; this is the first genuinely narrow, single-
 * column page, which is the point: it's meant to be read, not scanned.
 *
 * Each section reveals independently as it's scrolled to
 * (`RevealOnScroll`, not the card-grid `Reveal`/`RevealGroup` pair —
 * see that component's own comment for why a single page-wide group is
 * wrong for a page this long). No ambient background, no cursor effects,
 * no accordions. Restrained on purpose.
 */
export function ServicesPage() {
  return (
    <Section spacing="lg">
      <div className="flex flex-col gap-16 md:gap-24">
        <RevealOnScroll>
          <ServicesHero />
        </RevealOnScroll>

        <div className="mx-auto w-full max-w-2xl">
          <Divider />
        </div>

        <RevealOnScroll>
          <FitSection />
        </RevealOnScroll>

        <div className="mx-auto w-full max-w-2xl">
          <Divider />
        </div>

        <RevealOnScroll>
          <ProseSection {...PROCESS_SECTION} />
        </RevealOnScroll>

        <RevealOnScroll>
          <ProseSection {...STANDARDS_SECTION} />
        </RevealOnScroll>

        <div className="mx-auto w-full max-w-2xl">
          <Divider />
        </div>

        <RevealOnScroll>
          <ProseSection {...EXPECTATIONS_SECTION} />
        </RevealOnScroll>

        <RevealOnScroll>
          <ProseSection {...PRICING_SECTION} />
        </RevealOnScroll>

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
