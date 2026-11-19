import type { Metadata } from "next";
import { PageShell, Waiting } from "@/components/site/page-shell";
import { EXPERIENCE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Where Shreyas Pachpute has worked, and what he built in each role.",
  alternates: { canonical: "/experience" },
};

/**
 * Experience, as the log.
 *
 * A log is ruled in columns and written a line at a time: when, where,
 * and what happened. So this is a ruled ledger, newest entry first, with
 * the dates in the margin, not a stack of cards.
 */
export default function ExperiencePage() {
  const empty = EXPERIENCE.length === 0;
  return (
    <PageShell id="experience">
      {empty ? (
        <Waiting what="roles, with dates and what was built in each" />
      ) : null}
      <div
        className="log"
        role="table"
        aria-label="Experience"
        aria-hidden={empty ? true : undefined}
      >
        <div className="log__row log__row--head label" role="row">
          <span role="columnheader">Dates</span>
          <span role="columnheader">Position</span>
          <span role="columnheader">Remarks</span>
        </div>
        {empty
          ? [0, 1, 2, 3].map((row) => (
              <div className="log__row log__row--bare" key={row}>
                <span />
                <span />
                <span />
              </div>
            ))
          : EXPERIENCE.map((role) => (
              <div
                className="log__row"
                role="row"
                key={`${role.company}-${role.start}`}
              >
                <span className="log__dates label" role="cell">
                  {role.start} – {role.end}
                </span>
                <span className="log__position" role="cell">
                  <strong className="display">{role.title}</strong>
                  <span>{role.company}</span>
                  {role.place ? (
                    <span className="log__place">{role.place}</span>
                  ) : null}
                </span>
                <span className="log__remarks" role="cell">
                  <span className="log__context">{role.context}</span>
                  {role.remarks.map((remark) => (
                    <span key={remark}>{remark}</span>
                  ))}
                </span>
              </div>
            ))}
      </div>
    </PageShell>
  );
}
