import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/auth/", "/reset-password"],
    },
    sitemap: "https://www.passalonglb.com/sitemap.xml",
  };
}
