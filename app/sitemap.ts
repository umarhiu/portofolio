import type { MetadataRoute } from "next";
import { projects, site } from "@/lib/content";

const SITE_URL = "https://example.com"; // TODO: replace with the real domain before launch.

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(site.lastUpdated);
  const home: MetadataRoute.Sitemap[number] = {
    url: SITE_URL,
    lastModified,
    changeFrequency: "monthly",
    priority: 1,
  };
  const work = projects.map((project) => ({
    url: `${SITE_URL}/work/${project.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [home, ...work];
}
