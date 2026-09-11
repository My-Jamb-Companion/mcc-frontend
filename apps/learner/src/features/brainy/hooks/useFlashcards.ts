import {useMutation} from "@tanstack/react-query";
import {Flashcard, generateFlashcards, saveStudySet} from "../services/flashcards.service";

export const useGenerateFlashcards = () =>
  useMutation({mutationFn: (content: string) => generateFlashcards(content)});

export const useSaveStudySet = () =>
  useMutation({
    mutationFn: ({
      title,
      subject,
      content,
    }: {
      title: string;
      subject: string;
      content: Flashcard[];
    }) => saveStudySet(title, subject, content),
  });
