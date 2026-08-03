import type { MetadataRoute } from "next";
import { locations } from "@/lib/locations";
import { allServicePaths } from "@/lib/services";
import { site } from "@/lib/site";

const staticPaths = [
  "/",
  "/services",
  "/financing",
  "/new-patients",
  "/about",
  "/providers",
  "/reviews",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/accessibility",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const locationPaths = locations.map((l) => l.path);
  const paths = [...staticPaths, ...locationPaths, ...allServicePaths()];

  return paths.map((path) => ({
    url: `${site.domain}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : path.startsWith("/locations") || path.startsWith("/services") ? 0.8 : 0.6,
  }));
}
