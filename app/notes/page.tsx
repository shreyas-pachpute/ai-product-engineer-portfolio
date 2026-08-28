import type { Metadata } from "next";
import { getNotesByTheme } from "@/lib/content/notes";
import { NoteIndex } from "@/components/notes";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site-config";

const notesMetadata = buildMetadata({
  title: "Notes",
  description:
    "An engineering notebook — organized by theme, not by publish date.",
  path: "/notes",
});

export const metadata: Metadata = {
  ...notesMetadata,
  // RSS auto-discovery — the `<link rel="alternate" type="application/
  // rss+xml">` a feed reader or browser looks for to find the feed
  // without a visible link anywhere on the page.
  alternates: {
    ...notesMetadata.alternates,
    types: {
      "application/rss+xml": `${SITE_URL}/notes/rss.xml`,
    },
  },
};

export default function NotesIndexPage() {
  const groups = getNotesByTheme();
  return <NoteIndex groups={groups} />;
}
