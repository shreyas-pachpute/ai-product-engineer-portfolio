import type { Metadata } from "next";
import { getAllWork } from "@/lib/content/work";
import { WorkIndex } from "@/components/work";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description:
    "Engineering case studies — the problem, the architecture, the trade-offs, and what shipped.",
  path: "/work",
});

export default function WorkIndexPage() {
  const entries = getAllWork();
  return <WorkIndex entries={entries} />;
}
