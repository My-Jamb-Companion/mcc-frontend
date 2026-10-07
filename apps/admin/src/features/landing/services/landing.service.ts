import {apiClient} from "@mcc/api";
import type {LandingContent} from "@mcc/landing-content";

export interface LandingVersion {
  version_id: string;
  status: "draft" | "published" | "archived";
  content: LandingContent;
  revision: number;
  note: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface LandingPageState {
  page_key: string;
  draft: LandingVersion | null;
  published: LandingVersion | null;
  has_unpublished_changes: boolean;
}

export interface LandingVersionSummary {
  version_id: string;
  status: "published" | "archived";
  note: string | null;
  published_at: string | null;
  published_by: string | null;
  published_by_name: string | null;
}

const PAGE = "home";
const base = `/admin/landing/pages/${PAGE}`;

/** The draft and published versions of the landing page. Endpoint: GET /admin/landing/pages/home */
export const getLandingPage = async (): Promise<LandingPageState> =>
  (await apiClient.get<{data: LandingPageState}>(base)).data.data;

/** Save the working draft. `baseRevision` is the draft's revision the edit started from (null: no draft yet). */
export const saveLandingDraft = async (content: LandingContent, baseRevision: number | null): Promise<LandingVersion> =>
  (await apiClient.put<{data: LandingVersion}>(`${base}/draft`, {content, base_revision: baseRevision})).data.data;

export const discardLandingDraft = async (): Promise<void> => {
  await apiClient.delete(`${base}/draft`);
};

export const publishLandingPage = async (note: string): Promise<LandingVersion> =>
  (await apiClient.post<{data: LandingVersion}>(`${base}/publish`, note.trim() ? {note: note.trim()} : {})).data.data;

export const listLandingVersions = async (): Promise<LandingVersionSummary[]> =>
  (await apiClient.get<{data: {versions: LandingVersionSummary[]}}>(`${base}/versions`)).data.data.versions;

export const restoreLandingVersion = async (versionId: string): Promise<LandingVersion> =>
  (await apiClient.post<{data: LandingVersion}>(`${base}/versions/${versionId}/restore`)).data.data;

interface ApiErrorBody {
  message?: string;
  error?: {code?: string; details?: {problems?: string[]}};
}

/** A readable message for a failed call; a rejected page lists what is wrong with it. */
export function landingErrorMessage(err: unknown, fallback: string): string {
  const body = (err as {response?: {data?: ApiErrorBody}})?.response?.data;
  const problems = body?.error?.details?.problems;
  if (problems?.length) return `${body?.message ?? "The page isn't valid"}: ${problems.slice(0, 3).join("; ")}`;
  if (body?.message) return body.message;
  return err instanceof Error && err.message ? err.message : fallback;
}

/** True when the draft changed since it was opened (someone else saved, or it was published or discarded). */
export const isDraftConflict = (err: unknown): boolean =>
  (err as {response?: {status?: number; data?: ApiErrorBody}})?.response?.data?.error?.code === "DRAFT_CONFLICT";
