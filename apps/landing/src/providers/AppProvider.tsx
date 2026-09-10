"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { ToastProvider, ErrorBoundary } from "@mcc/ui";
import { useHydratePendingCourse } from "@/src/features/enrollment/useHydratePendingCourse";

const PendingCourseHydrator = ({ children }: { children: ReactNode }) => {
  useHydratePendingCourse();
  return <>{children}</>;
};

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <PendingCourseHydrator>
            <ToastProvider />
            {children}
          </PendingCourseHydrator>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};
