import type { ReactNode } from "react";
import { Shot } from "@/components/site/shot";
import { page, type PageId } from "@/lib/site";

/**
 * What the four content pages share: where the camera is, and the head of
 * the page (what it is called, and the line that ties it to the work).
 * Everything below the head is the page's own.
 *
 * The text sits in a bank of mist drawn across the left of the view (see
 * `.page` in app/globals.css) rather than on a card: it is part of the
 * weather, and the world stays visible beside it.
 */
const SCENE: Record<PageId, "dawn" | "noon" | "paper" | "storm" | "sunrise"> = {
  projects: "noon",
  skills: "noon",
  experience: "sunrise",
  achievements: "storm",
  education: "dawn",
};

export function PageShell({
  id,
  children,
  data,
}: {
  id: PageId;
  children: ReactNode;
  /** Extra data-* attributes for <main>, for a page's own state. */
  data?: { [key: `data-${string}`]: string };
}) {
  const entry = page(id);
  return (
    <main className={`page page--${id}`} data-tone={entry.tone} {...data}>
      <Shot at={entry.shot} tone={entry.tone} scene={SCENE[id]} />
      <header className="page__head">
        <p className="key label">{entry.label}</p>
        <h1 className="display title">{entry.title}</h1>
        <p className="body">{entry.line}</p>
      </header>
      {children}
    </main>
  );
}

/**
 * Shown where a page has nothing to list yet. It says so plainly: these
 * pages are filled from what Shreyas supplies, and nothing is invented to
 * stand in for it.
 */
export function Waiting({ what }: { what: string }) {
  return (
    <p className="waiting label" role="note">
      Nothing here yet. This page will list {what} as soon as Shreyas supplies
      them; nothing on it is made up in the meantime.
    </p>
  );
}
