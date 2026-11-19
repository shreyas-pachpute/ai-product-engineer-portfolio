import type { Metadata } from "next";
import { PageShell, Waiting } from "@/components/site/page-shell";
import { SKILLS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "The skills Shreyas Pachpute uses to turn an AI model into a product.",
  alternates: { canonical: "/skills" },
};

/**
 * Skills, as rigging.
 *
 * Each group is a mast: a tall rule with its name at the head. Each skill
 * is a line made fast to it, and the ones he would lead with are drawn
 * heavier and carry a pennant. With nothing supplied yet, the masts stand
 * bare, so the layout can be judged without a single made-up skill.
 */
const BARE = [5, 4, 4];

export default function SkillsPage() {
  const empty = SKILLS.length === 0;
  return (
    <PageShell id="skills">
      {empty ? (
        <Waiting what="skills, grouped, with the strongest marked" />
      ) : null}
      <div className="rig" aria-hidden={empty ? true : undefined}>
        {empty
          ? BARE.map((lines, mast) => (
              <section className="rig__mast" key={mast}>
                <ul className="rig__lines">
                  {Array.from({ length: lines }, (_, line) => (
                    <li className="rig__line rig__line--bare" key={line} />
                  ))}
                </ul>
              </section>
            ))
          : SKILLS.map((group) => (
              <section className="rig__mast" key={group.name}>
                <h2 className="display rig__name">{group.name}</h2>
                <ul className="rig__lines">
                  {group.skills.map((skill) => (
                    <li
                      className="rig__line"
                      key={skill.name}
                      data-strong={skill.strong ? "" : undefined}
                    >
                      <span className="rig__skill">{skill.name}</span>
                      {skill.evidence ? (
                        <span className="rig__evidence">{skill.evidence}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
      </div>
    </PageShell>
  );
}
