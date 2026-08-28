import { getWorkBySlug } from "@/lib/content/work";
import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// No separate generateStaticParams needed here — this file lives in the
// same [slug] segment as page.tsx, whose generateStaticParams already
// drives static generation for the whole segment, this image included.

type Params = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Params) {
  const { slug } = await params;
  const entry = getWorkBySlug(slug);

  return renderOgImage({
    eyebrow: entry?.category ?? "Work",
    title: entry?.title ?? "Case Study",
    description: entry?.problem,
  });
}
