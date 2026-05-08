"use client";

import { useMutation } from "@tanstack/react-query";
import { getFacebookAuthUrlApi } from "../services/auth.service";

export const useFacebookAuth = () => {
  return useMutation({
    mutationFn: getFacebookAuthUrlApi,
    onSuccess: ({ authorization_url }) => {
      window.location.href = authorization_url;
    },
  });
};
