import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsentRequest } from "@/src/features/consent/ConsentRequest";

// A private, single-use link from an email: never indexed, and it needs none of the site's providers.
export const metadata: Metadata = {
  title: "Approve a student's account",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ConsentRequest />
    </Suspense>
  );
}
