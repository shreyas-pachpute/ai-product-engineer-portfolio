import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { PROJECTS, SERIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "AI products and systems built by Shreyas Pachpute: two in production at companies, the rest open source.",
  alternates: { canonical: "/projects" },
};

/**
 * Projects, as a fleet register.
 *
 * A register lists each vessel on its own ruled entry: a number, a name,
 * who she sails for, whether she is in service, and her particulars. That
 * is this page: numbered entries, the name set large, one line saying
 * what it is, and the facts under it. No cards, no thumbnails.
 *
 * Below the register, the smaller craft: a series of agent systems that
 * live on GitHub, listed by name with the repository's own description.
 */
export default function ProjectsPage() {
  return (
    <PageShell id="projects">
      <ol className="fleet">
        {PROJECTS.map((project, index) => (
          <li className="vessel" key={project.name}>
            <p className="vessel__no label" aria-hidden="true">
              No. {String(index + 1).padStart(2, "0")}
            </p>
            <div className="vessel__body">
              <h2 className="display vessel__name">{project.name}</h2>
              <p
                className="vessel__class key label"
                data-status={project.status}
              >
                {project.owner} · {project.status} · {project.years}
              </p>
              <p className="body">{project.line}</p>
              <ul className="vessel__points">
                {project.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="vessel__stack label">{project.stack.join(" · ")}</p>
              <p className="vessel__links label">
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    className="textlink"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <section className="series" aria-labelledby="series-title">
        <h2 id="series-title" className="display series__title">
          Also afloat.
        </h2>
        <p className="body">
          A further {SERIES.length} agent systems, in the open on GitHub and
          built on synthetic data. Each takes one business problem; most are
          about what an agent needs before it can be trusted with it: evidence,
          limits, and a person at the gate.
        </p>
        <ul className="series__list">
          {SERIES.map((item) => (
            <li key={item.repo}>
              <a
                className="textlink display"
                href={`https://github.com/shreyas-pachpute/${item.repo}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <span>{item.line}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
