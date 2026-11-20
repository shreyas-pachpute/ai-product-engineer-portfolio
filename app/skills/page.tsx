import type { Metadata } from "next";
import { NO_SCRIPT } from "@/components/pages/skills/no-script";
import { SailPlan } from "@/components/pages/skills/sail-plan";
import { Schedule } from "@/components/pages/skills/schedule";
import { PageShell, Waiting } from "@/components/site/page-shell";
import { SKILLS } from "@/lib/content";
import "./skills.css";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "The skills Shreyas Pachpute uses to turn an AI model into a product, drawn as a ship's sail plan: give it a job and the lines that job takes haul taut.",
  alternates: { canonical: "/skills" },
};

/**
 * Skills, as a sail plan.
 *
 * A shipwright's sail plan is the drawing of a ship's masts, sails and
 * rigging. Here every line of running rigging is a skill. The visitor gives
 * the ship an order, a job it could be hired for (ORDERS in lib/content.ts),
 * and the lines that job takes haul taut while the rest go slack, so the
 * skills read as combinations that do real work rather than a list of
 * keywords. The rigging schedule under the drawing lists every skill, with
 * where it was used, in plain text.
 */
export default function SkillsPage() {
  if (SKILLS.length === 0) {
    return (
      <PageShell id="skills">
        <Waiting what="skills, grouped, with the strongest marked" />
      </PageShell>
    );
  }
  return (
    <PageShell id="skills" data={{ "data-order": "0" }}>
      <noscript>
        <style>{NO_SCRIPT}</style>
      </noscript>
      <SailPlan>
        <Schedule />
      </SailPlan>
    </PageShell>
  );
}
