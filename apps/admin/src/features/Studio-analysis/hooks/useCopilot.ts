import { useMutation } from "@tanstack/react-query";
import { askCopilot } from "../services/copilot.service";

export const useAskCopilot = () =>
  useMutation({
    mutationFn: (message: string) => askCopilot(message),
  });
