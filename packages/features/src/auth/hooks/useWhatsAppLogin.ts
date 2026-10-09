"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@mcc/store";
import { requestWhatsAppOtpApi, verifyWhatsAppOtpApi } from "../services/auth.service";
import { saveSession } from "../services/session";

/** Sign in with a code sent to WhatsApp: ask for a code, then trade it for a session. */
export const useWhatsAppLogin = () => {
  const { setUser, setAccessToken } = useAuthStore();

  const requestMutation = useMutation({ mutationFn: requestWhatsAppOtpApi });

  const verifyMutation = useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => verifyWhatsAppOtpApi(phone, code),
    onSuccess: (data) => {
      saveSession(data.user, data.access_token, data.refresh_token);
      setUser(data.user);
      setAccessToken(data.access_token);
    },
  });

  return { requestMutation, verifyMutation };
};
