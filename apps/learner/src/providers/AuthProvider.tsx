
"use client";

import { useAuth } from "@mcc/features/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useAuth(); // initialize user from storage
  return <>{children}</>;
};