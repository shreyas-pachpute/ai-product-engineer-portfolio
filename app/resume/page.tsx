import type { Metadata } from "next";
import { Mark } from "@/components/brand/logo";
import { Shot } from "@/components/site/shot";
import {
  ACHIEVEMENTS,
  EDUCATION,
  EXPERIENCE,
  PRACTICE,
  PROFILE,
  PROJECTS,
  SERIES,
  SKILLS,
} from "@/lib/content";
import { IDENTITY, TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${IDENTITY.name}, ${IDENTITY.role}.`,
  alternates: { canonical: "/resume" },
};

/** The PDF made from this page. The README says how to remake it. */
const PDF = "/Shreyas-Pachpute-Resume.pdf";

/** A link as it reads on paper: no protocol, no trailing slash. */
function bare(href: string) {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/**
 * The résumé: one sheet of paper.
 *
 * It reads from the same data as the rest of the site (lib/content.ts), so
 * it cannot drift from the pages. On screen it is a sheet laid over the
 * sea; printed, or saved as a PDF, it is one A4 page (the print rules are
 * at the end of app/globals.css). It is plain, single-column text on
 * purpose: that is what a recruiter's eye and a recruiter's parsing
 * software both read most reliably.
 */
export default function ResumePage() {
  const credentials = ACHIEVEMENTS.filter((item) => item.credential);
  const openSource = PROJECTS.filter(
    (project) => project.owner === "Open source",
  );

  return (
    <main className="resume">
      <Shot at={9} tone="day" scene="dawn" />

      <p className="resume__actions label">
        <a className="flag" href={PDF} download>
          Download PDF
        </a>
        <span>Or print this page. It is set to fit one A4 sheet.</span>
      </p>

      <article className="sheet">
        <header className="sheet__head">
          <Mark className="sheet__mark" />
          <div>
            <h1 className="display sheet__name">{IDENTITY.name}</h1>
            <p className="sheet__role">
              {IDENTITY.role} · {PROFILE.headline}
            </p>
            <p className="sheet__contact">
              <span>{PROFILE.location}</span>
              <a href={PROFILE.phone.href}>{PROFILE.phone.label}</a>
              <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
              <a href="https://shreyaspachpute.in">shreyaspachpute.in</a>
              {IDENTITY.links.map((link) => (
                <a key={link.href} href={link.href}>
                  {bare(link.href)}
                </a>
              ))}
            </p>
          </div>
        </header>

        <section>
          <h2 className="sheet__heading">Summary</h2>
          <p>{PROFILE.summary}</p>
        </section>

        <section>
          <h2 className="sheet__heading">Experience</h2>
          {EXPERIENCE.map((role) => (
            <div className="sheet__entry" key={`${role.company}-${role.start}`}>
              <p className="sheet__line">
                <strong>
                  {role.title}, {role.company}
                </strong>
                <span>
                  {role.start} – {role.end}
                  {role.place ? ` · ${role.place}` : ""}
                </span>
              </p>
              <p className="sheet__context">{role.context}</p>
              <ul>
                {role.remarks.map((remark) => (
                  <li key={remark}>{remark}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/*
         * Open source: the two live systems in a line each, then what
         * makes agents hold, area by area, as built across the public
         * repositories. Each bullet is backed by code; see PRACTICE in
         * lib/content.ts.
         */}
        <section>
          <h2 className="sheet__heading">Open source</h2>
          {openSource.map((project) => (
            <p className="sheet__line sheet__project" key={project.name}>
              <span>
                <strong>{project.name}.</strong> {project.line}
              </span>
              <span>
                {project.links
                  .filter((link) => link.label !== "Code")
                  .map((link) => (
                    <a key={link.href} href={link.href}>
                      {bare(link.href)}
                    </a>
                  ))}
              </span>
            </p>
          ))}
          <p className="sheet__context sheet__series">
            With {SERIES.length} more agent systems on{" "}
            <a href="https://github.com/shreyas-pachpute">GitHub</a>, all on
            synthetic data. Across them:
          </p>
          <ul className="sheet__practice">
            {PRACTICE.map((item) => (
              <li key={item.line}>
                <strong>{item.area}.</strong> {item.line}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="sheet__heading">Skills</h2>
          {SKILLS.map((group) => (
            <p className="sheet__skills" key={group.name}>
              <strong>{group.name}.</strong>{" "}
              {group.skills.map((skill) => skill.name).join(", ")}.
            </p>
          ))}
        </section>

        <section className="sheet__pair">
          <div>
            <h2 className="sheet__heading">Certifications</h2>
            {credentials.map((item) => (
              <p key={item.name}>
                <strong>{item.name}</strong>
                <br />
                {[item.by, item.date].filter(Boolean).join(", ")}
              </p>
            ))}
          </div>
          <div>
            <h2 className="sheet__heading">Education</h2>
            {EDUCATION.map((item) => (
              <p key={item.institution}>
                <strong>{item.award}</strong>
                <br />
                {item.institution}
                <br />
                {[item.years, item.note].filter(Boolean).join(", ")}
              </p>
            ))}
          </div>
        </section>

        <footer className="sheet__foot display">{TAGLINE}</footer>
      </article>
    </main>
  );
}
