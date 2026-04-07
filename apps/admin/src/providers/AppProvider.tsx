"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { ToastProvider, ErrorBoundary } from "@mcc/ui";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};
