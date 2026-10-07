import { defaultContent, normalizeContent } from "@mcc/landing-content";
import type { LandingContent } from "@mcc/landing-content";
import { API_URL } from "@/src/config";

/** How long a published page is reused before the next visitor triggers a refresh (seconds). */
export const REVALIDATE_SECONDS = 60;

/**
 * The page visitors see: what an admin last published, or the built-in design when nothing is
 * published yet or the API can't be reached, so the page is never blank and a build never needs the API.
 */
export async function getLandingContent(): Promise<LandingContent> {
  try {
    const response = await fetch(`${API_URL}/landing/pages/home`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return defaultContent();
    const body = (await response.json()) as { data?: { content?: unknown } };
    const published = body.data?.content;
    return published ? normalizeContent(published) : defaultContent();
  } catch {
    return defaultContent();
  }
}
