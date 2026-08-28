"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { useEscapeKey } from "@/lib/utils/use-escape-key";
import { useBodyScrollLock } from "@/lib/utils/use-body-scroll-lock";
import { useHasMounted } from "@/lib/utils/use-has-mounted";
import { motionDuration, motionEasing } from "@/lib/motion/tokens";
import { filterCommandItems } from "@/lib/command/match";
import type { CommandGroup, CommandItem } from "@/lib/command/command-index";
import { useCommandPalette } from "@/components/command/command-palette-provider";
import { cn } from "@/lib/utils/cn";

const LISTBOX_ID = "command-palette-listbox";
const INPUT_ID = "command-palette-input";

const GROUP_ORDER: CommandGroup[] = ["Pages", "Case Studies", "Notes"];

/**
 * Keyboard-first navigation for the audience most likely to reach for it —
 * ⌘K/Ctrl+K anywhere on the site jumps to any page, case study, or note.
 *
 * Uses the ARIA combobox pattern rather than a focus trap: DOM focus stays
 * in the text input the entire time (so typing never breaks), and the
 * "selected" row is communicated via `aria-activedescendant` pointing at the
 * active `role="option"`. That's why `useFocusTrap` — used by MobileNav —
 * is deliberately NOT used here; trapping Tab inside a single-input dialog
 * would fight the pattern rather than support it. Escape and body-scroll
 * lock are shared with MobileNav, as those hooks anticipated.
 *
 * Portaled to `document.body` for the same containing-block reason as
 * MobileNav: the animated `<m.header>` ancestor carries an inline transform,
 * which would otherwise make it the containing block for this fixed overlay.
 */
export function CommandPalette({ items }: { items: CommandItem[] }) {
  const { isOpen, close } = useCommandPalette();
  const isMounted = useHasMounted();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(
    () => filterCommandItems(items, query),
    [items, query],
  );

  // Clamp during render rather than in an effect — a shrinking result list
  // must never leave `activeIndex` pointing past the end, and fixing it in
  // an effect would render one frame with an invalid selection first.
  const safeIndex =
    results.length === 0 ? 0 : Math.min(activeIndex, results.length - 1);

  useEscapeKey(close, isOpen);
  useBodyScrollLock(isOpen);

  // Reset to a clean slate on each open. Adjusted during render (React's
  // documented "reset state when a prop changes" pattern, same as
  // MobileNav's close-on-navigation) rather than in an effect, which would
  // cost an extra commit — and would briefly render the previous query's
  // stale results before clearing them.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  // Focus is a DOM side effect, not state, so it correctly stays here.
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  // Keep the active row scrolled into view as arrow keys walk past the
  // visible window of the scrollable list.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [safeIndex, isOpen]);

  function navigateTo(item: CommandItem) {
    close();
    router.push(item.href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length === 0 ? 0 : (current + 1) % results.length,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length === 0
          ? 0
          : (current - 1 + results.length) % results.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results[safeIndex];
      if (item) navigateTo(item);
    }
  }

  if (!isMounted) return null;

  // Rendered in index order but displayed grouped; this maps each item back
  // to its flat position so arrow-key indices stay correct across groups.
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    entries: results
      .map((item, index) => ({ item, index }))
      .filter((entry) => entry.item.group === group),
  })).filter((section) => section.entries.length > 0);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-[var(--z-modal)] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionDuration.feedback }}
        >
          {/* Click-outside to dismiss. `aria-hidden` + a real button for
              keyboard users isn't needed: Escape already closes, and the
              backdrop is purely a pointer affordance. */}
          <div
            aria-hidden="true"
            onClick={close}
            className="bg-surface-base/70 absolute inset-0 backdrop-blur-sm"
          />

          <m.div
            role="dialog"
            aria-modal="true"
            aria-label="Search and navigate"
            // No `shadow-lg`: `glass-modal` now carries its own rim light
            // and a deeper drop shadow (`--glass-depth-lg`). Same reasoning
            // as the navbar — two rules writing box-shadow, resolved by
            // emit order rather than intent.
            className="glass-modal relative flex w-full max-w-xl flex-col overflow-hidden rounded-lg"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{
              duration: motionDuration.orientation,
              ease: motionEasing.orientation,
            }}
          >
            <div className="border-border-subtle flex items-center gap-3 border-b px-4">
              <SearchIcon className="text-text-tertiary size-4 shrink-0" />
              <input
                id={INPUT_ID}
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={LISTBOX_ID}
                aria-autocomplete="list"
                aria-activedescendant={
                  results[safeIndex]
                    ? `command-${results[safeIndex].id}`
                    : undefined
                }
                autoComplete="off"
                spellCheck={false}
                placeholder="Search pages, case studies, notes…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                className="text-body text-text-primary placeholder:text-text-tertiary h-14 w-full bg-transparent outline-none"
              />
              <kbd className="text-caption text-text-tertiary border-border-subtle hidden shrink-0 rounded-sm border px-1.5 py-0.5 font-mono sm:block">
                esc
              </kbd>
            </div>

            <div
              ref={listRef}
              id={LISTBOX_ID}
              role="listbox"
              aria-label="Results"
              className="max-h-[50vh] overflow-y-auto p-2"
            >
              {results.length === 0 ? (
                <p className="text-body text-text-tertiary px-3 py-8 text-center">
                  No matches for &ldquo;{query}&rdquo;
                </p>
              ) : (
                grouped.map((section) => (
                  <div key={section.group} className="mb-2 last:mb-0">
                    <p className="text-caption text-text-tertiary px-3 pt-2 pb-1 font-mono tracking-[0.15em] uppercase">
                      {section.group}
                    </p>
                    {section.entries.map(({ item, index }) => (
                      <div
                        key={item.id}
                        id={`command-${item.id}`}
                        role="option"
                        aria-selected={index === safeIndex}
                        data-active={index === safeIndex}
                        onClick={() => navigateTo(item)}
                        onPointerMove={() => setActiveIndex(index)}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2.5 transition-colors duration-100",
                          index === safeIndex
                            ? "bg-surface-raised text-text-primary"
                            : "text-text-secondary",
                        )}
                      >
                        <span className="text-body truncate">{item.label}</span>
                        {index === safeIndex && (
                          <span className="text-caption text-text-tertiary shrink-0 font-mono">
                            ↵
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.5 10.5L14 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
