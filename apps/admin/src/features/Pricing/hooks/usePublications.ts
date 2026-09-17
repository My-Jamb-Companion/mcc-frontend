import {keepPreviousData, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  cancelPublication,
  confirmPublication,
  listEditionPublications,
  listPublications,
  previewPublication,
  PublicationStatus,
  PublishInput,
  publishPrices,
  TierOverride,
} from "../services/publications.service";
import type {Edition, ProgramType} from "../services/templates.service";
import {useDebounced} from "./useTemplates";

// Under the pricing root so publishing also refreshes the program list and the
// template screens, which show published prices.
const PRICING = ["admin", "pricing"] as const;
const ROOT = [...PRICING, "publications"] as const;

/**
 * What publishing now would charge. Re-asked as overrides change, after typing
 * pauses; complete overrides only, so a half-typed price isn't sent.
 */
export const usePublicationPreview = (
  type: ProgramType,
  id: string,
  edition: Edition,
  overrides: TierOverride[],
  enabled: boolean,
) => {
  const settled = useDebounced(JSON.stringify(overrides), 400);
  return useQuery({
    queryKey: [...ROOT, "preview", type, id, edition, settled],
    queryFn: () => previewPublication(type, id, edition, JSON.parse(settled)),
    enabled,
    placeholderData: keepPreviousData,
    retry: false,
  });
};

export const useEditionPublications = (type: ProgramType, id: string, edition: Edition) =>
  useQuery({
    queryKey: [...ROOT, "edition", type, id, edition],
    queryFn: () => listEditionPublications(type, id, edition),
  });

export const usePublications = (status?: PublicationStatus) =>
  useQuery({queryKey: [...ROOT, "list", status ?? "all"], queryFn: () => listPublications(status)});

export const usePublishPrices = (type: ProgramType, id: string, edition: Edition) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublishInput) => publishPrices(type, id, edition, input),
    onSuccess: () => queryClient.invalidateQueries({queryKey: PRICING}),
  });
};

export const useConfirmPublication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmPublication,
    onSuccess: () => queryClient.invalidateQueries({queryKey: PRICING}),
  });
};

export const useCancelPublication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({publicationId, reason}: {publicationId: string; reason: string}) =>
      cancelPublication(publicationId, reason),
    onSuccess: () => queryClient.invalidateQueries({queryKey: PRICING}),
  });
};
