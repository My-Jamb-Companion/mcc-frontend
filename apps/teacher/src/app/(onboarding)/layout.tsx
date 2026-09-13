"use client";

import { useAuth } from "@mcc/features";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return null;

  return (
    <section className="flex flex-col h-screen">
      <div className="py-6 px-8 max-sm:hidden">
        <p className="text-xl font-semibold text-primary">MCC Teacher</p>
      </div>
      <div className="h-full flex-1 max-sm:px-6">{children}</div>
      <div className="flex items-center justify-center px-16 py-6 text-sm max-sm:px-3">
        <p className="text-muted">© 2026 MC Companion Teacher</p>
      </div>
    </section>
  );
}
