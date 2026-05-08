"use client";

import {ReactNode, useEffect, useMemo} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@mcc/features";

const PUBLIC_ROUTES = ["/login", "/signup", "/about", "/terms", "/privacy"];

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const {user, isLoading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = useMemo(
    () => PUBLIC_ROUTES.some((r) => pathname.startsWith(r)),
    [pathname],
  );

  useEffect(() => {
    if (isLoading || isPublicRoute || user) return;
    router.push(`/login?${new URLSearchParams({callbackUrl: pathname})}`);
  }, [user, isLoading, isPublicRoute, pathname]);

  if (!isPublicRoute && (isLoading || !user)) return null;

  return <>{children}</>;
};
