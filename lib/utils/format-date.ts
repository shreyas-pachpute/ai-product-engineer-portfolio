/** Formats an ISO date string (e.g. frontmatter `publishedAt`) as "Month YYYY". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}
