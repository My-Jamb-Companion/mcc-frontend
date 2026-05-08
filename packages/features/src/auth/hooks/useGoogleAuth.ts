"use client";

import { useMutation } from "@tanstack/react-query";
import { getGoogleAuthUrlApi } from "../services/auth.service";

export const useGoogleAuth = () => {
  return useMutation({
    mutationFn: getGoogleAuthUrlApi,
    onSuccess: ({ authorization_url }) => {
      window.location.href = authorization_url;
    },
  });
};
