import type { Metadata } from "next";
import { PreviewClient } from "@/src/features/home/PreviewClient";

export const metadata: Metadata = {
  title: "Landing page preview",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return <PreviewClient />;
}
