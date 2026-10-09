import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  discardLandingDraft,
  getLandingPage,
  LandingPageState,
  listLandingVersions,
  PageKey,
  publishLandingPage,
  restoreLandingVersion,
  saveLandingDraft,
} from "../services/landing.service";
import type {LandingContent} from "@mcc/landing-content";

export const landingKey = (page: PageKey = "home") => ["admin-landing", page];
const versionsKey = (page: PageKey) => ["admin-landing", "versions", page];

/** The home page's key (kept for callers that only ever edit the home page). */
export const LANDING_KEY = landingKey("home");

export const useLandingPage = (page: PageKey = "home") =>
  useQuery({queryKey: landingKey(page), queryFn: () => getLandingPage(page), refetchOnWindowFocus: false});

export const useSaveLandingDraft = (page: PageKey = "home") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({content, baseRevision}: {content: LandingContent; baseRevision: number | null}) =>
      saveLandingDraft(content, baseRevision, page),
    onSuccess: (draft) =>
      queryClient.setQueryData<LandingPageState>(landingKey(page), (old) =>
        old ? {...old, draft, has_unpublished_changes: true} : old,
      ),
  });
};

export const useDiscardLandingDraft = (page: PageKey = "home") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => discardLandingDraft(page),
    onSuccess: () => queryClient.invalidateQueries({queryKey: landingKey(page)}),
  });
};

export const usePublishLandingPage = (page: PageKey = "home") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: string) => publishLandingPage(note, page),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: landingKey(page)});
      queryClient.invalidateQueries({queryKey: versionsKey(page)});
    },
  });
};

export const useLandingVersions = (enabled: boolean, page: PageKey = "home") =>
  useQuery({queryKey: versionsKey(page), queryFn: () => listLandingVersions(page), enabled});

export const useRestoreLandingVersion = (page: PageKey = "home") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => restoreLandingVersion(versionId, page),
    onSuccess: () => queryClient.invalidateQueries({queryKey: landingKey(page)}),
  });
};
