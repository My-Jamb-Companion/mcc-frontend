"use client";

import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getConversation, getUnreadMessageCount, listConversations} from "../services/conversations.service";
import type {ConversationFilters} from "../services/conversations.service";

export const CONVERSATIONS_KEY = ["admin-messages", "conversations"];
export const UNREAD_KEY = ["admin-messages", "unread"];

/** The inbox, kept fresh so a new reply shows up without a reload. */
export const useConversations = (filters: ConversationFilters) =>
  useQuery({
    queryKey: [...CONVERSATIONS_KEY, filters],
    queryFn: () => listConversations(filters),
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
  });

/**
 * One conversation. Reading it marks the person's messages as read, so the inbox and the badge are
 * refreshed straight after (their unread counts have just changed).
 */
export const useConversation = (userId: string | null) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["admin-messages", "thread", userId],
    queryFn: async () => {
      const thread = await getConversation(userId as string);
      void queryClient.invalidateQueries({queryKey: CONVERSATIONS_KEY});
      void queryClient.invalidateQueries({queryKey: UNREAD_KEY});
      return thread;
    },
    enabled: !!userId,
    refetchInterval: 20_000,
    retry: false,
  });
};

/** How many messages from students and teachers no admin has opened, for the sidebar badge. */
export const useUnreadMessages = () =>
  useQuery({queryKey: UNREAD_KEY, queryFn: getUnreadMessageCount, refetchInterval: 60_000, retry: false});
