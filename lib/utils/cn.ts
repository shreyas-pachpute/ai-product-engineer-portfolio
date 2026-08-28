import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, taught about this project's custom theme tokens.
 *
 * THE BUG THIS FIXES
 *
 * tailwind-merge decides which utilities conflict by matching class names
 * against Tailwind's *default* scale. It has no access to the `@theme`
 * block in globals.css, so it has never known that `text-display`,
 * `text-h1`, `text-body` and friends are font sizes. Falling through the
 * `text-*` validators, it classified every one of them as a text COLOR —
 * which put them in the same conflict group as `text-text-primary`, so one
 * silently deleted the other.
 *
 * It was invisible for a long time because of which one won. In the Heading
 * primitive the order is `text-balance text-text-primary` + `font-display
 * text-display`, so the size survived and the COLOR was dropped — and
 * headings still looked correct, because `body` sets that same color and
 * they simply inherited it. A dropped class that happened not to matter.
 *
 * It stopped being harmless the moment a component put the size last:
 * `cn("font-display text-mega", "text-text-primary")` dropped `text-mega`,
 * and the statement line rendered at inherited body size instead of 9rem.
 * Same latent bug, opposite casualty, immediately visible.
 *
 * Registering the tokens below makes the grouping correct in both
 * directions: sizes conflict with sizes, colors conflict with colors, and
 * neither can evict the other again.
 *
 * KEEPING THIS IN SYNC
 *
 * Every value here mirrors a token in app/globals.css. Adding a `--text-*`,
 * `--shadow-*`, or background-image utility there without adding it here
 * reintroduces exactly this class of bug — quietly, and possibly in a form
 * that looks fine until some unrelated component changes its class order.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Mirrors the `--text-*` tokens in globals.css.
      "font-size": [
        {
          text: [
            "mega",
            "display",
            "h1",
            "h2",
            "h3",
            "body-lead",
            "body",
            "caption",
            "eyebrow",
          ],
        },
      ],
      // Mirrors `--shadow-glow` / `--shadow-glow-ember`. Without this,
      // `shadow-glow` reads as a shadow COLOR and cannot correctly
      // override or be overridden by `shadow-md`.
      shadow: [{ shadow: ["glow", "glow-ember"] }],
      // Custom `@utility` background-image textures. These genuinely do
      // conflict with each other (one background-image per element) and
      // genuinely do not conflict with `bg-*` colors.
      "bg-image": ["bg-noise", "bg-noise-coarse", "bg-dot-grid"],
    },
  },
});

/**
 * Merges class names and resolves Tailwind utility conflicts (the last
 * conflicting utility wins, e.g. `cn("p-4", condition && "p-6")` correctly
 * yields just `p-6`). Every primitive that accepts a `className` prop for
 * override composes it through this, never through raw template strings.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
