import { Eyebrow, Heading, Text } from "@/components/primitives";

type ProseSectionProps = {
  label: string;
  heading: string;
  paragraphs: string[];
};

/** Shared shape for Process, Standards, Expectations, and Pricing — a label, a heading, and prose. Fit gets its own component; its two-list structure doesn't fit this shape. */
export function ProseSection({
  label,
  heading,
  paragraphs,
}: ProseSectionProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Eyebrow className="mb-3">{label}</Eyebrow>
      <Heading as="h2" size="h1" className="mb-6">
        {heading}
      </Heading>
      <div className="flex flex-col gap-5">
        {paragraphs.map((paragraph) => (
          <Text key={paragraph} size="lead" tone="secondary">
            {paragraph}
          </Text>
        ))}
      </div>
    </div>
  );
}
