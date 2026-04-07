"use client";

import { useAuth } from "@mcc/features/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import { LoadingState } from "@mcc/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated]);
  
 if (!isAuthenticated) return null;


  return <>{children}</>;
}