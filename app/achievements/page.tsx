import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { PageShell, Waiting } from "@/components/site/page-shell";
import { ACHIEVEMENTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Things Shreyas Pachpute has finished, shipped or been recognised for.",
  alternates: { canonical: "/achievements" },
};

/**
 * Achievements, as lights.
 *
 * On a chart every light is listed with what it is and when it was
 * established. Here each achievement is a lamp on a dark page: lit, with
 * its own slow rhythm, and beside it what it was, who says so, and when.
 * Unlit lamps stand in until there is something to list.
 */
export default function AchievementsPage() {
  const empty = ACHIEVEMENTS.length === 0;
  return (
    <PageShell id="achievements">
      {empty ? (
        <Waiting what="achievements, each with who issued it and when" />
      ) : null}
      <ol className="lights" aria-hidden={empty ? true : undefined}>
        {empty
          ? [0, 1, 2, 3, 4].map((lamp) => (
              <li className="light light--out" key={lamp} />
            ))
          : ACHIEVEMENTS.map((item, index) => (
              <li
                className="light"
                key={item.name}
                style={{ "--i": index } as CSSProperties}
              >
                <h2 className="display light__name">
                  {item.href ? (
                    <a
                      className="textlink"
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    item.name
                  )}
                </h2>
                {item.by || item.date ? (
                  <p className="light__by label">
                    {[item.by, item.date].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {item.why ? <p className="light__why">{item.why}</p> : null}
              </li>
            ))}
      </ol>
    </PageShell>
  );
}
