import type { Metadata } from "next";
import { AboutPage } from "@/components/about";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "What changed my mind — specific beliefs about building AI products that turned out to be wrong, and what replaced them.",
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
