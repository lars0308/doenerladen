import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/speisekarte", "/ueber-uns", "/kontakt"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/speisekarte" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
