import type { Metadata } from "next";
import { SITE_URL } from "@/src/config";

/** The address of a page on this site, for canonical links, sharing cards and the sitemap. */
export const absoluteUrl = (path: string): string => `${SITE_URL}${path === "/" ? "" : path}`;

/** Search and sharing details for one page: its own address as canonical, and the same text on sharing cards. */
export function pageMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "My Course Companion",
      title,
      description,
      url: path,
      images: image ? [image] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
}
