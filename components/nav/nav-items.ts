export const NAV_ITEMS = [
  { href: "/agents", label: "AI Agents" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Distinct copy from the plain "Contact" nav link on purpose — both route
 * to /contact, but a CTA that just repeats a link already sitting three
 * items to its left in the same capsule reads as a mistake, not emphasis.
 */
export const NAV_CTA = { href: "/contact", label: "Book a Call" } as const;
