"use client";

import { useState } from "react";

type CopyEmailButtonProps = {
  email: string;
};

/**
 * Same copy-then-confirm pattern as the Work case-study code blocks and
 * the footer's back-to-top control — one interaction language reused a
 * third time rather than a new one invented for this page. The email
 * text itself is a real `mailto:` link (the expected primary action);
 * this exists for anyone who'd rather paste the address into webmail
 * than launch a local mail client.
 */
export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className="border-border-subtle text-caption text-text-secondary ease-feedback hover:border-border-highlight hover:text-text-primary focus-visible:outline-accent-primary rounded-full border px-4 py-2 font-mono transition-colors duration-150 focus-visible:outline-2"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
