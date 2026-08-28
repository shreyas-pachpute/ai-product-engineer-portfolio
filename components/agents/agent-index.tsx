import Link from "next/link";
import type { ComponentType } from "react";
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
import { workIconRegistry } from "@/components/work/icon-registry";
import { DataInvestigationVisual } from "@/components/agents/data-investigation-visual";
import { ResourcePlannerVisual } from "@/components/agents/resource-planner-visual";
import { cn } from "@/lib/utils/cn";
import type { AgentEntry } from "@/lib/content/agents";

type AgentIndexProps = {
  entries: AgentEntry[];
};

const agentVisualRegistry: Record<string, ComponentType> = {
  "ai-data-investigation": DataInvestigationVisual,
  "ai-resource-planner": ResourcePlannerVisual,
};

/**
 * Deliberately modeled on FeaturedWork's full-width alternating-card
 * layout, not WorkIndexRow's catalog-row list — this isn't "a list of
 * writing" (the register WorkIndexRow's own comment says catalog rows are
 * right for), it's a small, curated showcase of live systems, the same
 * kind of content FeaturedWork already handles well.
 */
export function AgentIndex({ entries }: AgentIndexProps) {
  return (
    <Section spacing="lg">
      <SectionHeader
        align="left"
        headingAs="h1"
        headingSize="display"
        eyebrow="AI Agents"
        heading={<>Agents you can put to work.</>}
        subheading={
          <>
            Live, testable systems — the architecture, the guardrails, and
            what&rsquo;s actually verified, not just claimed.
          </>
        }
        className="mb-16 md:mb-20"
      />

      <RevealGroup>
        <div className="flex flex-col gap-6">
          {entries.map((entry, index) => {
            const isReversed = index % 2 === 1;
            const Icon = workIconRegistry[entry.icon];
            const Visual = agentVisualRegistry[entry.slug];

            return (
              <Reveal key={entry.slug}>
                <Card
                  as={Link}
                  href={`/agents/${entry.slug}`}
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
                      {Visual && <Visual />}
                    </div>
                  </div>

                  <div className="flex flex-col p-6 md:p-8 lg:col-span-5">
                    <div className="mb-6 flex items-center justify-between">
                      <IconWrapper variant="tile" tone="accent">
                        <Icon className="size-5" />
                      </IconWrapper>
                      <Badge tone="neutral" size="sm">
                        {entry.category}
                      </Badge>
                    </div>

                    <Heading as="h3" size="h2" className="mb-5">
                      {entry.title}
                    </Heading>

                    <div className="mb-5">
                      <Eyebrow tone="tertiary" className="mb-1">
                        The Challenge
                      </Eyebrow>
                      <Text size="body" tone="secondary">
                        {entry.problem}
                      </Text>
                    </div>

                    <ul className="mb-5 flex flex-col gap-2">
                      {entry.highlights.slice(0, 3).map((highlight) => (
                        <li key={highlight} className="flex gap-2.5">
                          <span
                            aria-hidden="true"
                            className="bg-accent-primary mt-2 size-1 shrink-0 rounded-full"
                          />
                          <Text size="caption" tone="secondary">
                            {highlight}
                          </Text>
                        </li>
                      ))}
                    </ul>

                    <span className="text-caption text-accent-primary-hover ease-feedback mt-auto inline-flex items-center gap-1 font-medium transition-transform duration-150 group-hover:translate-x-0.5">
                      View the agent
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
