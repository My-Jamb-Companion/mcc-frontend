"use client";

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
        className="grid max-sm:grid-cols-1 h-full relative overflow-hidden bg-muted/10"
        style={{gridTemplateColumns: "auto 1fr"}}
      >
        <SideNav />
        <div className="flex flex-col w-full overflow-y-auto col-start-2 max-sm:pl-0 scrollbar-hide p-2">
          <div className="bg-white border border-muted/20 rounded-3xl h-full">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
