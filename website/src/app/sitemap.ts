import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const paths = [
  "/",
  "/yucca-valley",
  "/desert-hot-springs",
  "/dental-implants",
  "/full-mouth-dental-implants",
  "/teeth-straightening",
  "/smile-assessment",
  "/cosmetic-dentistry",
  "/restorative-dentistry",
  "/emergency-dentistry",
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
  return paths.map((path) => ({
    url: `${site.domain}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
