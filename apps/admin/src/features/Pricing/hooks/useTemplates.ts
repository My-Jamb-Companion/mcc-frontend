import {keepPreviousData, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {
  Edition,
  getProgramTemplate,
  listPricedPrograms,
  listTemplateVersions,
  previewProgramQuotes,
  ProgramType,
  saveProgramTemplate,
  TemplateInput,
} from "../services/templates.service";

const ROOT = ["admin", "pricing", "templates"] as const;

export const usePricedPrograms = () =>
  useQuery({queryKey: [...ROOT, "programs"], queryFn: listPricedPrograms});

export const useProgramTemplate = (type: ProgramType, id: string) =>
  useQuery({queryKey: [...ROOT, "detail", type, id], queryFn: () => getProgramTemplate(type, id)});

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
 * The live price preview, in every format. Priced by the server so it can never disagree with what saving
 * produces. Waits for typing to pause, and keeps showing the last prices while the next ones load so the
 * panel doesn't flicker on each key.
 */
export const useQuotePreview = (type: ProgramType, id: string, input: TemplateInput | null) => {
  const serialized = input ? JSON.stringify(input) : null;
  const settled = useDebounced(serialized, 400);
  return useQuery({
    queryKey: [...ROOT, "quote", type, id, settled],
    queryFn: () => previewProgramQuotes(type, id, JSON.parse(settled as string)),
    enabled: settled !== null,
    placeholderData: keepPreviousData,
    retry: false,
  });
};

export const useSaveProgramTemplate = (type: ProgramType, id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof saveProgramTemplate>[2]) => saveProgramTemplate(type, id, input),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT}),
  });
};
