import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** One page, so one entry. Add routes here when the site grows them. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 }];
}
