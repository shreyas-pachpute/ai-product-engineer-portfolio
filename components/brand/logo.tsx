import { cn } from "@/lib/utils/cn";

/**
 * The mark.
 *
 * A straight mast, a half-disc sail, and a wave underneath.
 *
 *   - Mast + sail are a capital P.
 *   - The wave is an S, lying on its side.
 *   - Together they are a small ship at sea.
 *
 * Which is the site's whole idea in three shapes: P for Pachpute, S for
 * Shreyas, and a ship because that is what an AI product engineer builds.
 * The same half-disc sail is on the ship in the 3D world, so the logo is
 * not a symbol *for* the thing — it is a drawing of it.
 *
 * It is built from one rectangle, one half circle and one stroke, so it
 * holds down to 16px. `sail` is the only part with its own colour;
 * everything else follows `currentColor`, which is how the same file
 * works on paper, on navy and on vermilion.
 *
 * Geometry lives in MARK below and is shared with the favicon, the Open
 * Graph card and the intro, which draws these exact shapes.
 */

export const MARK = {
  viewBox: "0 0 64 64",
  mast: { x: 19, y: 5, width: 7.5, height: 39, rx: 1.5 },
  /** Half disc, flat edge toward the mast. */
  sail: "M30.5 5h4a15.5 15.5 0 0 1 0 31h-4z",
  /** One and a half periods of swell. Drawn as a round-capped stroke. */
  wave: "M5 55C11 48 18 48 24 55S37 62 43 55S55 48.5 59 51",
  waveWidth: 7.5,
} as const;

type MarkProps = {
  /** Sail colour. Defaults to the brand vermilion. */
  sail?: string;
  className?: string;
  title?: string;
};

export function Mark({
  sail = "var(--color-vermilion)",
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
      <rect {...MARK.mast} fill="currentColor" />
      <path d={MARK.sail} fill={sail} />
      <path
        d={MARK.wave}
        stroke="currentColor"
        strokeWidth={MARK.waveWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Mark + wordmark. The name is live text in Fraunces (so it is selectable,
 * translatable and read by assistive tech), set with the soft, wonky
 * alternates that give the wordmark its character.
 */
export function Lockup({
  className,
  sail,
  stacked = false,
}: {
  className?: string;
  sail?: string;
  /** Two lines, for narrow spaces. */
  stacked?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark sail={sail} className="size-[1.9em] shrink-0" />
      <span className="wordmark leading-[0.92]">
        Shreyas{stacked ? <br /> : " "}Pachpute
      </span>
    </span>
  );
}
