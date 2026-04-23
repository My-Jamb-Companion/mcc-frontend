"use client";

import { useMutation } from "@tanstack/react-query";
import { signupApi, resendVerificationApi } from "../services/auth.service";

export const useSignup = () => {
  const signupMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signupApi(email, password),
  });

  const resendMutation = useMutation({
    mutationFn: (email: string) => resendVerificationApi(email),
  });

  return { signupMutation, resendMutation };
};
