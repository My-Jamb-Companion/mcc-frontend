import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {listUsers} from "@/src/features/Users/services/users.service";
import {createCra, CreateCraPayload} from "../services/cra.service";

const CRAS_KEY = ["admin-users", "cra"];

/** Every CRA account -- role-filtered listUsers(), same generic endpoint
 * the Users page uses for every other role. */
export const useCras = () => {
  const query = useQuery({
    queryKey: CRAS_KEY,
    queryFn: () => listUsers({role: "cra"}),
  });

  return {...query, cras: query.data ?? []};
};

export const useCreateCra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCraPayload) => createCra(payload),
    // Invalidating the shared ["admin-users"] prefix covers both this
    // page's own CRAS_KEY and the generic Users page's "all users" list --
    // TanStack Query matches queryKey by prefix, not exact equality.
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["admin-users"]}),
  });
};
