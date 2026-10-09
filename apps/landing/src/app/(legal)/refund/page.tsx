import type { Metadata } from "next";
import { legalMetadata } from "@/src/features/legal/content";
import { LegalPage } from "@/src/features/legal/LegalPage";

// Refreshed with the home page, so the text, header and footer follow what an admin publishes.
export const revalidate = 60;

export const generateMetadata = (): Promise<Metadata> => legalMetadata("refund");

export default function Page() {
  return <LegalPage slug="refund" />;
}
