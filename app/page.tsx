import type { Metadata } from "next";
import {
  BusinessImpact,
  Capabilities,
  EngineeringLayer,
  FeaturedAgents,
  FeaturedWork,
  Hero,
  ProofBar,
} from "@/components/sections";
import { Statement } from "@/components/primitives";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site-config";

// `title: { absolute: ... }` bypasses the root layout's title template
// (`%s | Shreyas Pachpute`) specifically for the homepage — templating
// SITE_NAME here would render as "Shreyas Pachpute — AI Product Engineer
// | Shreyas Pachpute" in the browser tab, which is the one page where the
// full site name should stand alone.
export const metadata: Metadata = {
  ...buildMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: SITE_NAME },
};

// Homepage ends after the Featured Work preview for now — Testimonials,
// Services, About, Contact, and the real Work/case-study pages arrive in
// later phases.
export default function Home() {
  return (
    <>
      <Hero />
      <ProofBar />
      <Capabilities />

      {/*
       * The page's one register change, placed here on purpose.
       *
       * Everything above it is scannable and card-shaped: a hero, a row of
       * proof cards, a bento of capabilities. Everything below it —
       * Business Impact, the Engineering Layer, the case studies — asks for
       * actual reading. Dropping a single full-width line between the two
       * gives the reader somewhere to stop, and marks the transition from
       * "what he does" to "how it works" without needing a heading to
       * announce it.
       *
       * One per page. The effect is entirely dependent on being the only
       * element that behaves this way; a second one makes both of them
       * ordinary. See the Statement primitive.
       */}
      <Statement eyebrow="The through-line">
        Anyone can demo a model. <em>Shipping one</em> means owning the
        architecture, the interface, and the failure modes nobody sees.
      </Statement>

      <BusinessImpact />
      <EngineeringLayer />
      <FeaturedAgents />
      <FeaturedWork />
    </>
  );
}
