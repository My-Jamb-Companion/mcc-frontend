import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/src/features/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/preview", "/go/", "/payment/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
