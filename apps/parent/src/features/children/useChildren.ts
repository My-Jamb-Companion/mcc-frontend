import { useQuery } from "@tanstack/react-query";
import { getChildDetail, getChildren } from "./children.service";

export const useChildren = () => useQuery({ queryKey: ["parent", "children"], queryFn: getChildren });

export const useChildDetail = (childId: string) =>
  useQuery({ queryKey: ["parent", "children", childId], queryFn: () => getChildDetail(childId) });
