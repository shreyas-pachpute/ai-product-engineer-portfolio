import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/site";

/** The crossing, then each of the content pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    ...PAGES.map((entry) => ({
      url: `${SITE_URL}${entry.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/resume`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
