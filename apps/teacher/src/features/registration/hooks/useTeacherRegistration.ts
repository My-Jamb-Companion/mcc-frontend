import { useMutation } from "@tanstack/react-query";
import { TeacherRegistrationInputs } from "../types";
import { registerTeacherApi } from "../registration.service";

// Real: POST /auth/teacher-signup creates a pending, unverified teacher
// account. Admin approval (PATCH /admin/teachers/<id>/approve) is a
// separate, later step -- this mutation only submits the application.
export const useTeacherRegistration = () => {
  const registerMutation = useMutation({
    mutationFn: (data: TeacherRegistrationInputs) => registerTeacherApi(data),
  });
  return { registerMutation };
};
