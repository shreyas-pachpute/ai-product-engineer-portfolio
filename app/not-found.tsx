import Link from "next/link";
import type { Metadata } from "next";
import {
  Button,
  Container,
  Eyebrow,
  Heading,
  Section,
  Text,
} from "@/components/primitives";

/**
 * A dedicated `opengraph-image.tsx` for this page isn't possible through
 * Next's file convention — that convention is scoped to route segment
 * folders, and `not-found.tsx` isn't one (it's the fallback for anything
 * that doesn't match a segment at all). It correctly falls back to the
 * root `app/opengraph-image.tsx` instead, which is a reasonable, honest
 * outcome rather than a gap.
 */
export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist — here's how to get back.",
};

export default function NotFound() {
  return (
    <Section spacing="lg">
      <Container size="content" className="text-center">
        <Eyebrow className="mb-3">404</Eyebrow>
        <Heading as="h1" size="display" className="mb-6">
          This page doesn&rsquo;t exist.
        </Heading>
        <Text size="lead" tone="secondary" className="mb-8">
          The link might be outdated, or the page hasn&rsquo;t been built yet.
        </Text>
        <Button asChild variant="primary" size="lg">
          <Link href="/">Back to the homepage</Link>
        </Button>
      </Container>
    </Section>
  );
}
