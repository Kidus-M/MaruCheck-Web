import type { MetadataRoute } from "next";
import { MARUCHECK_PRODUCTION_ORIGIN } from "@/lib/public-site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: [
        "/accept-invitation",
        "/api/",
        "/contracts",
        "/coverage",
        "/dashboard",
        "/feedback",
        "/findings",
        "/memory",
        "/onboarding",
        "/organization",
        "/projects",
        "/runs",
        "/sign-in",
      ],
      userAgent: "*",
    },
    sitemap: `${MARUCHECK_PRODUCTION_ORIGIN}/sitemap.xml`,
  };
}
