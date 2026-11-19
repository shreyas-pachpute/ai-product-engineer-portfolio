import type { Metadata } from "next";
import { PageShell, Waiting } from "@/components/site/page-shell";
import { EDUCATION } from "@/lib/content";

export const metadata: Metadata = {
  title: "Education",
  description: "Where Shreyas Pachpute studied.",
  alternates: { canonical: "/education" },
};

/**
 * Education, as plans.
 *
 * Every engineering drawing has a title block in its corner: who drew it,
 * what it is, when. Each qualification is set as one — ruled, with its
 * fields labelled — because that is where a shipwright's training shows.
 * With nothing supplied, one empty block shows the fields.
 */
const FIELDS = ["Institution", "Award", "Years", "Notes"] as const;

export default function EducationPage() {
  const empty = EDUCATION.length === 0;
  return (
    <PageShell id="education">
      {empty ? (
        <Waiting what="qualifications, with institution and years" />
      ) : null}
      <div className="plans" aria-hidden={empty ? true : undefined}>
        {empty ? (
          <dl className="plan plan--blank">
            {FIELDS.map((field) => (
              <div className="plan__cell" key={field}>
                <dt className="label">{field}</dt>
                <dd />
              </div>
            ))}
          </dl>
        ) : (
          EDUCATION.map((item) => (
            <dl className="plan" key={`${item.institution}-${item.years}`}>
              <div className="plan__cell plan__cell--wide">
                <dt className="label">Institution</dt>
                <dd className="display">{item.institution}</dd>
              </div>
              <div className="plan__cell plan__cell--wide">
                <dt className="label">Award</dt>
                <dd>{item.award}</dd>
              </div>
              <div className="plan__cell">
                <dt className="label">Years</dt>
                <dd>{item.years}</dd>
              </div>
              {item.note ? (
                <div className="plan__cell">
                  <dt className="label">Notes</dt>
                  <dd>{item.note}</dd>
                </div>
              ) : null}
            </dl>
          ))
        )}
      </div>
    </PageShell>
  );
}
