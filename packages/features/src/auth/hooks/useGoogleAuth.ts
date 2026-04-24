"use client";

import { useMutation } from "@tanstack/react-query";
import { getGoogleAuthUrlApi } from "../services/auth.service";

export const useGoogleAuth = () => {
  return useMutation({
    mutationFn: getGoogleAuthUrlApi,
    onSuccess: ({ authorization_url }) => {
      // Signal to middleware that we're mid-OAuth so it can intercept the
      // backend's redirect (which lands on "/") and route to the success page.
      document.cookie =
        "google_oauth_pending=1; path=/; SameSite=Lax; max-age=300";
      window.location.href = authorization_url;
    },
  });
};
