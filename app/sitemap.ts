import type { MetadataRoute } from "next";
import { getAllWork } from "@/lib/content/work";
import { getAllAgents } from "@/lib/content/agents";
import { getAllNotes } from "@/lib/content/notes";
import { SITE_URL } from "@/lib/seo/site-config";

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "monthly" as const },
  { path: "/agents", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/work", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/services", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" as const },
  { path: "/notes", priority: 0.8, changeFrequency: "weekly" as const },
];

/**
 * Work and Notes entries come straight from the same content loaders the
 * pages themselves use (`getAllWork`, `getAllNotes`) — a new .mdx file in
 * either collection appears here automatically on the next build, no
 * edit to this file required. That's the literal test for "add 100 notes
 * without touching SEO code."
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    priority: route.priority,
    changeFrequency: route.changeFrequency,
  }));

  const workEntries = getAllWork().map((entry) => ({
    url: `${SITE_URL}/work/${entry.slug}`,
    lastModified: entry.publishedAt,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  const agentEntries = getAllAgents().map((entry) => ({
    url: `${SITE_URL}/agents/${entry.slug}`,
    lastModified: entry.publishedAt,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  const noteEntries = getAllNotes().map((entry) => ({
    url: `${SITE_URL}/notes/${entry.slug}`,
    lastModified: entry.publishedAt,
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));

  return [...staticEntries, ...agentEntries, ...workEntries, ...noteEntries];
}
