import Link from "next/link";
import {
  ArrowUpRightIcon,
  Badge,
  Card,
  Eyebrow,
  Heading,
  IconWrapper,
  Section,
  SectionHeader,
  Text,
} from "@/components/primitives";
import { Reveal, RevealGroup } from "@/components/motion";
import { cn } from "@/lib/utils/cn";
import {
  FEATURED_WORK_EYEBROW,
  FEATURED_WORK_HEADING,
  FEATURED_WORK_SUBHEADING,
  PROJECTS,
} from "./content";

/**
 * Server Component, same shape as ProofBar: static structure, Reveal/
 * RevealGroup is the only client boundary. Every card links to its real
 * content/work/<slug>.mdx case study via /work/[slug].
 *
 * Restructured from three equal columns into three full-width alternating
 * rows. The old layout was fighting its own content: each project carries a
 * problem, an approach, a value statement AND a "hard part" note, and
 * pouring all four into a one-third-width column left every card a dense
 * block of small text with a 176px-tall visual squeezed on top. The section
 * meant to sell the work was the least readable one on the page.
 *
 * A wide row fixes both halves at once — the mockup gets enough space to
 * actually be legible as a product, and the copy gets a comfortable measure
 * instead of a narrow gutter. Alternating the side the visual sits on keeps
 * three consecutive rows from becoming its own kind of monotony.
 */
export function FeaturedWork() {
  return (
    <Section spacing="lg" aria-labelledby="featured-work-heading">
      <SectionHeader
        id="featured-work-heading"
        align="left"
        eyebrow={FEATURED_WORK_EYEBROW}
        heading={FEATURED_WORK_HEADING}
        subheading={FEATURED_WORK_SUBHEADING}
      />

      <RevealGroup>
        <div className="flex flex-col gap-6">
          {PROJECTS.map((project, index) => {
            // Odd rows put the visual on the right. Below `lg` the grid
            // collapses to one column and the order class stops applying,
            // so every row falls back to visual-then-copy — which is the
            // right reading order on a phone regardless of parity.
            const isReversed = index % 2 === 1;

            return (
              <Reveal key={project.slug}>
                <Card
                  as={Link}
                  href={`/work/${project.slug}`}
                  variant="raised"
                  padding="none"
                  specular
                  spotlight
                  className="group grid items-stretch lg:grid-cols-12"
                >
                  {/* Visual pane. Sits on its own darker ground with real
                      padding so the mockup reads as a product shot rather
                      than as a banner cropped to the card's top edge. */}
                  <div
                    className={cn(
                      "bg-surface-base/50 flex items-center p-6 md:p-8 lg:col-span-7",
                      isReversed && "lg:order-2",
                    )}
                  >
                    <div className="border-border-subtle ease-orientation w-full overflow-hidden rounded-md border shadow-md transition-transform duration-500 group-hover:scale-[1.015]">
                      <project.visual />
                    </div>
                  </div>

                  <div className="flex flex-col p-6 md:p-8 lg:col-span-5">
                    <div className="mb-6 flex items-center justify-between">
                      <IconWrapper variant="tile" tone="accent">
                        <project.icon className="size-5" />
                      </IconWrapper>
                      <Badge tone="neutral" size="sm">
                        {project.category}
                      </Badge>
                    </div>

                    {/* `h2` scale on an `h3` element: the row is now the
                        dominant unit on the page and a card-sized title
                        would undersell it. The document outline still
                        nests correctly under the section heading. */}
                    <Heading as="h3" size="h2" className="mb-5">
                      {project.title}
                    </Heading>

                    <div className="mb-5 flex flex-col gap-4">
                      <div>
                        <Eyebrow tone="tertiary" className="mb-1">
                          Problem
                        </Eyebrow>
                        <Text size="body" tone="secondary">
                          {project.problem}
                        </Text>
                      </div>
                      <div>
                        <Eyebrow tone="tertiary" className="mb-1">
                          Approach
                        </Eyebrow>
                        <Text size="body" tone="secondary">
                          {project.approach}
                        </Text>
                      </div>
                    </div>

                    <Text size="body" tone="primary" className="mb-5">
                      {project.value}
                    </Text>

                    <div className="border-border-subtle ease-feedback group-hover:border-accent-primary mt-auto border-l-2 pl-3 transition-colors duration-150">
                      <Eyebrow tone="tertiary" className="mb-1">
                        The Hard Part
                      </Eyebrow>
                      <Text size="caption" tone="secondary">
                        {project.hardPart}
                      </Text>
                    </div>

                    <span className="text-caption text-accent-primary-hover ease-feedback mt-6 inline-flex items-center gap-1 font-medium transition-transform duration-150 group-hover:translate-x-0.5">
                      Read the case study
                      <ArrowUpRightIcon className="size-3.5" />
                    </span>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </RevealGroup>
    </Section>
  );
}
