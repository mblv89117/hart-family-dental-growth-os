import { describe, expect, it } from "vitest";
import {
  IMPLANT_OFFER,
  IMPLANT_OFFER_DISCLOSURE,
  implantOfferContainsForbiddenLanguage,
} from "@/lib/implant-offer";
import { officeFromSearch, parseOfficeParam, FORBIDDEN_URL_PARAM_KEYS } from "@/lib/office-context";

describe("implant offer disclosures", () => {
  it("states the $999 normal fee with provisional PMMA and extra fees", () => {
    expect(IMPLANT_OFFER.title).toContain("$999");
    expect(IMPLANT_OFFER.title).toContain("PMMA");
    expect(IMPLANT_OFFER_DISCLOSURE.toLowerCase()).toContain("provisional");
    expect(IMPLANT_OFFER_DISCLOSURE).toContain("1,100");
    expect(IMPLANT_OFFER_DISCLOSURE).toContain("$100");
    expect(IMPLANT_OFFER_DISCLOSURE.toLowerCase()).toContain("exam");
    expect(IMPLANT_OFFER_DISCLOSURE.toLowerCase()).toContain("carecredit");
    expect(implantOfferContainsForbiddenLanguage(IMPLANT_OFFER_DISCLOSURE)).toEqual([]);
  });
});

describe("office routing context", () => {
  it("accepts only Yucca or DHS office slugs", () => {
    expect(parseOfficeParam("yucca-valley")).toBe("yucca-valley");
    expect(parseOfficeParam("desert-hot-springs")).toBe("desert-hot-springs");
    expect(parseOfficeParam("california")).toBeNull();
    expect(officeFromSearch("?office=yucca-valley&gclid=abc")).toBe("yucca-valley");
  });

  it("does not treat patient fields as permitted URL parameters", () => {
    expect(FORBIDDEN_URL_PARAM_KEYS).toEqual(
      expect.arrayContaining(["name", "email", "phone", "patient", "transcript"]),
    );
  });
});
