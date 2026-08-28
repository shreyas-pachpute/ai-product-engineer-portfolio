import Link from "next/link";
import { Text } from "@/components/primitives";
import { CLOSING_LINK, CLOSING_PARAGRAPHS } from "./content";

/** A closing thought, not a CTA — this page's job is understanding, not conversion, so it ends with a plain inline link onward rather than a button competing for attention. */
export function ClosingSection() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      {CLOSING_PARAGRAPHS.map((paragraph) => (
        <Text key={paragraph} size="lead" tone="secondary">
          {paragraph}
        </Text>
      ))}
      <Text size="lead" tone="secondary">
        {CLOSING_LINK.prefix}{" "}
        <Link
          href={CLOSING_LINK.href}
          className="text-accent-primary-hover decoration-accent-primary/30 ease-feedback hover:text-text-primary underline underline-offset-4 transition-colors duration-150"
        >
          {CLOSING_LINK.label}
        </Link>{" "}
        {CLOSING_LINK.suffix}
      </Text>
    </div>
  );
}
