import type { NextConfig } from "next";
import { hstsEnabledFromEnv, securityHeaders } from "./src/lib/security-headers";
import { legacyRedirects } from "./src/lib/services";

// HSTS is included only when HFD_ENABLE_HSTS=true at build time (the Azure
// image). Local `next dev` and the current Vercel build leave it unset so
// HTTP localhost QA is not pinned to HTTPS. Azure Container Apps ingress
// does not inject response headers; the image emits Strict-Transport-Security.

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    // Explicit 301 (not 308) for SEO-friendly permanent redirects from legacy routes.
    return Object.entries(legacyRedirects).map(([source, destination]) => ({
      source,
      destination: String(destination),
      statusCode: 301 as const,
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(hstsEnabledFromEnv()),
      },
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/og/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 150, 200, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
