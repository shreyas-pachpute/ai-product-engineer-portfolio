"use client";

import { useLenis } from "@/components/providers/lenis-provider";

/** The one interactive element in the footer — isolated here so Footer itself can stay a Server Component. */
export function BackToTopButton() {
  const lenis = useLenis();

  function handleClick() {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-caption text-text-secondary ease-feedback hover:text-text-primary focus-visible:outline-accent-primary transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      Back to top ↑
    </button>
  );
}
