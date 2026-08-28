import Link from "next/link";

/**
 * Minimal, abstract node-graph mark rather than a lettered monogram — this
 * is foundation-phase chrome, not a branding decision, and an abstract
 * mark is honest about that (easy to swap for a real wordmark once brand
 * work happens) instead of guessing at initials/wordmark treatment now.
 * The three-node motif echoes the "systems" visual language used
 * elsewhere (multi-agent/graph imagery) rather than being arbitrary.
 *
 * The name sits beside the mark rather than replacing it — the mark stays
 * the compact, always-visible identity (shown alone below `sm`, where the
 * capsule has the least room); the name adds attribution once there's
 * space for it.
 */
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Shreyas Pachpute — Home"
      className="group ease-feedback hover:bg-surface-raised/60 relative flex shrink-0 items-center gap-2 rounded-full py-2 pr-3 pl-2 transition-colors duration-150"
    >
      <span
        aria-hidden="true"
        className="shadow-glow ease-feedback pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="text-text-primary ease-feedback group-hover:text-accent-primary relative size-6 shrink-0 transition-colors duration-150"
      >
        <path
          d="M7.6 16.6L10.6 7.8M16.4 16.6L13.4 7.8M8.3 18H15.7"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="6" cy="18" r="2.1" fill="currentColor" />
        <circle cx="18" cy="18" r="2.1" fill="currentColor" />
        <circle cx="12" cy="6" r="2.1" fill="currentColor" />
      </svg>
      <span className="font-display text-text-primary relative hidden text-[15px] font-medium tracking-tight whitespace-nowrap sm:block">
        Shreyas Pachpute
      </span>
    </Link>
  );
}
