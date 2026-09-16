import {keepPreviousData, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {
  Edition,
  getTemplate,
  listPricedPrograms,
  listTemplateVersions,
  previewQuote,
  ProgramType,
  saveTemplateVersion,
  TemplateInput,
} from "../services/templates.service";

const ROOT = ["admin", "pricing", "templates"] as const;

export const usePricedPrograms = () =>
  useQuery({queryKey: [...ROOT, "programs"], queryFn: listPricedPrograms});

export const useTemplate = (type: ProgramType, id: string, edition: Edition) =>
  useQuery({queryKey: [...ROOT, "detail", type, id, edition], queryFn: () => getTemplate(type, id, edition)});

export const useTemplateVersions = (type: ProgramType, id: string, edition: Edition) =>
  useQuery({
    queryKey: [...ROOT, "versions", type, id, edition],
    queryFn: () => listTemplateVersions(type, id, edition),
  });

/** A value that only settles once it has stopped changing for `ms`. */
export function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
}

/**
 * The live price preview. Priced by the server so it can never disagree with
 * what saving produces. Waits for typing to pause, and keeps showing the last
 * prices while the next ones load so the panel doesn't flicker on each key.
 */
export const useQuotePreview = (type: ProgramType, id: string, edition: Edition, input: TemplateInput | null) => {
  const serialized = input ? JSON.stringify(input) : null;
  const settled = useDebounced(serialized, 400);
  return useQuery({
    queryKey: [...ROOT, "quote", type, id, edition, settled],
    queryFn: () => previewQuote(type, id, edition, JSON.parse(settled as string)),
    enabled: settled !== null,
    placeholderData: keepPreviousData,
    retry: false,
  });
};

export const useSaveTemplateVersion = (type: ProgramType, id: string, edition: Edition) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof saveTemplateVersion>[3]) => saveTemplateVersion(type, id, edition, input),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT}),
  });
};
