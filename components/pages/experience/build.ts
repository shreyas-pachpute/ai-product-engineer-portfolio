import { EDUCATION, EXPERIENCE } from "@/lib/content";
import {
  parseWhen,
  type Harbour,
  type Leg,
  type Port,
  type Voyage,
} from "./voyage";

/**
 * The passage, from lib/content.ts. Server only.
 *
 * Dead reckoning starts from a known position and lays down one leg per
 * course: here the harbour of departure (the degree), then one leg per
 * role, oldest first. A port sits at every leg boundary and carries a real
 * date. Nothing is added to what lib/content.ts says.
 */

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildVoyage(): Voyage {
  // lib/content.ts lists roles newest first; a track is plotted oldest first.
  const legs: Leg[] = [...EXPERIENCE].reverse().map((role) => ({
    id: slug(role.company),
    title: role.title,
    company: role.company,
    start: role.start,
    end: role.end,
    place: role.place,
    context: role.context,
    remarks: role.remarks,
    story: role.story,
  }));

  const ports: Port[] = legs.map((leg, index) => {
    const before = legs[index - 1];
    // If one role ended in a different month from the next one's start,
    // the port carries both dates rather than hiding the gap.
    const label =
      before && before.end !== leg.start
        ? `${before.end} / ${leg.start}`
        : leg.start;
    return { label, when: parseWhen(leg.start) };
  });
  const last = legs[legs.length - 1];
  if (last) ports.push({ label: last.end, when: parseWhen(last.end) });

  // The harbour is the qualification that comes before the first role: on
  // a list kept newest first, the last one.
  const degree = EDUCATION[EDUCATION.length - 1];
  const harbour: Harbour | null = degree
    ? {
        name: degree.institution.split(",").pop()?.trim() || degree.institution,
        institution: degree.institution,
        award: degree.award,
        years: degree.years,
        note: degree.note,
      }
    : null;

  return { harbour, legs, ports };
}
