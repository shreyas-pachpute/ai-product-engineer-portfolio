import type { Metadata } from "next";
import { PageShell, Waiting } from "@/components/site/page-shell";
import { buildVoyage } from "@/components/pages/experience/build";
import { ChartArt, ChartInk } from "@/components/pages/experience/chart-art";
import { LAYOUTS, chartLayout } from "@/components/pages/experience/geometry";
import { HarbourPage, LegPage } from "@/components/pages/experience/log-pages";
import { Reckoning } from "@/components/pages/experience/reckoning";
import "./experience.css";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Where Shreyas Pachpute has worked, and what he built in each role, plotted as a navigator's chart.",
  alternates: { canonical: "/experience" },
};

/**
 * Experience, as dead reckoning.
 *
 * Before satellites a navigator found the ship's position from a known
 * start and each leg's course and time, pencilled onto a chart. The career
 * is that chart: the degree is the harbour of departure, each role a leg,
 * each port a real date, and the things built in each role are the fixes
 * pencilled along its leg. A pair of brass dividers measures the passage
 * between any two ports; the log beside the chart holds each leg's page.
 *
 * Everything is rendered here, on the server: the chart's drawing and
 * every page of the log. components/pages/experience/reckoning.tsx adds
 * the dividers and the choosing.
 */
export default function ExperiencePage() {
  const voyage = buildVoyage();
  if (voyage.legs.length === 0) {
    return (
      <PageShell id="experience">
        <Waiting what="roles, with dates and what was built in each" />
      </PageShell>
    );
  }
  const fixes = voyage.legs.map((leg) => leg.remarks.length);
  const layouts = LAYOUTS.map((id) => chartLayout(id, fixes));
  return (
    <PageShell id="experience">
      <Reckoning
        voyage={voyage}
        layouts={layouts}
        art={layouts.map((layout) => (
          <div key={layout.id} className={`rk-layer rk-layer--${layout.id}`}>
            <ChartArt layout={layout} voyage={voyage} />
            <ChartInk layout={layout} />
          </div>
        ))}
        pages={{
          harbour: voyage.harbour ? (
            <HarbourPage harbour={voyage.harbour} first={voyage.legs[0]} />
          ) : null,
          legs: voyage.legs.map((leg, index) => (
            <LegPage
              key={leg.id}
              leg={leg}
              index={index}
              legs={voyage.legs}
              harbour={voyage.harbour}
            />
          )),
        }}
      />
    </PageShell>
  );
}
