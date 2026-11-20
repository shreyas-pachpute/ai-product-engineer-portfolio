import type { Metadata } from "next";
import { Foundations } from "@/components/pages/education/foundations";
import { Plan } from "@/components/pages/education/plan";
import { Unfold } from "@/components/pages/education/unfold";
import { PageShell, Waiting } from "@/components/site/page-shell";
import { ACHIEVEMENTS, EDUCATION } from "@/lib/content";
import { IDENTITY } from "@/lib/site";
import "./education.css";

export const metadata: Metadata = {
  title: "Education",
  description: "Where Shreyas Pachpute studied, and the certificates he holds.",
  alternates: { canonical: "/education" },
};

/**
 * Education: unfold the boat.
 *
 * The opening folds a sheet of paper into a boat; this page unfolds one,
 * and the sheet is the plans of a ship. Each fold opened shows one
 * foundation: the degree (in the drawing's title block), then the two
 * certificates, oldest first. The facts are also set beside the paper as
 * ordinary text. See components/pages/education.
 */

const year = (date?: string) => Number(date?.match(/\d{4}/)?.[0] ?? 0);

export default function EducationPage() {
  const degree = EDUCATION[0];
  const credentials = ACHIEVEMENTS.filter((item) => item.credential)
    .slice()
    .sort((a, b) => year(a.date) - year(b.date));

  if (!degree && credentials.length === 0) {
    return (
      <PageShell id="education">
        <Waiting what="qualifications, with institution and years" />
      </PageShell>
    );
  }

  const names = [
    ...(degree ? [degree.award] : []),
    ...credentials.map((item) => item.name),
  ];

  return (
    <PageShell id="education">
      <Unfold
        names={names}
        facts={<Foundations degree={degree} credentials={credentials} />}
        plan={<Plan degree={degree} notes={credentials} name={IDENTITY.name} />}
      />
    </PageShell>
  );
}
