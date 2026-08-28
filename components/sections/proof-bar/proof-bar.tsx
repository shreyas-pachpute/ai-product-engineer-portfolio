import Link from "next/link";
import {
  ArrowUpRightIcon,
  Badge,
  Card,
  GradientSurface,
  Heading,
  Section,
  SectionHeader,
  Text,
  Grid,
} from "@/components/primitives";
import { Reveal, RevealGroup } from "@/components/motion";
import { PROOF_EYEBROW, PROOF_HEADING, STANDARDS } from "./content";

/**
 * Server Component — the only client-side piece is the `Reveal`/
 * `RevealGroup` wrapper each card sits inside, imported as a thin motion
 * boundary rather than making this whole section client-rendered.
 */
export function ProofBar() {
  return (
    <Section spacing="md" aria-labelledby="proof-bar-heading">
      {/* A quiet echo of Hero's glow, not a repeat of it — eases the
          transition from Hero's rich lighting into Capabilities' calmer,
          fully-static surface instead of cutting hard between them. */}
      <GradientSurface
        tone="accent"
        intensity="subtle"
        className="opacity-40"
      />

      {/* Centered, and the only centered opener left on the homepage. It
          directly follows the hero — which is centered by nature — so
          keeping the rhythm for one more beat reads as continuity, and
          every section after this one breaks it. */}
      <SectionHeader
        id="proof-bar-heading"
        align="center"
        eyebrow={PROOF_EYEBROW}
        heading={PROOF_HEADING}
      />

      <RevealGroup>
        <Grid cols={1} colsMd={2} colsLg={4} gap="md">
          {STANDARDS.map((standard) => (
            <Reveal key={standard.label}>
              <Card
                as={Link}
                href={standard.href}
                variant="raised"
                specular
                spotlight
                interactive
                className="group hover:shadow-glow flex h-full flex-col"
              >
                <Badge tone="accent" size="sm" className="mb-5 self-start">
                  {standard.label}
                </Badge>
                <Heading as="h3" size="h3" className="mb-2">
                  {standard.statement}
                </Heading>
                <Text size="body" tone="secondary" className="flex-1">
                  {standard.detail}
                </Text>
                <span className="text-caption text-accent-primary-hover ease-feedback mt-5 inline-flex items-center gap-1 font-medium transition-transform duration-150 group-hover:translate-x-0.5">
                  See this applied
                  <ArrowUpRightIcon className="size-3.5" />
                </span>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </RevealGroup>
    </Section>
  );
}
