import { getAllWork } from "@/lib/content/work";
import { getAllAgents } from "@/lib/content/agents";
import { getAllNotes } from "@/lib/content/notes";
import { NOTE_TYPE_LABELS } from "@/lib/content/notes-schema";
import { NAV_ITEMS } from "@/components/nav/nav-items";

/**
 * Server-only (transitively imports the `fs`-backed content loaders). The
 * root layout builds this once and hands the finished array to the client
 * palette, so no content-loading code crosses the client boundary and the
 * index is computed at build time for every statically-generated page.
 *
 * Deliberately carries only what the palette renders and matches on —
 * label, href, group, keywords. Summaries and bodies are excluded on
 * purpose: they'd multiply the RSC payload on every single page load to
 * power a substring match that the title and keywords already handle.
 */

export type CommandGroup = "Pages" | "AI Agents" | "Case Studies" | "Notes";

export type CommandItem = {
  id: string;
  label: string;
  href: string;
  group: CommandGroup;
  /** Extra match surface — never rendered, only searched. */
  keywords: string;
};

export function buildCommandIndex(): CommandItem[] {
  const pages: CommandItem[] = [
    { href: "/", label: "Home", keywords: "start index landing" },
    ...NAV_ITEMS.map((item) => ({
      href: item.href,
      label: item.label,
      keywords: "",
    })),
    { href: "/notes", label: "Notes", keywords: "writing essays articles" },
  ].map((page) => ({
    id: `page:${page.href}`,
    label: page.label,
    href: page.href,
    group: "Pages" as const,
    keywords: page.keywords,
  }));

  const work: CommandItem[] = getAllWork().map((entry) => ({
    id: `work:${entry.slug}`,
    label: entry.title,
    href: `/work/${entry.slug}`,
    group: "Case Studies" as const,
    keywords: `${entry.category} ${entry.problem}`,
  }));

  const agents: CommandItem[] = getAllAgents().map((entry) => ({
    id: `agent:${entry.slug}`,
    label: entry.title,
    href: `/agents/${entry.slug}`,
    group: "AI Agents" as const,
    keywords: `${entry.category} ${entry.problem}`,
  }));

  const notes: CommandItem[] = getAllNotes().map((entry) => ({
    id: `note:${entry.slug}`,
    label: entry.title,
    href: `/notes/${entry.slug}`,
    group: "Notes" as const,
    keywords: `${NOTE_TYPE_LABELS[entry.type]} ${entry.summary}`,
  }));

  return [...pages, ...agents, ...work, ...notes];
}
