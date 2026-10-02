import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {
  Flashcard,
  FlashcardOptions,
  StudySetDetail,
  deleteStudySet,
  generateFlashcards,
  getStudySet,
  listStudySets,
  saveStudySet,
  updateStudySet,
  uploadStudyMaterial,
} from "../services/flashcards.service";

const STUDY_SETS_KEY = ["study-sets"];

export const useGenerateFlashcards = () =>
  useMutation({
    mutationFn: ({content, options}: {content: string; options?: FlashcardOptions}) =>
      generateFlashcards(content, options),
  });

export const useUploadStudyMaterial = () => useMutation({mutationFn: uploadStudyMaterial});

export const useSaveStudySet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      subject,
      content,
    }: {
      title: string;
      subject: string;
      content: Flashcard[];
    }) => saveStudySet(title, subject, content),
    onSuccess: () => queryClient.invalidateQueries({queryKey: STUDY_SETS_KEY}),
  });
};

export const useStudySets = () => {
  const query = useQuery({queryKey: STUDY_SETS_KEY, queryFn: listStudySets});
  return {...query, studySets: query.data ?? []};
};

export const useStudySet = (setId: string) =>
  useQuery({
    queryKey: [...STUDY_SETS_KEY, setId],
    queryFn: () => getStudySet(setId),
    enabled: !!setId,
  });

export const useUpdateStudySet = (setId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Pick<StudySetDetail, "title" | "description" | "content">>) =>
      updateStudySet(setId, input),
    onSuccess: () => {
      showSuccess("Study set updated");
      queryClient.invalidateQueries({queryKey: STUDY_SETS_KEY});
    },
    onError: (error) => showError(extractApiError(error, "Couldn't update that study set")),
  });
};

export const useDeleteStudySet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStudySet,
    onSuccess: () => {
      showSuccess("Study set deleted");
      queryClient.invalidateQueries({queryKey: STUDY_SETS_KEY});
    },
    onError: (error) => showError(extractApiError(error, "Couldn't delete that study set")),
  });
};
