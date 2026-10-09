"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {getAssignmentThread, postAssignmentMessage} from "./assignmentMessages.service";

const key = (assignmentId: string) => ["assignment-thread", assignmentId];

export const useAssignmentThread = (assignmentId: string) => {
  const query = useQuery({
    queryKey: key(assignmentId),
    queryFn: () => getAssignmentThread(assignmentId),
    // A conversation: pick up the other person's reply without a reload.
    refetchInterval: 30_000,
  });
  return {...query, messages: query.data ?? []};
};

export const usePostAssignmentMessage = (assignmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => postAssignmentMessage(assignmentId, body),
    onSuccess: () => queryClient.invalidateQueries({queryKey: key(assignmentId)}),
    onError: (error) => showError(extractApiError(error, "Couldn't send that message")),
  });
};
