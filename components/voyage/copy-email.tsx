"use client";

import { useEffect, useRef, useState } from "react";

/** Copies the email address and says so, briefly. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard blocked (permissions, insecure origin): the address is
      // on screen as a mailto link, so there is nothing to recover.
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" className="textlink" onClick={copy}>
      <span aria-live="polite">{copied ? "Copied" : "Copy address"}</span>
    </button>
  );
}
