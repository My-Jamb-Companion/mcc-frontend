import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {createNote, deleteNote, getNotes, updateNote} from "../services/notes.service";

const ROOT = (courseId: string) => ["courses", courseId, "notes"] as const;

export const useNotes = (courseId: string | null | undefined) => {
  const query = useQuery({
    queryKey: courseId ? ROOT(courseId) : ["courses", "notes", "disabled"],
    queryFn: () => getNotes(courseId as string),
    enabled: !!courseId,
  });
  return {...query, notes: query.data ?? []};
};

export const useCreateNote = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {lectureId: string; timestampSeconds: number; body: string}) =>
      createNote(courseId, input),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT(courseId)}),
  });
};

export const useUpdateNote = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({noteId, body}: {noteId: string; body: string}) =>
      updateNote(courseId, noteId, body),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT(courseId)}),
  });
};

export const useDeleteNote = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => deleteNote(courseId, noteId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT(courseId)}),
  });
};
