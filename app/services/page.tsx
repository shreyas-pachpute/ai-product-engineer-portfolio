import type { Metadata } from "next";
import { ServicesPage } from "@/components/services";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "How engagements actually work — fit, process, standards, and pricing philosophy for AI product work.",
  path: "/services",
});

export default function Page() {
  return <ServicesPage />;
}
