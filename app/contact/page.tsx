import type { Metadata } from "next";
import { ContactPage } from "@/components/contact";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Start a conversation — what's useful to include, and what happens after you reach out.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
