import Link from "next/link";
import { Button, Heading, Text } from "@/components/primitives";
import { CLOSING_SECTION } from "./content";

/**
 * Leads into Contact without building it — links to /contact the same
 * way the nav, Proof Bar, and Featured Work already do, ahead of that
 * route existing. One button, no secondary options competing for
 * attention; this page has already made its case.
 */
export function ClosingSection() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Heading as="h2" size="h1" className="mb-4">
        {CLOSING_SECTION.heading}
      </Heading>
      <Text size="lead" tone="secondary" className="mb-8">
        {CLOSING_SECTION.sub}
      </Text>
      <Button asChild variant="primary" size="lg">
        <Link href={CLOSING_SECTION.cta.href}>{CLOSING_SECTION.cta.label}</Link>
      </Button>
    </div>
  );
}
