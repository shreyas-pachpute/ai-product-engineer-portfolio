type TimelineItem = {
  label: string;
  description: string;
};

type TimelineProps = {
  items: TimelineItem[];
};

/** Chronological build narration — `<Timeline items={[{label:"Week 1", description:"..."}]} />`. Same dot-and-line grammar as the rest of the site's node motif, applied to a static sequence instead of Business Impact's scroll-driven one. */
export function Timeline({ items }: TimelineProps) {
  return (
    <div className="not-prose border-border-subtle my-8 flex flex-col gap-6 border-l pl-6">
      {items.map((item) => (
        <div key={item.label} className="relative">
          <span className="border-accent-primary bg-surface-base absolute top-1.5 -left-[1.625rem] size-2.5 rounded-full border-2" />
          <p className="text-caption text-accent-primary-hover mb-1 font-mono tracking-[0.15em] uppercase">
            {item.label}
          </p>
          <p className="text-body text-text-secondary">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
