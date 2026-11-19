"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lockup } from "@/components/brand/logo";
import { IDENTITY, PAGES, chapter } from "@/lib/site";

/**
 * The header, on every page: the lockup, the pages, and one flag.
 *
 * It sits over the 3D world with no bar behind it. Its colour follows the
 * scene (navy by day, cream at night) via `data-tone` on <html>.
 *
 * On the home page the lockup and the flag travel along the crossing
 * (`data-go`, handled by the scroll driver); anywhere else they are plain
 * links back to it. On a narrow screen the page links fold into a
 * disclosure — a native <details>, so it works without JavaScript.
 */
export function Header() {
  const pathname = usePathname();
  const home = pathname === "/";
  const contact = chapter("open-water");

  const links = (
    <>
      <Link href="/" aria-current={home ? "page" : undefined}>
        The crossing
      </Link>
      {PAGES.map((entry) => (
        <Link
          key={entry.href}
          href={entry.href}
          aria-current={pathname === entry.href ? "page" : undefined}
        >
          {entry.label}
        </Link>
      ))}
      <Link
        href="/resume"
        aria-current={pathname === "/resume" ? "page" : undefined}
      >
        Résumé
      </Link>
    </>
  );

  return (
    <header className="site-header">
      {home ? (
        <a
          className="brand"
          href="#harbour"
          data-go="0"
          aria-label={`${IDENTITY.name}: back to the start`}
        >
          <Lockup />
        </a>
      ) : (
        <Link className="brand" href="/" aria-label={`${IDENTITY.name}: home`}>
          <Lockup />
        </Link>
      )}

      <nav className="site-nav label" aria-label="Pages">
        {links}
      </nav>

      {/* The key forces a fresh, closed menu on every page. */}
      <details className="site-menu label" key={pathname}>
        <summary>Menu</summary>
        <nav aria-label="Pages">
          {links}
          {home ? (
            <a
              className="site-menu__signal"
              href="#open-water"
              data-go={contact.target}
            >
              Send a signal
            </a>
          ) : (
            <Link className="site-menu__signal" href="/#open-water">
              Send a signal
            </Link>
          )}
        </nav>
      </details>

      {home ? (
        <a className="flag label" href="#open-water" data-go={contact.target}>
          Send a signal
        </a>
      ) : (
        <Link className="flag label" href="/#open-water">
          Send a signal
        </Link>
      )}
    </header>
  );
}
