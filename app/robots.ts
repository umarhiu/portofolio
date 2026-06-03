import type { MetadataRoute } from "next";

const SITE_URL = "https://example.com"; // TODO: replace with the real domain before launch.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
