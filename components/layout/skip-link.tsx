/**
 * Standard "skip to content" pattern — invisible until keyboard-focused.
 * Necessary specifically because the nav is a persistent floating capsule a
 * keyboard user would otherwise have to tab through on every single page.
 * Pure CSS (`:focus`), no client JS required.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="focus:bg-accent-primary focus:text-body sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-toast)] focus:rounded-full focus:px-4 focus:py-2 focus:font-medium focus:text-white focus:no-underline focus:outline-2 focus:outline-offset-2 focus:outline-white"
    >
      Skip to content
    </a>
  );
}
