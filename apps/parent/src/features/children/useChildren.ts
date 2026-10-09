import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addChild, getChildDetail, getChildren } from "./children.service";

export const useChildren = () => useQuery({ queryKey: ["parent", "children"], queryFn: getChildren });

export const useChildDetail = (childId: string) =>
  useQuery({ queryKey: ["parent", "children", childId], queryFn: () => getChildDetail(childId) });

export const useAddChild = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addChild,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parent", "children"] }),
  });
};
