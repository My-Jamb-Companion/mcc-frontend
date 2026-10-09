import { DOCUMENTS, toLegalDocument } from "@mcc/landing-content";
import type { LegalDocument, LegalSlug } from "@mcc/landing-content";
import type { Metadata } from "next";
import { API_URL } from "@/src/config";
import { REVALIDATE_SECONDS } from "../home/content";
import { pageMetadata } from "../seo";

/**
 * A legal page as visitors read it: what an admin last published, or the built-in text when nothing is
 * published yet or the API can't be reached, so the page is never blank and a build never needs the API.
 */
export async function getLegalDocument(slug: LegalSlug): Promise<LegalDocument> {
  try {
    const response = await fetch(`${API_URL}/landing/pages/${slug}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return DOCUMENTS[slug];
    const body = (await response.json()) as { data?: { content?: unknown } };
    const published = body.data?.content;
    return published ? toLegalDocument(published, slug) : DOCUMENTS[slug];
  } catch {
    return DOCUMENTS[slug];
  }
}

/** The page's search and sharing details, from the text that is live. */
export async function legalMetadata(slug: LegalSlug): Promise<Metadata> {
  const doc = await getLegalDocument(slug);
  return pageMetadata({ title: doc.title, description: doc.summary, path: `/${slug}` });
}
