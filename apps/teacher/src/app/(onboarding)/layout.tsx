"use client";

import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@mcc/features";
import { useRouter, useSearchParams } from "next/navigation";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Layouts don't get a server-resolved searchParams prop the way page.tsx
  // does (see onboarding/page.tsx), so this can only read the real value
  // client-side via the hook. Reading it straight into the render body would
  // mismatch a statically-prerendered shell (server: no request, empty
  // params) against the client's real URL on the very first hydration pass.
  // Deferring the read to an effect keeps the first client render identical
  // to the server's (both start from `false`), then corrects on the next
  // tick -- the same safe pattern useAuth()'s own `hydrated` flag already
  // relies on below.
  const [isPreview, setIsPreview] = useState(false);
  const [previewChecked, setPreviewChecked] = useState(false);

  useEffect(() => {
    // Deliberately deferred, not derived during render: computing this synchronously
    // would reintroduce the hydration mismatch this pattern exists to avoid (see the
    // comment above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPreview(searchParams.get("preview") === "true");
    setPreviewChecked(true);
  }, [searchParams]);

  useEffect(() => {
    if (!previewChecked || isPreview) return;
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [previewChecked, isPreview, hydrated, isAuthenticated, router]);

  if (!previewChecked) return null;
  if (!isPreview && (!hydrated || !isAuthenticated)) return null;

  return (
    <>
      {isPreview && (
        <div className="bg-btn-primary/10 border-b border-btn-primary/30 px-8 py-2 text-center text-sm font-medium text-btn-primary">
          Preview mode — nothing you enter here is saved to a real account.
        </div>
      )}
      {children}
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col h-screen">
      <Suspense fallback={null}>
        <AuthGate>
          <div className="py-6 px-8 max-sm:hidden">
            <p className="text-xl font-semibold text-primary">MCC Teacher</p>
          </div>
          <div className="h-full flex-1 max-sm:px-6">{children}</div>
          <div className="flex items-center justify-center px-16 py-6 text-sm max-sm:px-3">
            <p className="text-muted">© 2026 MC Companion Teacher</p>
          </div>
        </AuthGate>
      </Suspense>
    </section>
  );
}
