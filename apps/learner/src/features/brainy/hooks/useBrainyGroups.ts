import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  createGroup,
  getGroups,
  renameGroup,
  updateSession,
} from "../services/brainy.service";
import {SESSIONS_QUERY_KEY} from "./useBrainyChat";

export const GROUPS_QUERY_KEY = ["brainy-groups"];

/** The sidebar's groups. `isError` lets the sidebar fall back to the legacy three sections. */
export const useGroups = () => {
  const query = useQuery({queryKey: GROUPS_QUERY_KEY, queryFn: getGroups, staleTime: 60_000});
  return {...query, groups: query.data ?? []};
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createGroup(name),
    onSuccess: () => queryClient.invalidateQueries({queryKey: GROUPS_QUERY_KEY}),
  });
};

export const useRenameGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({groupId, name}: {groupId: string; name: string}) => renameGroup(groupId, name),
    onSuccess: () => queryClient.invalidateQueries({queryKey: GROUPS_QUERY_KEY}),
  });
};

/** Rename / move / pin a chat. Refreshes the list; the open chat's own cache is untouched. */
export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({sessionId, patch}: {sessionId: string; patch: Parameters<typeof updateSession>[1]}) =>
      updateSession(sessionId, patch),
    onSuccess: () => queryClient.invalidateQueries({queryKey: SESSIONS_QUERY_KEY}),
  });
};
