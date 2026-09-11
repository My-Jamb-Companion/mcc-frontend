import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {deleteChat, getChatHistory, sendChatMessage} from "../services/brainy.service";

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
