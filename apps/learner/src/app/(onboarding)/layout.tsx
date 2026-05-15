"use client";

import { useAuth } from "@mcc/features";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({children}: {children: React.ReactNode}) {
  const { isAuthenticated, hydrated, user } = useAuth();
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
        <h4 className="text-xl">
          <span className="text-primary font-bagel">MC. </span>
          Companion
        </h4>
      </div>
      <div className="h-full flex-1 max-sm:px-6">{children}</div>
      <div className="flex items-center justify-between px-16 py-6 text-sm font-medium max-sm:flex-col w-full max-sm:px-3">
        <p className="text-muted">© 2026 MC companion</p>
        <div className="flex items-center gap-5 max-sm:justify-between">
          <p className="underline text-muted hover:text-primary cursor-pointer">
            Terms and Conditions
          </p>
          <p className="underline text-muted hover:text-primary cursor-pointer">
            Privacy Policy
          </p>
        </div>
      </div>
    </section>
  );
}
