import { getNoteBySlug } from "@/lib/content/notes";
import { NOTE_TYPE_LABELS } from "@/lib/content/notes-schema";
import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same as work/[slug] — no separate generateStaticParams; this inherits
// static generation from the sibling page.tsx's, in the same [slug] segment.

type Params = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Params) {
  const { slug } = await params;
  const entry = getNoteBySlug(slug);

  return renderOgImage({
    eyebrow: entry ? NOTE_TYPE_LABELS[entry.type] : "Notes",
    title: entry?.title ?? "Note",
    description: entry?.summary,
  });
}
