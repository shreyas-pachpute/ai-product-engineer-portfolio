import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/primitives/container";
import { Eyebrow } from "@/components/primitives/section-header";

/**
 * A full-width statement line at `text-mega` scale. Not a section header,
 * not a pull quote — a deliberate interruption.
 *
 * The homepage's problem was that it ran five card sections back to back.
 * Each was fine; together they read as a list, because the page never
 * changed register. This is the register change: no card, no border, no
 * grid, no supporting paragraph — one line of type large enough that it
 * functions as a layout element rather than as text sitting inside one.
 *
 * Budgeted at one per page. Two statements on a page is a page with no
 * statement, since the whole effect depends on it being the only thing
 * that behaves this way.
 *
 * Wrap a word or phrase in `<em>` to give it the accent gradient. The
 * italics are removed — `<em>` is used here for its semantics (stress
 * emphasis, which is exactly what this is) rather than its default
 * rendering, and the gradient carries the emphasis visually instead.
 */

type StatementProps = {
  children: ReactNode;
  /** Small mono line above the statement — context, attribution, or a section label. */
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
};

export function Statement({
  children,
  eyebrow,
  align = "left",
  className,
}: StatementProps) {
  return (
    <section
      className={cn(
        // Generous vertical space is doing real work here: the statement
        // needs air around it to read as a pause in the page rather than
        // as another section that happens to have big text.
        "relative w-full py-28 md:py-40",
        className,
      )}
    >
      <Container size="content">
        <div className={cn("max-w-5xl", align === "center" && "mx-auto")}>
          {eyebrow ? (
            <Eyebrow
              tone="tertiary"
              className={cn("mb-6", align === "center" && "text-center")}
            >
              {eyebrow}
            </Eyebrow>
          ) : null}
          <p
            className={cn(
              "font-display text-mega text-text-primary text-balance",
              align === "center" && "text-center",
              // The accent gradient for `<em>`. `text-transparent` with
              // `bg-clip-text` is the mechanism; the gradient runs between
              // the site's two accents rather than within one hue, which is
              // what keeps it from reading as a generic purple wash.
              "[&_em]:bg-linear-to-br [&_em]:from-accent-primary-hover [&_em]:to-accent-ember [&_em]:bg-clip-text [&_em]:not-italic [&_em]:text-transparent",
            )}
          >
            {children}
          </p>
        </div>
      </Container>
    </section>
  );
}
