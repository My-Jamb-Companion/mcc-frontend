"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {getSupportThread, getSupportUnread, sendSupportMessage} from "./support.service";

const THREAD_KEY = ["support", "thread"];
const UNREAD_KEY = ["support", "unread"];

/** The conversation with the MCC team. Reading it marks the team's messages as read, so the badge is refreshed too. */
export const useSupportThread = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: THREAD_KEY,
    queryFn: async () => {
      const thread = await getSupportThread();
      queryClient.setQueryData(UNREAD_KEY, 0);
      return thread;
    },
    // A conversation: pick up a reply without a reload.
    refetchInterval: 30_000,
  });
  return {...query, messages: query.data?.messages ?? []};
};

export const useSendSupportMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendSupportMessage(body),
    onSuccess: () => queryClient.invalidateQueries({queryKey: THREAD_KEY}),
    onError: (error) => showError(extractApiError(error, "Couldn't send that message")),
  });
};

/** How many of the team's messages are waiting, for a badge. */
export const useSupportUnread = () =>
  useQuery({queryKey: UNREAD_KEY, queryFn: getSupportUnread, refetchInterval: 60_000, select: (n) => n ?? 0});
