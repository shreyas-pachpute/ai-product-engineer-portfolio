import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site-config";

type BuildMetadataOptions = {
  title: string;
  description: string;
  /** Route path, e.g. "/work/document-intelligence-pipeline" — used for the canonical URL and OG url. */
  path: string;
  type?: "website" | "article";
  /** ISO date — only meaningful with type: "article". */
  publishedTime?: string;
};

/**
 * One helper behind every route's metadata export, so canonical URL,
 * Open Graph, and Twitter card construction can't quietly drift out of
 * sync between pages the way copy-pasted metadata objects do. Doesn't
 * set `openGraph.images` — Next.js resolves that automatically from each
 * route's co-located `opengraph-image.tsx` (and reuses it for the
 * Twitter card image too, when no separate `twitter-image` exists),
 * which is the whole point of using that file convention instead of
 * wiring image URLs by hand here.
 */
export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
}: BuildMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      ...(type === "article"
        ? { type: "article", ...(publishedTime ? { publishedTime } : {}) }
        : { type: "website" }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
