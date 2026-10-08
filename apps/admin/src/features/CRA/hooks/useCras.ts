import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  activateCra,
  createCra,
  CreateCraPayload,
  deactivateCra,
  listCras,
  updateCra,
} from "../services/cra.service";

const KEY = ["admin-cra"] as const;

/** CRAs from their own endpoint (searchable on the server). */
export const useCras = (search = "") => {
  const query = useQuery({queryKey: [...KEY, search], queryFn: () => listCras(search)});
  return {...query, cras: query.data?.items ?? [], total: query.data?.total ?? 0};
};

const useRefresh = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({queryKey: KEY});
};

export const useCreateCra = () => {
  const refresh = useRefresh();
  return useMutation({mutationFn: (payload: CreateCraPayload) => createCra(payload), onSuccess: refresh});
};

export const useUpdateCra = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({id, payload}: {id: string; payload: {full_name?: string; phone?: string}}) => updateCra(id, payload),
    onSuccess: refresh,
  });
};

export const useDeactivateCra = () => {
  const refresh = useRefresh();
  return useMutation({mutationFn: ({id, reason}: {id: string; reason: string}) => deactivateCra(id, reason), onSuccess: refresh});
};

export const useActivateCra = () => {
  const refresh = useRefresh();
  return useMutation({mutationFn: (id: string) => activateCra(id), onSuccess: refresh});
};
