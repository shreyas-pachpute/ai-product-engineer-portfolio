import type { CommandItem } from "@/lib/command/command-index";

/**
 * Hand-rolled rather than pulling in cmdk/fuse.js: the whole index is a few
 * dozen short strings, so the matching cost is irrelevant and a dependency
 * would be pure bundle weight. Two tiers, in order of how well they signal
 * intent:
 *
 * 1. Substring — "vect" matches "Vector Database". Ranked by how early the
 *    match starts, so a title-prefix hit beats a mid-keyword hit.
 * 2. Subsequence — "vdb" matches "Vector DataBase". Catches initialisms and
 *    typo-ish input, ranked below every substring hit.
 */

function subsequenceMatches(haystack: string, needle: string): boolean {
  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return needle.length === 0;
}

function score(item: CommandItem, query: string): number | null {
  const label = item.label.toLowerCase();
  const haystack = `${label} ${item.keywords.toLowerCase()}`;

  const labelIndex = label.indexOf(query);
  if (labelIndex !== -1) return 1000 - labelIndex;

  const keywordIndex = haystack.indexOf(query);
  if (keywordIndex !== -1) return 500 - Math.min(keywordIndex, 400);

  if (subsequenceMatches(label, query)) return 100;
  if (subsequenceMatches(haystack, query)) return 50;

  return null;
}

/** Empty query returns everything, unfiltered and in index order — the palette's resting state is a browsable menu, not a blank slate. */
export function filterCommandItems(
  items: CommandItem[],
  rawQuery: string,
): CommandItem[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return items;

  return items
    .map((item) => ({ item, score: score(item, query) }))
    .filter(
      (entry): entry is { item: CommandItem; score: number } =>
        entry.score !== null,
    )
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
