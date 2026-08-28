type ReferenceProps = {
  title: string;
  source: string;
  href?: string;
};

/**
 * `<Reference title="..." source="..." href="..." />` — a citation, not a
 * footnote (footnotes are native markdown syntax, `[^1]`, handled by
 * remark-gfm with no component needed). This is for citing an external
 * paper, post, or spec inline, the way a real technical essay names its
 * sources rather than asserting claims unattributed.
 */
export function Reference({ title, source, href }: ReferenceProps) {
  const content = (
    <>
      <span className="text-text-primary">{title}</span>
      <span className="text-text-tertiary"> — {source}</span>
    </>
  );

  return (
    <div className="not-prose border-border-highlight text-caption my-6 border-l-2 py-1 pl-4">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="ease-feedback hover:text-accent-primary [&_span:first-child]:hover:text-accent-primary transition-colors duration-150"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
