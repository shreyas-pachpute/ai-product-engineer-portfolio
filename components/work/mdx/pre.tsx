"use client";

import { useRef, useState, type ComponentPropsWithoutRef } from "react";

/**
 * The only client component in the entire MDX rendering pipeline — code
 * blocks are syntax-highlighted server-side at build time by
 * rehype-pretty-code (Shiki), so this exists purely to add a copy button;
 * everything else about the block's appearance (background, padding,
 * overflow, border-radius) comes from @tailwindcss/typography's `pre`
 * styling via the `--tw-prose-pre-*` overrides in globals.css, not
 * reimplemented here.
 *
 * Reads the copied text from the rendered DOM (`preRef.current.textContent`)
 * rather than needing the raw source string threaded through as a prop —
 * works regardless of how rehype-pretty-code structures the highlighted
 * spans internally.
 */
export function Pre(props: ComponentPropsWithoutRef<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        aria-live="polite"
        className="border-border-subtle bg-surface-base/80 text-caption text-text-tertiary ease-feedback hover:text-text-primary focus-visible:outline-accent-primary absolute top-3 right-3 rounded-sm border px-2.5 py-1 font-mono opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre ref={preRef} {...props} />
    </div>
  );
}
