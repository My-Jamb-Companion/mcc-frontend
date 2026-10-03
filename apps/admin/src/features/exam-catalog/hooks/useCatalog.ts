import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CatalogKind, toOptions} from "../helper/catalog";
import {createCatalogItem, listCatalog, updateCatalogItem, UpdateCatalogPayload} from "../services/catalog.service";

const key = (kind: CatalogKind) => ["exam-catalog", kind];

/** Every item of a kind, including deactivated ones (management page, and the source for pickers). */
export const useCatalog = (kind: CatalogKind) => {
  const query = useQuery({queryKey: key(kind), queryFn: () => listCatalog(kind)});
  return {...query, items: query.data ?? []};
};

/** Select options for the program wizard; `selectedId` keeps a since-deactivated current value visible. */
export const useCatalogOptions = (kind: CatalogKind, selectedId?: string) => {
  const {items, ...rest} = useCatalog(kind);
  return {...rest, items, options: toOptions(items, selectedId)};
};

export const useCreateCatalogItem = (kind: CatalogKind) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createCatalogItem(kind, name),
    onSuccess: () => queryClient.invalidateQueries({queryKey: key(kind)}),
  });
};

export const useUpdateCatalogItem = (kind: CatalogKind) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, payload}: {id: string; payload: UpdateCatalogPayload}) =>
      updateCatalogItem(kind, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: key(kind)});
      // Program lists show these names, so refresh them too.
      queryClient.invalidateQueries({queryKey: ["exam-programs"]});
    },
  });
};
