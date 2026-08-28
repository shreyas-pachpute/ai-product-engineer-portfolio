import { Container, Divider, Text } from "@/components/primitives";
import { BackToTopButton } from "@/components/layout/back-to-top-button";

/**
 * Deliberately minimal — no social icons (nothing to link to honestly
 * yet), no invented metrics. Just a copyright line and a working "back to
 * top" control. Server Component: the only interactive piece is isolated
 * in BackToTopButton.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <Container size="content">
        <Divider className="mb-8" />
        <div className="flex flex-col items-center justify-between gap-4 pb-10 sm:flex-row">
          <Text size="caption" tone="tertiary">
            © {year} Shreyas Pachpute. Built end-to-end, from model to market.
          </Text>
          <BackToTopButton />
        </div>
      </Container>
    </footer>
  );
}
