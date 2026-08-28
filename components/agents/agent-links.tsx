import { ArrowUpRightIcon, Button, GitHubIcon } from "@/components/primitives";
import type { AgentEntry } from "@/lib/content/agents";

type AgentLinksProps = {
  entry: AgentEntry;
};

/**
 * Mirrors components/work/case-study-links.tsx exactly: renders nothing
 * unless the entry actually declares repoUrl/liveUrl in frontmatter — no
 * placeholder buttons, no disabled "coming soon" affordance. Neither entry
 * has liveUrl set yet (no live-testable deployment exists today), so only
 * "Source" renders until that changes — the button appears automatically
 * once it does.
 */
export function AgentLinks({ entry }: AgentLinksProps) {
  if (!entry.repoUrl && !entry.liveUrl) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {entry.liveUrl && (
        <Button asChild variant="primary" size="sm">
          <a href={entry.liveUrl} target="_blank" rel="noreferrer noopener">
            Try it live
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
