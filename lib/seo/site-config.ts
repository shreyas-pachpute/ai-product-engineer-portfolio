import {
  CONTACT_EMAIL,
  CONTACT_GITHUB,
  CONTACT_LINKEDIN,
} from "@/components/contact/content";

/**
 * Single source of truth for every piece of site-wide identity metadata
 * touches — metadataBase, Person/WebSite JSON-LD, OG image footer text,
 * the manifest. Author contact fields are re-imported from Phase 24's
 * Contact page (real, user-confirmed values), not re-declared, so there
 * is exactly one place they could ever drift out of sync.
 *
 * `AUTHOR_NAME` is an inference, not a confirmed value like the contact
 * fields are: it's derived from the LinkedIn/GitHub usernames
 * ("shreyaspachpute" / "shreyas-pachpute") the user already provided,
 * consistently pointing to "Shreyas Pachpute." Flagged explicitly here —
 * correct it directly in this file if it's wrong.
 */

/**
 * Resolution order matters, and the localhost fallback is the dangerous
 * one: every canonical URL, `<loc>` in the sitemap, JSON-LD `@id`, RSS
 * link, and absolute OG image URL is built from this. A production build
 * that silently falls back to localhost ships a sitemap Google can't
 * follow and OG cards that render nothing when the link is pasted into
 * LinkedIn or Slack — with no error to notice, because the build succeeds
 * perfectly well.
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — the explicit, correct answer. Set this.
 * 2. Vercel's own env vars, so a deploy without step 1 still self-resolves
 *    rather than falling through to localhost.
 *    `VERCEL_PROJECT_PRODUCTION_URL` is the stable production domain;
 *    `VERCEL_URL` is the per-deployment preview URL. Neither includes a
 *    protocol, hence the `https://` prefix.
 * 3. localhost — development only.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProduction) return `https://${vercelProduction}`;

  const vercelPreview = process.env.VERCEL_URL;
  if (vercelPreview) return `https://${vercelPreview}`;

  if (process.env.NODE_ENV === "production") {
    // Deliberately a build-time warning rather than a thrown error: failing
    // the build would block a legitimate local `next build` (which this
    // project does constantly for verification). This makes the mistake
    // impossible to miss without making local builds impossible to run.
    console.warn(
      "\n[site-config] NEXT_PUBLIC_SITE_URL is not set. Falling back to " +
        "http://localhost:3000 for canonical URLs, sitemap, RSS, JSON-LD, and " +
        "OG image URLs. Set it before deploying — see .env.example.\n",
    );
  }

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl().replace(/\/$/, "");

export const SITE_NAME = "Shreyas Pachpute — AI Product Engineer";
export const AUTHOR_NAME = "Shreyas Pachpute";
export const AUTHOR_JOB_TITLE = "AI Product Engineer";

export const SITE_DESCRIPTION =
  "AI Product Engineer — architecting production AI systems end-to-end, from model to market.";

export const AUTHOR_EMAIL = CONTACT_EMAIL;
export const AUTHOR_LINKEDIN = CONTACT_LINKEDIN;
export const AUTHOR_GITHUB = CONTACT_GITHUB;
export const AUTHOR_SAME_AS = [AUTHOR_LINKEDIN, AUTHOR_GITHUB];
