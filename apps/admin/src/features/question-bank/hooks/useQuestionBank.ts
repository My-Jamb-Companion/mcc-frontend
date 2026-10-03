import {keepPreviousData, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  BankClassification,
  BankFilters,
  createBankQuestion,
  deleteBankQuestion,
  listBankQuestions,
  listBankTopics,
  saveSetToBank,
  updateBankQuestion,
} from "../services/questionBank.service";
import type {BankQuestionPayload} from "@/src/features/question-editor/bank";

const KEY = ["question-bank"];

export const useBankQuestions = (filters: BankFilters, enabled = true) =>
  useQuery({
    queryKey: [...KEY, "list", filters],
    queryFn: () => listBankQuestions(filters),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useBankTopics = (enabled = true) =>
  useQuery({queryKey: [...KEY, "topics"], queryFn: listBankTopics, enabled});

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({queryKey: KEY});
}

export const useCreateBankQuestion = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: BankQuestionPayload & BankClassification) => createBankQuestion(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateBankQuestion = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({bankId, payload}: {bankId: string; payload: Partial<BankQuestionPayload> & BankClassification}) =>
      updateBankQuestion(bankId, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteBankQuestion = () => {
  const invalidate = useInvalidate();
  return useMutation({mutationFn: (bankId: string) => deleteBankQuestion(bankId), onSuccess: invalidate});
};

export const useSaveSetToBank = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      questions,
      classification,
      source,
    }: {
      questions: BankQuestionPayload[];
      classification?: BankClassification;
      source?: "saved" | "upload";
    }) => saveSetToBank(questions, classification, source),
    onSuccess: invalidate,
  });
};
