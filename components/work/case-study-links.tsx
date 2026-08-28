import { ArrowUpRightIcon, Button, GitHubIcon } from "@/components/primitives";
import type { WorkEntry } from "@/lib/content/work";

type CaseStudyLinksProps = {
  entry: WorkEntry;
};

/**
 * Renders nothing unless a case study actually declares `repoUrl`/`liveUrl`
 * in its frontmatter — no placeholder buttons, no disabled "coming soon"
 * affordances. A dead link is worse than no link on a page whose entire
 * argument is that this person ships real systems.
 *
 * Server Component; `<a>` rather than `next/link` because both targets are
 * external by definition (`rel="noreferrer noopener"` with `target="_blank"`
 * accordingly).
 */
export function CaseStudyLinks({ entry }: CaseStudyLinksProps) {
  if (!entry.repoUrl && !entry.liveUrl) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {entry.liveUrl && (
        <Button asChild variant="primary" size="sm">
          <a href={entry.liveUrl} target="_blank" rel="noreferrer noopener">
            View it live
            <ArrowUpRightIcon className="size-3.5" />
          </a>
        </Button>
      )}
      {entry.repoUrl && (
        <Button asChild variant="secondary" size="sm">
          <a href={entry.repoUrl} target="_blank" rel="noreferrer noopener">
            <GitHubIcon className="size-4" />
            Source
          </a>
        </Button>
      )}
    </div>
  );
}
