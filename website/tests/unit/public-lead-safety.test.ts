import { describe, expect, it } from "vitest";
import { pageLocationWithoutSensitiveQuery, referrerWithoutQuery, sanitizeAnalyticsParams } from "@/lib/analytics-privacy";
import { officeFromPathname, officeFromTel, resolveOfficeId, thankYouPath } from "@/lib/office-routing";
import { canonicalRedirectUrl } from "@/lib/public-host";

describe("office routing", () => {
  it("accepts only the two office ids", () => {
    expect(resolveOfficeId("yucca-valley")).toBe("yucca-valley");
    expect(resolveOfficeId(" Desert-Hot-Springs ")).toBe("desert-hot-springs");
    expect(resolveOfficeId("both")).toBeNull();
    expect(resolveOfficeId("either")).toBeNull();
    expect(resolveOfficeId("")).toBeNull();
    expect(resolveOfficeId("yucca valley")).toBeNull();
  });

  it("reads the office from a location path and not from the homepage", () => {
    expect(officeFromPathname("/locations/yucca-valley")).toBe("yucca-valley");
    expect(officeFromPathname("/locations/desert-hot-springs/")).toBe("desert-hot-springs");
    expect(officeFromPathname("/contact")).toBeNull();
    expect(officeFromPathname("/")).toBeNull();
  });

  it("maps the published CallRail numbers", () => {
    expect(officeFromTel("tel:+17603897707")).toBe("yucca-valley");
    expect(officeFromTel("tel:+17603144160")).toBe("desert-hot-springs");
    expect(officeFromTel("tel:+17603656595")).toBeNull();
  });

  it("keeps clinical service text out of the thank-you URL", () => {
    expect(thankYouPath("yucca-valley")).toBe("/thank-you?location=yucca-valley");
    expect(thankYouPath("both")).toBe("/thank-you");
  });
});

describe("analytics privacy", () => {
  it("drops form contents and clinical service text", () => {
    expect(
      sanitizeAnalyticsParams({
        formType: "appointment",
        location: "yucca-valley",
        path: "/contact?service=tooth-pain",
        service: "Tooth pain / broken tooth",
        email: "patient@example.com",
        phone: "7605550100",
        message: "my tooth hurts",
        name: "Pat Example",
      }),
    ).toEqual({
      formType: "appointment",
      location: "yucca-valley",
      path: "/contact",
    });
  });

  it("strips sensitive query keys and keeps campaign params", () => {
    const safe = pageLocationWithoutSensitiveQuery(
      "https://hfdds.net/thank-you?location=yucca-valley&service=Tooth%20pain&utm_source=gbp&email=a@b.com",
    );
    const url = new URL(safe);
    expect(url.searchParams.get("location")).toBe("yucca-valley");
    expect(url.searchParams.get("utm_source")).toBe("gbp");
    expect(url.searchParams.has("service")).toBe(false);
    expect(url.searchParams.has("email")).toBe(false);
  });

  it("stores referrers without query strings", () => {
    expect(referrerWithoutQuery("https://www.google.com/search?q=tooth+pain+yucca")).toBe("https://www.google.com/search");
  });
});

describe("canonical host", () => {
  it("redirects www to the apex canonical host and leaves other hosts alone", () => {
    expect(canonicalRedirectUrl("www.hfdds.net", "/locations/yucca-valley", "?utm_source=gbp")).toBe(
      "https://hfdds.net/locations/yucca-valley?utm_source=gbp",
    );
    expect(canonicalRedirectUrl("hfdds.net", "/", "")).toBeNull();
    expect(canonicalRedirectUrl("hart-family-dental.vercel.app", "/", "")).toBeNull();
  });
});
