import { Card, Heading, IconWrapper, Text } from "@/components/primitives";
import { Reveal, RevealGroup } from "@/components/motion";
import { STAGES } from "./content";

/**
 * The sticky-diagram interaction is a desktop-caliber affordance — on
 * narrow viewports it becomes a plain, complete stacked list instead of a
 * compressed version of the same mechanic. Same content, same component
 * family as ProofBar/Capabilities (Card + Reveal/RevealGroup), so this
 * stays a Server Component apart from that one motion boundary.
 */
export function MobileExperience() {
  return (
    <div className="md:hidden">
      <RevealGroup>
        <div className="flex flex-col gap-4">
          {STAGES.map((stage) => (
            <Reveal key={stage.index}>
              <Card variant="raised" specular className="flex gap-4">
                <IconWrapper
                  variant="tile"
                  tone="accent"
                  size="md"
                  className="shrink-0"
                >
                  <stage.icon className="size-5" />
                </IconWrapper>
                <div>
                  <Text
                    size="caption"
                    tone="accent"
                    mono
                    className="mb-1 tracking-[0.15em] uppercase"
                  >
                    {stage.number} — {stage.title}
                  </Text>
                  <Heading as="h3" size="h3" className="mb-2">
                    {stage.headline}
                  </Heading>
                  <Text size="body" tone="secondary">
                    {stage.detail}
                  </Text>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </RevealGroup>
    </div>
  );
}
