import { AMBIENT_GLYPHS } from "@/components/effects/ambient-field-content";

/**
 * Sitewide ambient background — a dim field of systems/ML telemetry text
 * (loss values, token ids, latency) that flickers asynchronously across
 * every page, behind every section. The "crazy AI background" brief
 * deliberately avoided the neural-net-nodes/particle-web cliché (already
 * rejected for Hero) in favor of something that reads as "the system is
 * alive and thinking" rather than a generic tech-site decoration.
 *
 * Server Component, zero client JS: the flicker is pure CSS
 * (`animate-ambient-flicker`, opacity-only, GPU-composited, already
 * covered by the global `prefers-reduced-motion` rule in globals.css).
 * `fixed inset-0 -z-10`: stays put through scrolling and page transitions
 * rather than being re-mounted per route, so it never restarts/flickers in
 * sync on navigation. `aria-hidden` + `pointer-events-none`: decorative
 * only, never intercepts a click or shows up for assistive tech.
 */
export function AmbientField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {AMBIENT_GLYPHS.map((glyph) => (
        <span
          key={glyph.text}
          className={
            "animate-ambient-flicker text-accent-primary/80 absolute font-mono whitespace-nowrap " +
            (glyph.size === "sm" ? "text-[11px]" : "text-[10px]")
          }
          style={{
            top: `${glyph.top}%`,
            left: `${glyph.left}%`,
            animationDelay: `${glyph.delay}s`,
            animationDuration: `${glyph.duration}s`,
            ["--ambient-min" as string]: glyph.min,
            ["--ambient-max" as string]: glyph.max,
          }}
        >
          {glyph.text}
        </span>
      ))}
    </div>
  );
}
