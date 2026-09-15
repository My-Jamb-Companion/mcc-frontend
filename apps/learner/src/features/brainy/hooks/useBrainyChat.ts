import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  deleteChat,
  deleteSession,
  getChatHistory,
  getSession,
  getSessions,
  sendChatMessage,
  getUsageSummary,
} from "../services/brainy.service";

export const SESSIONS_QUERY_KEY = ["brainy-sessions"];

export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: (message: string) => sendChatMessage(message),
  });
};

export const useChatHistory = () => {
  const query = useQuery({queryKey: ["brainy-chats"], queryFn: getChatHistory});
  return {...query, chats: query.data ?? []};
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["brainy-chats"]});
    },
  });
};

/** The user's saved threads -- what repopulates the sidebar after a login. */
export const useSessions = () => {
  const query = useQuery({queryKey: SESSIONS_QUERY_KEY, queryFn: getSessions});
  return {...query, sessions: query.data ?? []};
};

/**
 * One thread with its messages. Used when landing on /brainy/chat/<id>
 * directly (a refresh, or a link opened on another device) where the
 * conversation isn't in context yet.
 */
export const useSession = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ["brainy-session", sessionId],
    queryFn: () => getSession(sessionId as string),
    enabled: !!sessionId,
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: SESSIONS_QUERY_KEY});
    },
  });
};

export const USAGE_QUERY_KEY = ["brainy-usage"];

/**
 * The signed-in user's own Brainy consumption, for the AI log's footer.
 * Refetched whenever a chat completes, since every answer changes it.
 */
export const useUsageSummary = () => {
  const query = useQuery({queryKey: USAGE_QUERY_KEY, queryFn: getUsageSummary});
  return {...query, summary: query.data};
};
