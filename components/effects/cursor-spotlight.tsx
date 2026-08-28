/**
 * The visual half of the sitewide cursor glow — `CursorGlowController`
 * (client) writes `--pointer-x`/`--pointer-y`/`--pointer-active` onto
 * `<html>`; this just reads them, so it stays a Server Component. `fixed
 * inset-0`, mounted once in the root layout rather than per-section: since
 * it's viewport-fixed, it already appears "in" whichever section is
 * currently in view without needing to be duplicated into every section
 * component — one node, one gradient, works everywhere by construction.
 *
 * `mix-blend-mode: screen` lights up whatever's underneath (page canvas,
 * the ambient field's dim glyphs, card surfaces) rather than pasting a flat
 * tinted circle over it — the same "flashlight," not a sticker.
 * `opacity: var(--pointer-active, 0)` keeps it fully inert (not just
 * invisible) until the controller's first pointermove fires, and it
 * self-disables everywhere the controller declines to attach (reduced
 * motion, touch devices) since those custom properties simply never get set.
 *
 * The pointer coordinates are registered custom properties (`@property` in
 * globals.css), so transitioning them here is what gives the light its
 * follow-lag — it trails the cursor by `--pointer-lag` and eases into
 * place instead of snapping frame-to-frame. That lag is the entire
 * difference between "a gradient pinned to the mouse" and "a light source
 * with mass." The controller owns the value; see the first-move handoff
 * documented there.
 */
export function CursorSpotlight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-[var(--pointer-active,0)]"
      style={{
        mixBlendMode: "screen",
        background:
          "radial-gradient(600px circle at var(--pointer-x) var(--pointer-y), var(--color-accent-glow), transparent 70%)",
        transition:
          "opacity 500ms var(--ease-orientation), --pointer-x var(--pointer-lag) var(--ease-orientation), --pointer-y var(--pointer-lag) var(--ease-orientation)",
      }}
    />
  );
}
