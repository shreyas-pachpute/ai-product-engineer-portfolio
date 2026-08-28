import { getAllWork } from "@/lib/content/work";
import { getAllNotes } from "@/lib/content/notes";
import { NOTE_TYPE_LABELS } from "@/lib/content/notes-schema";
import {
  AUTHOR_JOB_TITLE,
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/seo/site-config";

/**
 * llms.txt — a plain-text index for AI crawlers and answer engines,
 * distinct from sitemap.xml (which is for traditional search engine
 * indexing, not built for an LLM to read directly). Emerging convention,
 * not a W3C/schema.org standard, but a low-cost, high-signal addition
 * given the brief explicitly asked to design for "AI-powered search and
 * answer engines," not just Google. Same content loaders as the sitemap
 * and RSS feed — new Work/Notes entries appear here automatically.
 */
export function GET() {
  const work = getAllWork();
  const notes = getAllNotes();

  const workLines = work
    .map(
      (entry) =>
        `- [${entry.title}](${SITE_URL}/work/${entry.slug}): ${entry.problem}`,
    )
    .join("\n");

  const noteLines = notes
    .map(
      (entry) =>
        `- [${entry.title}](${SITE_URL}/notes/${entry.slug}) (${NOTE_TYPE_LABELS[entry.type]}): ${entry.summary}`,
    )
    .join("\n");

  const body = `# ${AUTHOR_NAME}

> ${SITE_DESCRIPTION}

${AUTHOR_NAME} is an ${AUTHOR_JOB_TITLE}. This site documents production AI systems built end-to-end — architecture, engineering trade-offs, and business reasoning — plus an ongoing notebook of technical writing.

## Pages

- [Home](${SITE_URL}/): Positioning, engineering standards, and capabilities.
- [Work](${SITE_URL}/work): Case studies — full engineering reviews of shipped systems.
- [Services](${SITE_URL}/services): How engagements work — fit, process, and pricing philosophy.
- [About](${SITE_URL}/about): Engineering beliefs and how they've changed.
- [Contact](${SITE_URL}/contact): How to start a conversation.
- [Notes](${SITE_URL}/notes): An engineering notebook, organized by theme.

## Case Studies

${workLines}

## Notes

${noteLines}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
