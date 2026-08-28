import { getAgentBySlug } from "@/lib/content/agents";
import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Params) {
  const { slug } = await params;
  const entry = getAgentBySlug(slug);

  return renderOgImage({
    eyebrow: entry?.category ?? "AI Agents",
    title: entry?.title ?? "AI Agent",
    description: entry?.problem,
  });
}
