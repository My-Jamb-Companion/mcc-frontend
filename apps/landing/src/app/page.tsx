import type { Metadata } from "next";
import { str } from "@mcc/landing-content";
import { getLandingContent } from "@/src/features/home/content";
import { LandingPage } from "@/src/features/home/LandingPage";
import { CaptureAcquisitionSource } from "@/src/features/home/CaptureAcquisitionSource";

// The page is static and refreshed in the background, so it is fast and an admin's publish shows up within about a minute.
// (Next reads this as a literal, so it can't be an imported constant. Keep it equal to REVALIDATE_SECONDS in content.ts.)
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getLandingContent();
  const title = str(site, "seo_title");
  const description = str(site, "seo_description");
  const image = str(site, "og_image_url");
  return {
    title: title ? { absolute: title } : undefined,
    description: description || undefined,
    openGraph: { title: title || undefined, description: description || undefined, images: image ? [image] : undefined },
  };
}

export default async function HomePage() {
  const content = await getLandingContent();
  return (
    <>
      <CaptureAcquisitionSource />
      <LandingPage content={content} />
    </>
  );
}
