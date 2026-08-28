import readingTime from "reading-time";
import {
  AUTHOR_EMAIL,
  AUTHOR_JOB_TITLE,
  AUTHOR_NAME,
  AUTHOR_SAME_AS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "./site-config";
import type { WorkEntry } from "@/lib/content/work";
import type { NoteEntry } from "@/lib/content/notes";
import type { AgentEntry } from "@/lib/content/agents";

/**
 * Plain object builders, not a templating system — each returns exactly
 * the schema.org shape it claims to, nothing stuffed in for the sake of
 * looking thorough. `personSchema`/`websiteSchema` use stable `@id`
 * anchors so every other schema on the site (Article, BreadcrumbList)
 * can reference the same Person/WebSite entities by pointer instead of
 * repeating their fields — the standard JSON-LD pattern for tying
 * multiple schemas on a page (or across pages) to one real-world entity.
 */

function personSchema() {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: AUTHOR_NAME,
    jobTitle: AUTHOR_JOB_TITLE,
    url: SITE_URL,
    email: `mailto:${AUTHOR_EMAIL}`,
    sameAs: AUTHOR_SAME_AS,
  };
}

function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

/** Sitewide `@graph`, rendered once in the root layout — Person + WebSite, referenced by `@id` from every other page's schema rather than repeated. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [personSchema(), websiteSchema()],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

function timeRequired(body: string): string {
  const minutes = Math.max(1, Math.round(readingTime(body).minutes));
  return `PT${minutes}M`;
}

/** Notes — a TechArticle in its own right, no `about` entity (unlike a case study, a note isn't describing a separate built system). */
export function noteArticleSchema(entry: NoteEntry, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: entry.title,
    description: entry.summary,
    url: `${SITE_URL}${path}`,
    datePublished: entry.publishedAt,
    timeRequired: timeRequired(entry.body),
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

/**
 * A case study is a write-up (TechArticle) *about* a built system
 * (SoftwareApplication) — modeled as two connected entities via `about`,
 * not one entity wearing two types, since a schema consumer reading
 * `about.applicationCategory` shouldn't have to guess whether that's
 * describing the article or the software.
 */
export function caseStudySchema(entry: WorkEntry, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: entry.title,
    description: entry.summary,
    url: `${SITE_URL}${path}`,
    datePublished: entry.publishedAt,
    timeRequired: timeRequired(entry.body),
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
    about: {
      "@type": "SoftwareApplication",
      name: entry.title,
      description: entry.problem,
      applicationCategory: entry.category,
      operatingSystem: "Web",
    },
  };
}

/**
 * Same TechArticle-about-a-SoftwareApplication shape as caseStudySchema —
 * arguably even more literally true here, since these are live agents, not
 * a narrative write-up of a system built for someone else.
 */
export function agentSchema(entry: AgentEntry, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: entry.title,
    description: entry.summary,
    url: `${SITE_URL}${path}`,
    datePublished: entry.publishedAt,
    timeRequired: timeRequired(entry.body),
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
    about: {
      "@type": "SoftwareApplication",
      name: entry.title,
      description: entry.problem,
      applicationCategory: entry.category,
      operatingSystem: "Web",
    },
  };
}
