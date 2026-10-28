/** Response headers shared by next.config. HSTS is opt-in so local HTTP QA is unchanged. */

export const HSTS_VALUE = "max-age=63072000; includeSubDomains";

export type Header = { key: string; value: string };

export function securityHeaders(enableHsts: boolean): Header[] {
  const headers: Header[] = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://connect.facebook.net",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://www.facebook.com https://connect.facebook.net",
        "frame-src 'self' https://www.google.com https://maps.google.com https://www.googletagmanager.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
      ].join("; "),
    },
  ];

  if (enableHsts) {
    headers.push({ key: "Strict-Transport-Security", value: HSTS_VALUE });
  }

  return headers;
}

/** True only when the production image build sets HFD_ENABLE_HSTS=true. */
export function hstsEnabledFromEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return (env.HFD_ENABLE_HSTS || "").toLowerCase() === "true";
}
