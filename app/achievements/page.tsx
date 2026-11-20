import type { Metadata } from "next";
import { PageShell, Waiting } from "@/components/site/page-shell";
import {
  ListOfLights,
  type Light,
} from "@/components/pages/achievements/list-of-lights";
import { ACHIEVEMENTS } from "@/lib/content";
import "./achievements.css";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Things Shreyas Pachpute has finished, shipped or been recognised for, each with a way to check it.",
  alternates: { canonical: "/achievements" },
};

/**
 * Each achievement's light: its character (the rhythm a navigator
 * identifies it by) and where it stands on the coast. The characters are
 * real List of Lights notation; which light gets which carries no meaning
 * beyond telling them apart.
 */
const PLACES: readonly Omit<Light, "achievement">[] = [
  { character: "Fl 5s", colour: "W", offset: 6, distance: 1500, height: 26 },
  {
    character: "Fl(2) 10s",
    colour: "W",
    offset: 14,
    distance: 2300,
    height: 34,
  },
  { character: "Oc 6s", colour: "R", offset: 22, distance: 1200, height: 18 },
  { character: "Iso 4s", colour: "G", offset: 31, distance: 1800, height: 22 },
  { character: "Q", colour: "W", offset: 40, distance: 2600, height: 40 },
  {
    character: "Fl(3) 15s",
    colour: "W",
    offset: -9,
    distance: 2000,
    height: 30,
  },
  {
    character: "Oc(2) 8s",
    colour: "G",
    offset: -17,
    distance: 1600,
    height: 20,
  },
  { character: "Fl 3s", colour: "R", offset: -25, distance: 2400, height: 28 },
];

/**
 * Achievements, as a List of Lights. See
 * components/pages/achievements/list-of-lights.tsx.
 */
export default function AchievementsPage() {
  const lights: Light[] = ACHIEVEMENTS.slice(0, PLACES.length).map(
    (achievement, index) => ({ achievement, ...PLACES[index]! }),
  );
  return (
    <PageShell id="achievements">
      {lights.length === 0 ? (
        <Waiting what="achievements, each with who issued it and when" />
      ) : (
        <ListOfLights lights={lights} />
      )}
    </PageShell>
  );
}
