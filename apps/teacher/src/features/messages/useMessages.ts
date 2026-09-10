import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { getCourses, getStudentThread, getThreads, replyToStudent } from "./messages.service";

export const useTeacherCourses = () =>
  useQuery({ queryKey: ["teacher", "courses"], queryFn: getCourses });

export const useThreads = (courseId: string | undefined) =>
  useQuery({
    queryKey: ["teacher", "threads", courseId],
    queryFn: () => getThreads(courseId!),
    enabled: !!courseId,
  });

export const useStudentThread = (courseId: string, studentId: string) =>
  useQuery({
    queryKey: ["teacher", "thread", courseId, studentId],
    queryFn: () => getStudentThread(courseId, studentId),
  });

export const useReplyToStudent = (courseId: string, studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => replyToStudent(courseId, studentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "thread", courseId, studentId] });
      queryClient.invalidateQueries({ queryKey: ["teacher", "threads", courseId] });
    },
    onError: (error) => showError(extractApiError(error, "Couldn't send that reply")),
  });
};
