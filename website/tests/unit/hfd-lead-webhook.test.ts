import { createHmac } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import nodemailer from "nodemailer";
import { deliverLeadEmail } from "@/lib/lead-delivery";
import {
  buildHfdWebsiteLeadPayload,
  hfdLeadSignatureHeader,
  hfdLeadSignatureHex,
  payloadHasForbiddenKeys,
  postSignedHfdWebsiteLead,
  serializeHfdWebsiteLeadPayload,
} from "@/lib/hfd-lead-webhook";

vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: vi.fn(async () => ({ messageId: "synthetic-message" })),
    }),
  },
}));

const SECRET = "synthetic-secret";
const TIMESTAMP = "1700000000";
const RAW = '{"office":"yucca-valley","name":"Synthetic Patient"}';
const EXPECTED_HEX = "80e637a930c878d9c1213a0c791b7656f771f5bba69f4176ada9143c309967d3";

function syntheticLead(office: string) {
  return {
    id: "lead_synthetic_1",
    receivedAt: "2026-10-28T00:00:00.000Z",
    owner: "Wendy Delgado",
    userAgent: "synthetic-agent",
    formType: "appointment",
    name: "Synthetic Patient",
    phone: "7605550199",
    email: "synthetic@example.test",
    location: office,
    service: "New patient visit",
    followUp: "phone",
    message: "TEST LEAD — DO NOT CONTACT",
    smsConsent: true,
    emailConsent: false,
    pagePath: "/contact",
    utm_source: "synthetic",
    utm_medium: "test",
    utm_campaign: "unit",
    notifyInbox: "hartdentalyv@hotmail.com",
    deliveries: [{ channel: "smtp", ok: true }],
  };
}

describe("hfd website lead webhook contract", () => {
  beforeEach(() => {
    process.env.HFD_WEBSITE_LEAD_WEBHOOK_SECRET = SECRET;
    delete process.env.LEAD_WEBHOOK_URL;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.HFD_WEBSITE_LEAD_WEBHOOK_SECRET;
  });

  it("signs timestamp.rawBody as sha256=<hex>", () => {
    expect(hfdLeadSignatureHex(SECRET, TIMESTAMP, RAW)).toBe(EXPECTED_HEX);
    expect(hfdLeadSignatureHeader(SECRET, TIMESTAMP, RAW)).toBe(`sha256=${EXPECTED_HEX}`);
    const withoutDot = createHmac("sha256", SECRET).update(TIMESTAMP + RAW).digest("hex");
    expect(withoutDot).not.toBe(EXPECTED_HEX);
  });

  it("maps Yucca Valley and Desert Hot Springs and strips internal fields", () => {
    for (const office of ["yucca-valley", "desert-hot-springs"] as const) {
      const built = buildHfdWebsiteLeadPayload(syntheticLead(office));
      expect(built.ok).toBe(true);
      if (!built.ok) continue;
      expect(built.payload.office).toBe(office);
      expect(built.payload.contract).toBe("hfd-website-lead-1");
      const raw = serializeHfdWebsiteLeadPayload(built.payload);
      expect(payloadHasForbiddenKeys(raw)).toBe(false);
      expect(raw).not.toContain("notifyInbox");
      expect(raw).not.toContain("hartdental");
      expect(raw).not.toContain("formsubmit");
    }
  });

  it("fails closed on unknown or ambiguous office and does not call fetch", async () => {
    const fetchImpl = vi.fn();
    for (const office of ["", "either", "Yucca Valley", "yucca", "desert-hot-springs "]) {
      const result = await postSignedHfdWebsiteLead(syntheticLead(office), { fetchImpl });
      expect(result.ok).toBe(false);
      expect(result.detail).toBe("office_not_explicit");
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts the signed contract to the canonical route", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 202 }));
    const result = await postSignedHfdWebsiteLead(syntheticLead("desert-hot-springs"), {
      nowMs: 1_700_000_000_000,
      fetchImpl,
    });
    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.360growthsolution.com/api/webhooks/hfd-website-lead");
    const headers = init.headers as Record<string, string>;
    expect(headers["X-HFD-Lead-Contract"]).toBe("hfd-website-lead-1");
    expect(headers["X-HFD-Timestamp"]).toBe("1700000000");
    const raw = String(init.body);
    expect(headers["X-HFD-Signature"]).toBe(hfdLeadSignatureHeader(SECRET, "1700000000", raw));
    const parsed = JSON.parse(raw) as { office: string };
    expect(parsed.office).toBe("desert-hot-springs");
    expect(payloadHasForbiddenKeys(raw)).toBe(false);
  });

  it("uses LEAD_WEBHOOK_URL when it is https", async () => {
    process.env.LEAD_WEBHOOK_URL = "https://api.360growthsolution.com/api/webhooks/hfd-website-lead";
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    await postSignedHfdWebsiteLead(syntheticLead("yucca-valley"), { fetchImpl });
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(process.env.LEAD_WEBHOOK_URL);
  });

  it("does not post when the secret is missing", async () => {
    delete process.env.HFD_WEBSITE_LEAD_WEBHOOK_SECRET;
    const fetchImpl = vi.fn();
    const result = await postSignedHfdWebsiteLead(syntheticLead("yucca-valley"), { fetchImpl });
    expect(result.detail).toBe("secret_not_configured");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("keeps SMTP delivery when the webhook runs beside it and never calls formsubmit", async () => {
    process.env.SMTP_HOST = "smtp.example.test";
    process.env.SMTP_USER = "synthetic@example.test";
    process.env.SMTP_PASS = "synthetic-pass";
    process.env.SMTP_FROM = "synthetic@example.test";
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchImpl);

    const result = await deliverLeadEmail(syntheticLead("yucca-valley"), "hartdentalyv@hotmail.com");

    expect(result.emailDelivered).toBe(true);
    expect(result.deliveries.some((d) => d.channel === "smtp" && d.ok)).toBe(true);
    expect(result.deliveries.some((d) => d.channel === "hfd-website-lead" && d.ok)).toBe(true);
    expect(result.deliveries.some((d) => d.channel === "formsubmit")).toBe(false);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchImpl.mock.calls[0]?.[0]);
    expect(calledUrl).not.toContain("formsubmit.co");
    expect(calledUrl).toBe("https://api.360growthsolution.com/api/webhooks/hfd-website-lead");
    expect(nodemailer.createTransport).toBeTypeOf("function");
  });

  it("fails email closed without a third-party fallback when SMTP and Resend are unset", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 401 }));
    vi.stubGlobal("fetch", fetchImpl);
    const result = await deliverLeadEmail(syntheticLead("yucca-valley"), "hartdentalyv@hotmail.com");
    expect(result.emailDelivered).toBe(false);
    expect(result.deliveries.some((d) => d.detail === "smtp_and_resend_unavailable")).toBe(true);
    expect(result.deliveries.some((d) => d.channel === "hfd-website-lead" && d.detail === "status_401")).toBe(true);
    const urls = fetchImpl.mock.calls.map((call) => String(call[0]));
    expect(urls.some((url) => url.includes("formsubmit.co"))).toBe(false);
  });

  it("does not email or post when the office is not explicit", async () => {
    process.env.SMTP_HOST = "smtp.example.test";
    process.env.SMTP_USER = "synthetic@example.test";
    process.env.SMTP_PASS = "synthetic-pass";
    process.env.SMTP_FROM = "synthetic@example.test";
    const fetchImpl = vi.fn();
    vi.stubGlobal("fetch", fetchImpl);
    const result = await deliverLeadEmail(syntheticLead("either"), "hartdentalyv@hotmail.com");
    expect(result.emailDelivered).toBe(false);
    expect(result.recipients).toEqual([]);
    expect(result.deliveries[0]?.detail).toBe("office_not_explicit");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
