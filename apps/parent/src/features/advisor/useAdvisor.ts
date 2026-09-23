import { useMutation } from "@tanstack/react-query";
import { askAdvisor } from "./advisor.service";

export const useAskAdvisor = (childId: string) =>
  useMutation({
    mutationFn: (message: string) => askAdvisor(childId, message),
  });
