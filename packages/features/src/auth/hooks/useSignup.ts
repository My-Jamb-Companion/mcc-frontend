"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { signupApi, resendVerificationApi } from "../services/auth.service";
import { captureReferralCode } from "../services/referral";

export const useSignup = () => {
  // A friend's invite link carries ?ref=<code>: remember it as soon as the signup page opens.
  useEffect(() => {
    captureReferralCode();
  }, []);

  const signupMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signupApi(email, password, captureReferralCode()),
  });

  const resendMutation = useMutation({
    mutationFn: (email: string) => resendVerificationApi(email),
  });

  return { signupMutation, resendMutation };
};
