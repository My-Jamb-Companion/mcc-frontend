"use client";

import {useAuth} from "@mcc/features";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
// import { LoadingState } from "@mcc/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {isAuthenticated} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // if (!isAuthenticated) return null;

  return <>{children}</>;
}
