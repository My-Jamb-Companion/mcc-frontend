import { useMutation } from "@tanstack/react-query";
import { FormValues } from "../types/formTypes";

// Mocked: no teacher-shaped "onboarding complete" endpoint exists. The
// shared @mcc/features useOnboarding()/POST /onboarding/complete is
// student-shaped (username/preferred_language/self_description/...) and
// must not be reused here. See backend/docs/teacher-onboarding-backend-todo.md.
export const useOnboardingComplete = () => {
  const completeMutation = useMutation({
    mutationFn: async (_payload: FormValues) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { completed_at: new Date().toISOString() };
    },
  });
  return { completeMutation };
};
