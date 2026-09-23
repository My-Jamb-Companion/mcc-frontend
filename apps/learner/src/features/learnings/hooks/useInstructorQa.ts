import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  getInstructorThread,
  reportInstructorMessage,
  sendInstructorMessage,
} from "../services/instructorQa.service";

const ROOT = (courseId: string) => ["courses", courseId, "instructor-thread"] as const;

export const useInstructorThread = (courseId: string | null | undefined) => {
  const query = useQuery({
    queryKey: courseId ? ROOT(courseId) : ["courses", "instructor-thread", "disabled"],
    queryFn: () => getInstructorThread(courseId as string),
    enabled: !!courseId,
  });
  return {...query, messages: query.data ?? []};
};

export const useSendInstructorMessage = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({body, timestampSeconds}: {body: string; timestampSeconds?: number}) =>
      sendInstructorMessage(courseId, body, timestampSeconds),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT(courseId)}),
  });
};

export const useReportInstructorMessage = (courseId: string) => {
  return useMutation({
    mutationFn: ({messageId, reason}: {messageId: string; reason: string}) =>
      reportInstructorMessage(courseId, messageId, reason),
  });
};
