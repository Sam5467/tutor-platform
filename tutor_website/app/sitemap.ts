import type { MetadataRoute } from "next";

const SITE_URL = "https://www.passalonglb.com";

// The public pages Google should know about (see also robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.7 },
    { path: "/signup", priority: 0.6 },
    { path: "/contact", priority: 0.5 },
    { path: "/terms", priority: 0.3 },
    { path: "/privacy", priority: 0.3 },
  ];
  return pages.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));
}
