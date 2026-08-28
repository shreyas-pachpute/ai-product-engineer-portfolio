"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { motionSpring } from "@/lib/motion/springs";

type NavLinkProps = {
  href: string;
  label: string;
  /** Closes the mobile overlay on click when rendered there — no-op on desktop. */
  onNavigate?: () => void;
  className?: string;
};

/**
 * Active state uses a shared `layoutId` — only the currently-active link
 * renders the pill, and Framer Motion animates it between links as the
 * route changes (the standard "magic move" tab-indicator pattern). Hover
 * state is deliberately plain CSS, not part of the same layout system —
 * mixing a shared-layout element with per-item hover state invites bugs
 * for no visible benefit here.
 */
export function NavLink({ href, label, onNavigate, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "text-body ease-feedback relative rounded-full px-4 py-2 font-medium transition-colors duration-150",
        isActive
          ? "text-text-primary"
          : "text-text-secondary hover:bg-surface-raised/60 hover:text-text-primary",
        className,
      )}
    >
      {isActive && (
        <m.span
          layoutId="nav-active-pill"
          className="bg-surface-raised absolute inset-0 -z-10 rounded-full"
          transition={motionSpring.snappy}
        />
      )}
      {label}
    </Link>
  );
}
