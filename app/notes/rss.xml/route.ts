import { getAllNotes } from "@/lib/content/notes";
import { NOTE_TYPE_LABELS } from "@/lib/content/notes-schema";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site-config";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * A route handler, not a file-convention export — sitemap/robots/manifest
 * all have a dedicated Next.js file convention, RSS doesn't. Pulls
 * directly from `getAllNotes()`, same as the index page and the
 * sitemap — a new .mdx file in content/notes/ appears here on the next
 * build automatically.
 */
export function GET() {
  const notes = getAllNotes();
  const feedUrl = `${SITE_URL}/notes/rss.xml`;

  const items = notes
    .map((note) => {
      const url = `${SITE_URL}/notes/${note.slug}`;
      return `
    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(note.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(NOTE_TYPE_LABELS[note.type])}</category>
      <description>${escapeXml(note.summary)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Notes</title>
    <link>${SITE_URL}/notes</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>An engineering notebook — organized by theme, not by publish date.</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
