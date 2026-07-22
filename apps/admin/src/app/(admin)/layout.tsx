"use client";

import BreadcrumbsTopNav from "@/src/components/BreadcrumbsTopNav";
import SideNav from "@/src/components/SideNav";
import {useAuth} from "@mcc/features";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

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

  return (
    <section className="flex flex-col h-screen scrollbar-hide">
      <div
        className="grid max-sm:grid-cols-1 h-full relative overflow-hidden bg-[#F7F7FB]"
        style={{gridTemplateColumns: "auto 1fr"}}
      >
        <SideNav />
        <div className="flex flex-col w-full h-full col-start-2 max-sm:pl-0 p-2 overflow-hidden">
          <div className="bg-white border border-muted/20 rounded-3xl h-full flex flex-col overflow-hidden">
            <div className="shrink-0">
              <BreadcrumbsTopNav />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
