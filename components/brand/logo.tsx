import { cn } from "@/lib/utils/cn";

/**
 * The mark: Masthead.
 *
 * Two letters, one ship.
 *
 *   - The P is a mast: a straight spar, capped with a ball (the "truck", the
 *     fitting at the very top of a mast), with the P's bowl bent round it.
 *   - The S is a swallowtail pennant streaming from the masthead, in the
 *     wind. Its tail is cut like the site's buttons.
 *
 * It reads as SP first, and a moment later as a ship's masthead flying her
 * colours: the site's idea (I build the ships) carried by the letters
 * themselves. Chosen by Shreyas on 20 November 2026 from five directions.
 *
 * Everything but the pennant follows `currentColor`, so the same drawing
 * works on paper and on navy; the pennant has its own colour (vermilion by
 * default). Geometry lives in MARK and is shared with the favicon, the app
 * icon and the brand files.
 */
export const MARK = {
  viewBox: "0 0 64 64",
  /** The mast: the P's stem. */
  mast: "M37.2 8H43.8V60H37.2Z",
  /** The truck: the ball that caps the mast. */
  truck: { cx: 40.5, cy: 6.2, r: 3.4 },
  /** The P's bowl, drawn as a stroke. */
  bowl: "M42.8 14H49.2C54.6 14 57.6 17.8 57.6 23.7C57.6 29.6 54.6 33.4 49.2 33.4H42.8",
  bowlWidth: 6.6,
  /** The S: a swallowtail pennant flying from the masthead. */
  pennant:
    "M37 17.98C35.16 17.69 28.34 16.55 25.95 16.23C23.55 15.91 23.54 16.06 22.63 16.05C21.72 16.04 21.18 16.1 20.47 16.17C19.76 16.24 19.2 16.29 18.37 16.49C17.54 16.69 16.34 17 15.47 17.39C14.6 17.78 13.7 18.37 13.13 18.8C12.56 19.23 12.37 19.43 12.06 19.97C11.75 20.51 11.4 21.42 11.27 22.04C11.14 22.66 11.15 23.05 11.28 23.71C11.41 24.37 11.74 25.38 12.05 25.98C12.36 26.58 12.7 26.89 13.13 27.31C13.56 27.73 14.09 28.13 14.65 28.51C15.21 28.89 15.06 28.91 16.5 29.58C17.94 30.25 21.77 31.81 23.31 32.51C24.85 33.21 24.95 33.31 25.75 33.79C26.55 34.27 27.37 34.79 28.13 35.41C28.89 36.03 29.67 36.71 30.33 37.5C30.99 38.29 31.69 39.45 32.09 40.13C32.49 40.81 32.5 40.85 32.71 41.6C32.92 42.35 33.26 43.64 33.37 44.65C33.48 45.66 33.48 46.65 33.38 47.65C33.29 48.65 32.99 49.89 32.8 50.63C32.61 51.37 32.61 51.38 32.26 52.07C31.91 52.76 31.3 53.93 30.68 54.74C30.06 55.55 29.1 56.44 28.53 56.95C27.96 57.47 27.94 57.46 27.29 57.83C26.64 58.2 25.3 58.87 24.62 59.17C23.94 59.47 23.93 59.47 23.22 59.63C22.51 59.79 21.54 60.06 20.37 60.15C19.2 60.24 17.57 60.27 16.21 60.17C14.85 60.08 13.73 59.9 12.23 59.58C10.73 59.26 8.05 58.49 7.22 58.27L11.07 57.12L8.38 54.13C9.16 54.31 11.71 54.96 13.06 55.2C14.42 55.44 15.38 55.55 16.51 55.59C17.64 55.64 18.77 55.62 19.83 55.47C20.88 55.32 21.92 55.06 22.84 54.67C23.76 54.28 24.73 53.62 25.36 53.13C25.99 52.64 26.23 52.39 26.64 51.73C27.05 51.07 27.59 50.09 27.84 49.17C28.09 48.26 28.14 47.05 28.15 46.24C28.16 45.43 28.04 44.92 27.89 44.32C27.74 43.72 27.53 43.16 27.24 42.63C26.95 42.1 26.59 41.61 26.17 41.15C25.75 40.69 25.42 40.34 24.71 39.86C24 39.38 23.53 38.96 21.93 38.24C20.33 37.52 16.88 36.32 15.12 35.56C13.36 34.8 12.39 34.28 11.35 33.66C10.31 33.04 9.67 32.56 8.9 31.84C8.13 31.12 7.25 30.02 6.76 29.36C6.26 28.7 6.17 28.39 5.93 27.88C5.69 27.37 5.51 27.1 5.32 26.29C5.13 25.48 4.86 23.85 4.78 23.03C4.7 22.21 4.77 21.92 4.82 21.35C4.88 20.79 4.97 20.2 5.11 19.64C5.25 19.08 5.45 18.51 5.68 17.97C5.91 17.43 5.99 17.1 6.49 16.41C6.99 15.72 7.87 14.57 8.66 13.82C9.45 13.07 10.36 12.46 11.25 11.92C12.14 11.38 12.84 11.02 14 10.61C15.16 10.2 17.04 9.69 18.21 9.43C19.38 9.17 19.86 9.12 21.03 9.04C22.2 8.96 22.44 8.72 25.23 8.95C28.02 9.18 35.7 10.18 37.8 10.42Z",
} as const;

type MarkProps = {
  /** Pennant colour. Defaults to the brand vermilion. */
  pennant?: string;
  className?: string;
  title?: string;
};

export function Mark({
  pennant = "var(--color-vermilion)",
  className,
  title,
}: MarkProps) {
  return (
    <svg
      viewBox={MARK.viewBox}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {/* Each part is named so the opening can hoist the mark in the header. */}
      <path className="mark__mast" d={MARK.mast} fill="currentColor" />
      <circle className="mark__truck" {...MARK.truck} fill="currentColor" />
      <path
        className="mark__bowl"
        d={MARK.bowl}
        stroke="currentColor"
        strokeWidth={MARK.bowlWidth}
        pathLength={1}
      />
      <path className="mark__pennant" d={MARK.pennant} fill={pennant} />
    </svg>
  );
}

/**
 * Mark + wordmark. The name is live text in Fraunces (so it is selectable,
 * translatable and read by assistive tech).
 */
export function Lockup({
  className,
  pennant,
  stacked = false,
}: {
  className?: string;
  pennant?: string;
  /** Two lines, for narrow spaces. */
  stacked?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark pennant={pennant} className="size-[1.85em] shrink-0" />
      <span className="wordmark leading-[0.92]">
        Shreyas{stacked ? <br /> : " "}Pachpute
      </span>
    </span>
  );
}

/**
 * A small sailing boat: mast, half-disc sail and a swell. It was the site's
 * first logo; it is kept as the drawing of a boat on the flat backdrop that
 * stands in for the 3D world where there is no WebGL.
 */
export function SailboatGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <rect x="19" y="5" width="7.5" height="39" rx="1.5" fill="currentColor" />
      <path
        d="M30.5 5h4a15.5 15.5 0 0 1 0 31h-4z"
        fill="var(--color-vermilion)"
      />
      <path
        d="M5 55C11 48 18 48 24 55S37 62 43 55S55 48.5 59 51"
        stroke="currentColor"
        strokeWidth={7.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
