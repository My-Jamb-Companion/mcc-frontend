import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  createQaTester,
  deleteQaTester,
  listQaTesters,
  sendQaTesterCode,
  setQaTesterActive,
} from "../services/qaTesters.service";

const KEY = ["admin-qa-testers"];

export const useQaTesters = (search: string) =>
  useQuery({queryKey: [...KEY, search], queryFn: () => listQaTesters(search)});

export const useCreateQaTester = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQaTester,
    onSuccess: () => qc.invalidateQueries({queryKey: KEY}),
  });
};

export const useSetQaTesterActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({userId, isActive}: {userId: string; isActive: boolean}) => setQaTesterActive(userId, isActive),
    onSuccess: () => qc.invalidateQueries({queryKey: KEY}),
  });
};

export const useSendQaTesterCode = () => useMutation({mutationFn: sendQaTesterCode});

export const useDeleteQaTester = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQaTester,
    onSuccess: () => qc.invalidateQueries({queryKey: KEY}),
  });
};
