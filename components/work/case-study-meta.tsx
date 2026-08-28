import { formatDate } from "@/lib/utils/format-date";
import type { WorkEntry } from "@/lib/content/work";

type CaseStudyMetaProps = {
  entry: WorkEntry;
};

/** Compact fact strip — a proper `<dl>` since this genuinely is a description list, not decorative text. */
export function CaseStudyMeta({ entry }: CaseStudyMetaProps) {
  const items = [
    { label: "Timeline", value: entry.timeline },
    { label: "Published", value: formatDate(entry.publishedAt) },
    { label: "Read time", value: entry.readingTime },
  ];

  return (
    <dl className="border-border-subtle flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-y py-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <dt className="text-caption text-text-tertiary font-mono tracking-[0.1em] uppercase">
            {item.label}
          </dt>
          <dd className="text-body text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
