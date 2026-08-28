"use client";

import { useCommandPalette } from "@/components/command/command-palette-provider";
import { useIsApplePlatform } from "@/lib/utils/use-is-apple-platform";

/**
 * The palette's discoverability affordance. Shown from `lg:` up only — the
 * nav capsule is genuinely tight below that once the wordmark, four links,
 * and the CTA are in it, and this is the least important of those. The
 * shortcut itself still works at every width.
 *
 * The displayed modifier is platform-detected after mount rather than
 * rendered on the server: the server has no way to know the visitor's OS,
 * so showing "⌘K" to a Windows user (or vice versa) would be actively
 * wrong. Renders "K" alone until it knows, which is stable in both
 * directions and avoids a hydration mismatch.
 */
export function CommandTrigger() {
  const { open } = useCommandPalette();
  const isApple = useIsApplePlatform();
  const modifier = isApple === null ? null : isApple ? "⌘" : "Ctrl";

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search and navigate"
      aria-keyshortcuts="Meta+K Control+K"
      className="border-border-subtle text-caption text-text-tertiary ease-feedback hover:border-border-highlight hover:text-text-secondary focus-visible:outline-accent-primary hidden items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 lg:flex"
    >
      <span aria-hidden="true">{modifier}</span>
      <span aria-hidden="true">K</span>
    </button>
  );
}
