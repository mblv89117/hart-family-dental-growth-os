import { describe, expect, it } from "vitest";
import { HSTS_VALUE, hstsEnabledFromEnv, securityHeaders } from "@/lib/security-headers";

describe("security headers", () => {
  it("omits HSTS unless the Azure image build opts in", () => {
    const keys = securityHeaders(false).map((header) => header.key);
    expect(keys).not.toContain("Strict-Transport-Security");
    expect(keys).toContain("Content-Security-Policy");
    expect(hstsEnabledFromEnv({})).toBe(false);
    expect(hstsEnabledFromEnv({ HFD_ENABLE_HSTS: "true" })).toBe(true);
  });

  it("emits HSTS for the container image", () => {
    const hsts = securityHeaders(true).find((header) => header.key === "Strict-Transport-Security");
    expect(hsts?.value).toBe(HSTS_VALUE);
  });

  it("allows GA4 collect on www.google.com without dropping the other security headers", () => {
    const csp = securityHeaders(false).find((header) => header.key === "Content-Security-Policy");
    expect(csp?.value).toContain("connect-src");
    expect(csp?.value).toContain("https://www.google.com");
    expect(csp?.value).toContain("https://*.google-analytics.com");
    expect(csp?.value).not.toContain("formsubmit.co");
  });
});
