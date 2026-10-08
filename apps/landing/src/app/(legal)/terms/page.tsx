import type { Metadata } from "next";
import { LegalPage } from "@/src/features/legal/LegalPage";

// Refreshed with the home page, so the header and footer follow what an admin publishes.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Draft, pending legal review.",
};

export default function Page() {
  return <LegalPage slug="terms" />;
}
