"use client";

import {RoleLayout} from "@/src/components/RoleLayout";
import {useAuth} from "@mcc/features";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import Header from "@/src/features/dashboard/components/header/Header";
import SideNav from "@/src/features/components/SideNav";
import Help from "@/src/features/dashboard/components/Help";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {isAuthenticated, hydrated, user} = useAuth();
  const [sideNav, setSideNav] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      // router.replace("/login");
    } else if (user && !user.is_onboarded) {
      router.replace("/onboarding");
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated || (user && !user.is_onboarded)) {
    // return null;
  }

  const isClassroom = pathname.includes("/classroom");
  return (
    <RoleLayout allowedRoles={["student"]}>
      <div className="flex flex-col h-screen scrollbar-hide">
        <Header open={sideNav} setOpen={setSideNav} />

        {isClassroom ? (
          <section className="flex-1 overflow-hidden">{children}</section>
        ) : (
          <div
            className="grid max-sm:grid-cols-1 h-full relative md:pr-12 md:px-4 overflow-hidden"
            style={{gridTemplateColumns: "auto 1fr"}}
          >
            <SideNav open={sideNav} setOpen={setSideNav} />
            <div className="flex flex-col w-full overflow-y-auto col-start-2 pl-30 max-sm:pl-0 max-w-[2500px] mx-auto scrollbar-hide">
              {children}
            </div>
          </div>
        )}

        <Help />
      </div>
    </RoleLayout>
  );
}
