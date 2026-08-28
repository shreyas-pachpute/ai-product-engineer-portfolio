import Image from "next/image";

type MediaBlockProps = {
  caption: string;
  src?: string;
  alt?: string;
};

/**
 * `<MediaBlock caption="..." src="..." />` for a screenshot/diagram image,
 * or `<MediaBlock caption="..." />` alone for a labeled placeholder — none
 * of the current case studies have a real product screenshot to show yet,
 * and a broken `<img>` or a stock photo pretending to be one would be
 * worse than an honest placeholder. The placeholder is a real, styled
 * state, not a loading skeleton — it stays exactly like this until a real
 * image is supplied.
 */
export function MediaBlock({ caption, src, alt }: MediaBlockProps) {
  if (!src) {
    return (
      <figure className="not-prose border-border-subtle bg-surface-raised/40 my-8 flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-16 text-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-text-tertiary size-7"
        >
          <rect
            x="3.5"
            y="4.5"
            width="17"
            height="15"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle
            cx="8.5"
            cy="9.5"
            r="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M4 16.5L9 12L13 15L16 12.5L20 16"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <figcaption className="text-caption text-text-tertiary">
          {caption}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="not-prose my-8">
      <div className="border-border-subtle overflow-hidden rounded-md border">
        <Image
          src={src}
          alt={alt ?? caption}
          width={1200}
          height={675}
          className="w-full"
        />
      </div>
      <figcaption className="text-caption text-text-tertiary mt-3 text-center">
        {caption}
      </figcaption>
    </figure>
  );
}
