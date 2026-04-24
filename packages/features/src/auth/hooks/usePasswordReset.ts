"use client";

import { useMutation } from "@tanstack/react-query";
import {
  requestPasswordResetApi,
  verifyResetCodeApi,
  confirmNewPasswordApi,
} from "../services/auth.service";

export const usePasswordReset = () => {
  const requestMutation = useMutation({
    mutationFn: (email: string) => requestPasswordResetApi(email),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      verifyResetCodeApi(email, code).then((d) => d.verification_token),
  });

  const confirmMutation = useMutation({
    mutationFn: ({
      verificationToken,
      newPassword,
    }: {
      verificationToken: string;
      newPassword: string;
    }) => confirmNewPasswordApi(verificationToken, newPassword),
  });

  return { requestMutation, verifyMutation, confirmMutation };
};
