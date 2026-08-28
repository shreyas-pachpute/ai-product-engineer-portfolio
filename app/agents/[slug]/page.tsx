import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgentBySlug, getAllAgents } from "@/lib/content/agents";
import { AgentCaseStudy } from "@/components/agents";
import { JsonLd } from "@/components/seo/json-ld";
import { agentSchema, breadcrumbSchema } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Every entry is statically generated at build time, same as /work. */
export function generateStaticParams() {
  return getAllAgents().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getAgentBySlug(slug);

  if (!entry) {
    return {};
  }

  return buildMetadata({
    title: entry.title,
    description: entry.summary,
    path: `/agents/${entry.slug}`,
    type: "article",
    publishedTime: entry.publishedAt,
  });
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getAgentBySlug(slug);

  if (!entry) {
    notFound();
  }

  const path = `/agents/${entry.slug}`;

  return (
    <>
      <JsonLd data={agentSchema(entry, path)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "AI Agents", path: "/agents" },
          { name: entry.title, path },
        ])}
      />
      <AgentCaseStudy entry={entry} />
    </>
  );
}
