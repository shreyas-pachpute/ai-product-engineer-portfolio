import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAdjacentNotes,
  getAllNotes,
  getNoteBySlug,
  getRelatedNotes,
} from "@/lib/content/notes";
import { NoteArticle } from "@/components/notes";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, noteArticleSchema } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllNotes().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getNoteBySlug(slug);

  if (!entry) {
    return {};
  }

  return buildMetadata({
    title: entry.title,
    description: entry.summary,
    path: `/notes/${entry.slug}`,
    type: "article",
    publishedTime: entry.publishedAt,
  });
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getNoteBySlug(slug);

  if (!entry) {
    notFound();
  }

  const { previous, next } = getAdjacentNotes(slug);
  const relatedEntries = getRelatedNotes(slug);
  const path = `/notes/${entry.slug}`;

  return (
    <>
      <JsonLd data={noteArticleSchema(entry, path)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Notes", path: "/notes" },
          { name: entry.title, path },
        ])}
      />
      <NoteArticle
        entry={entry}
        previous={previous}
        next={next}
        relatedEntries={relatedEntries}
      />
    </>
  );
}
