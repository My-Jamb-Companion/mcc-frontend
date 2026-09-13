import { useMutation } from "@tanstack/react-query";
import { TeacherRegistrationInputs } from "../types";

// Mocked: no real endpoint exists. POST /auth/signup hardcodes role="student"
// (backend/app/features/auth/service.py) and the admin-only POST
// /admin/teachers creates a passwordless, unusable account -- neither is a
// working self-service teacher registration path. This simulates the
// network round trip only; no HTTP request is made.
// See backend/docs/teacher-onboarding-backend-todo.md.
export const useTeacherRegistration = () => {
  const registerMutation = useMutation({
    mutationFn: async (data: TeacherRegistrationInputs) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return {
        submitted_at: new Date().toISOString(),
        email: data.email,
        full_name: data.full_name,
      };
    },
  });
  return { registerMutation };
};
