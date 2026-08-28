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
  AGENT_PROJECTS,
  FEATURED_AGENTS_EYEBROW,
  FEATURED_AGENTS_HEADING,
  FEATURED_AGENTS_SUBHEADING,
} from "./content";

/**
 * Structurally identical to FeaturedWork (components/sections/featured-work)
 * — same alternating-row card shape, same Reveal/RevealGroup client
 * boundary — pointed at /agents/[slug] instead of /work/[slug]. Sits
 * immediately before FeaturedWork on the homepage: both are "proof"
 * sections, live/testable agents leading, narrative case studies following.
 */
export function FeaturedAgents() {
  return (
    <Section spacing="lg" aria-labelledby="featured-agents-heading">
      <SectionHeader
        id="featured-agents-heading"
        align="left"
        eyebrow={FEATURED_AGENTS_EYEBROW}
        heading={FEATURED_AGENTS_HEADING}
        subheading={FEATURED_AGENTS_SUBHEADING}
      />

      <RevealGroup>
        <div className="flex flex-col gap-6">
          {AGENT_PROJECTS.map((project, index) => {
            const isReversed = index % 2 === 1;

            return (
              <Reveal key={project.slug}>
                <Card
                  as={Link}
                  href={`/agents/${project.slug}`}
                  variant="raised"
                  padding="none"
                  specular
                  spotlight
                  className="group grid items-stretch lg:grid-cols-12"
                >
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
                      Meet the agent
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
