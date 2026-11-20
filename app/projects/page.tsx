import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { SeaTrials } from "@/components/pages/projects/sea-trials";
import { PROJECTS, SERIES, TRIALS } from "@/lib/content";
import "./projects.css";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "AI products and systems built by Shreyas Pachpute, put through sea trials: two in production at companies, the rest open source.",
  alternates: { canonical: "/projects" },
};

/**
 * Projects, as sea trials.
 *
 * Each project is a vessel. The reader chooses one and puts it through the
 * pressures that sank the paper boats on the crossing; the 3D ship takes
 * the weather and a tag pins to the part of her build that held. See
 * components/pages/projects/sea-trials.tsx.
 *
 * Below the four ships, the smaller craft: a series of agent systems on
 * GitHub, by name, with each repository's own description.
 */
export default function ProjectsPage() {
  const vessels = PROJECTS.map((project) => ({
    project,
    trials: TRIALS[project.name] ?? [],
  }));
  return (
    <PageShell id="projects">
      <SeaTrials vessels={vessels} />

      <section className="series" aria-labelledby="series-title">
        <h2 id="series-title" className="display series__title">
          The smaller craft.
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
