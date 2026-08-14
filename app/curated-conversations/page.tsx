import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Content from "./Content";
import { CONVERSATIONS_PUBLISHED } from "../config";

// While unpublished, the page can still be previewed at:
//   /curated-conversations?preview=cf-preview-2026
const PREVIEW_KEY = "cf-preview-2026";

export const metadata: Metadata = {
  title: "Curated Conversations | Curated Fit",
  description:
    "The Curated Fit journal: honest reading on strength, starting, and finding an exercise professional worth your time.",
  alternates: { canonical: "/curated-conversations" },
  openGraph: {
    type: "website",
    siteName: "Curated Fit",
    title: "Curated Conversations | Curated Fit",
    description:
      "The Curated Fit journal: honest reading on strength, starting, and finding an exercise professional worth your time.",
    url: "/curated-conversations",
    locale: "en_NZ",
  },
};

export default async function CuratedConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const previewOk = params?.preview === PREVIEW_KEY;

  if (!CONVERSATIONS_PUBLISHED && !previewOk) {
    notFound();
  }

  return <Content />;
}
