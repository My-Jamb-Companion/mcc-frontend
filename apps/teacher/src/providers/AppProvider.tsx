"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider, ErrorBoundary } from "@mcc/ui";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};
