import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  discardLandingDraft,
  getLandingPage,
  LandingPageState,
  listLandingVersions,
  publishLandingPage,
  restoreLandingVersion,
  saveLandingDraft,
} from "../services/landing.service";
import type {LandingContent} from "@mcc/landing-content";

export const LANDING_KEY = ["admin-landing", "home"];

export const useLandingPage = () => useQuery({queryKey: LANDING_KEY, queryFn: getLandingPage, refetchOnWindowFocus: false});

export const useSaveLandingDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({content, baseRevision}: {content: LandingContent; baseRevision: number | null}) =>
      saveLandingDraft(content, baseRevision),
    onSuccess: (draft) =>
      queryClient.setQueryData<LandingPageState>(LANDING_KEY, (old) =>
        old ? {...old, draft, has_unpublished_changes: true} : old,
      ),
  });
};

export const useDiscardLandingDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({mutationFn: discardLandingDraft, onSuccess: () => queryClient.invalidateQueries({queryKey: LANDING_KEY})});
};

export const usePublishLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: string) => publishLandingPage(note),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: LANDING_KEY});
      queryClient.invalidateQueries({queryKey: ["admin-landing", "versions"]});
    },
  });
};

export const useLandingVersions = (enabled: boolean) =>
  useQuery({queryKey: ["admin-landing", "versions"], queryFn: listLandingVersions, enabled});

export const useRestoreLandingVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => restoreLandingVersion(versionId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: LANDING_KEY}),
  });
};
