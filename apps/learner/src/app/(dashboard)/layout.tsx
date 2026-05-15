"use client";

import {RoleLayout} from "@/src/components/RoleLayout";
import {useAuth} from "@mcc/features";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import Header from "@/src/features/dashboard/components/header/Header";
import SideNav from "@/src/features/dashboard/components/SideNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {isAuthenticated, hydrated, user} = useAuth();
  const [sideNav, setSideNav] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user && !user.is_onboarded) {
      router.replace("/onboarding");
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated || (user && !user.is_onboarded))
    return null;

  return (
    <RoleLayout allowedRoles={["student"]}>
      <div className="flex flex-col h-screen">
        <Header open={sideNav} setOpen={setSideNav} />
        <div
          className="grid max-sm:grid-cols-1 h-full relative pr-12 max-sm:px-4 overflow-hidden"
          style={{gridTemplateColumns: "auto 1fr"}}
        >
          <SideNav open={sideNav} setOpen={setSideNav} />
          <div className="overflow-y-auto col-start-2 pl-30 max-sm:pl-0 scrollbar-hide">
            {children}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
