import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAdjacentWork,
  getAllWork,
  getRelatedWork,
  getWorkBySlug,
} from "@/lib/content/work";
import { BuildLogCaseStudy, SignatureCaseStudy } from "@/components/work";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, caseStudySchema } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Every entry is statically generated at build time — the content set is filesystem-known ahead of time, no on-demand rendering needed. */
export function generateStaticParams() {
  return getAllWork().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getWorkBySlug(slug);

  if (!entry) {
    return {};
  }

  return buildMetadata({
    title: entry.title,
    description: entry.summary,
    path: `/work/${entry.slug}`,
    type: "article",
    publishedTime: entry.publishedAt,
  });
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getWorkBySlug(slug);

  if (!entry) {
    notFound();
  }

  const { previous, next } = getAdjacentWork(slug);
  const relatedEntries = getRelatedWork(slug);
  const path = `/work/${entry.slug}`;

  return (
    <>
      <JsonLd data={caseStudySchema(entry, path)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: entry.title, path },
        ])}
      />
      {entry.tier === "signature" ? (
        <SignatureCaseStudy
          entry={entry}
          previous={previous}
          next={next}
          relatedEntries={relatedEntries}
        />
      ) : (
        <BuildLogCaseStudy
          entry={entry}
          previous={previous}
          next={next}
          relatedEntries={relatedEntries}
        />
      )}
    </>
  );
}
