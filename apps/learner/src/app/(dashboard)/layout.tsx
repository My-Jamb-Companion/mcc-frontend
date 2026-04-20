"use client";

import Header from "@/src/features/dashboard/components/Header";
import SideNav from "@/src/features/dashboard/components/SideNav";
import {useAuth} from "@mcc/features";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

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
    <div className="flex flex-col h-screen">
      <Header open={sideNav} setOpen={setSideNav} />
      <div
        className={`grid-cols-[120px_1fr] grid max-sm:grid-cols-1 h-full relative`}
      >
        <SideNav open={sideNav} setOpen={setSideNav} />
        {children}
      </div>
    </div>
  );
}
