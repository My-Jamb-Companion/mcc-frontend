import { useQuery } from "@tanstack/react-query";
import { getConversation, listConversations } from "../services/ai-studio.service";

export const useConversations = (search: string) =>
  useQuery({
    queryKey: ["admin", "ai-studio", "conversations", search || ""],
    queryFn: () => listConversations({ search: search || undefined, limit: 50 }),
  });

export const useConversation = (
  conversationId: string | null,
  isSession: boolean | null,
) =>
  useQuery({
    queryKey: ["admin", "ai-studio", "conversation", conversationId, isSession],
    queryFn: () => getConversation(conversationId as string, isSession as boolean),
    enabled: conversationId !== null && isSession !== null,
  });
