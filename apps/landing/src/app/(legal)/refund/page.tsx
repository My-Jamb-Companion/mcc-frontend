import type { Metadata } from "next";
import { DOCUMENTS } from "@/src/features/legal/documents";
import { pageMetadata } from "@/src/features/seo";
import { LegalPage } from "@/src/features/legal/LegalPage";

// Refreshed with the home page, so the header and footer follow what an admin publishes.
export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Refund Policy",
  description: DOCUMENTS.refund.summary,
  path: "/refund",
});

export default function Page() {
  return <LegalPage slug="refund" />;
}
