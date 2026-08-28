/**
 * The hero's light field.
 *
 * What changed and why: the previous version was two blurred circles — one
 * blue, one ember — drifting on their own keyframes. Two circles read as
 * two circles no matter how much you blur them, and that is the single
 * most common "AI portfolio" background on the web.
 *
 * This is a mesh instead. Four colored sources at different sizes,
 * positions, drift paths and periods, composited with `screen` blending so
 * they ADD light where they overlap rather than painting over one another.
 * That additive overlap is the whole trick: the colors between the blobs —
 * the blue-violet and the cyan-ember transitions nobody explicitly
 * authored — are what make it read as one lit atmosphere rather than as
 * separate lamps.
 *
 * The four drift periods (38s / 47s / 53s, one reused with an offset) share
 * no common factor, so the composite does not visibly return to a pose
 * you have already seen. Two blobs on a shared 34s/42s pair, as before,
 * resynchronize often enough to notice.
 *
 * Colors come from the `--mesh-*` custom properties, which are deliberately
 * NOT in the Tailwind theme — see the note on them in globals.css. They
 * have no contrast guarantee and belong in gradients only.
 *
 * Still a Server Component and still entirely decorative: `aria-hidden`
 * and `pointer-events-none` throughout, transform/opacity-only animation
 * (so every layer stays on the compositor), and all of it already covered
 * by the global `prefers-reduced-motion` rule in globals.css.
 */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Mesh sources. `mix-blend-screen` on each is what turns four
          separate gradients into one light field — on a near-black canvas
          screen blending is additive, which is how light actually
          combines. Without it the topmost blob simply occludes the ones
          beneath and the overlaps go muddy. */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="animate-mesh-a absolute -top-[20%] -left-[5%] size-[46rem] rounded-full opacity-[0.32] mix-blend-screen blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, var(--mesh-signal), transparent 68%)",
          }}
        />
        <div
          className="animate-mesh-b absolute -top-[10%] right-[-8%] size-[38rem] rounded-full opacity-[0.26] mix-blend-screen blur-[110px]"
          style={{
            background:
              "radial-gradient(circle, var(--mesh-violet), transparent 68%)",
          }}
        />
        <div
          className="animate-mesh-c absolute bottom-[-25%] left-[15%] size-[42rem] rounded-full opacity-[0.2] mix-blend-screen blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, var(--mesh-cyan), transparent 70%)",
          }}
        />
        {/* Ember is the smallest and dimmest source on purpose. It is the
            site's secondary accent — present enough to warm the corner and
            keep the field from being uniformly cool, not enough to read as
            a fourth equal color. */}
        <div
          className="animate-mesh-b absolute right-[6%] bottom-[-18%] size-[26rem] rounded-full opacity-[0.18] mix-blend-screen blur-[90px]"
          style={{
            background:
              "radial-gradient(circle, var(--mesh-ember), transparent 70%)",
            animationDelay: "-19s",
          }}
        />
      </div>

      {/* Schematic dot-grid, faded toward the edges so it reads as texture, not a hard tile. */}
      <div
        className="bg-dot-grid absolute inset-0 opacity-[0.3]"
        style={{
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 35%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 35%, black, transparent 75%)",
        }}
      />

      {/* Vignette — pulls the eye back to the headline and stops the mesh
          from lighting the very edges of the viewport, where it would
          collide with the nav capsule and the section boundary below. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 40%, transparent 40%, var(--color-surface-base) 100%)",
        }}
      />

      {/* Grain, in two scales. The coarse layer drifts; the fine one does
          not. A large soft gradient on an 8-bit display bands visibly, and
          a single fine grain does not carry enough structure to break that
          up — the coarse layer is specifically what hides the banding.
          Oversized inset because it translates: at exactly inset-0 the
          drift would expose the tile edge. */}
      <div className="bg-noise-coarse animate-grain-drift absolute -inset-[8%] opacity-[0.09] mix-blend-overlay" />
      <div className="bg-noise absolute inset-0 opacity-[0.045] mix-blend-overlay" />
    </div>
  );
}
