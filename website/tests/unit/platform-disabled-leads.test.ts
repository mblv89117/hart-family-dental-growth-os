import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { deliverLeadEmail } from "@/lib/lead-delivery";
import { resetEnvCache } from "@/server/env";

vi.mock("@/lib/lead-delivery", () => ({
  deliverLeadEmail: vi.fn(async () => ({
    emailDelivered: true,
    recipients: ["hartdentalyv@hotmail.com"],
    deliveries: [{ channel: "mock", ok: true, detail: "mock" }],
  })),
}));

describe("platform-disabled public lead compatibility", () => {
  beforeEach(() => {
    process.env.GROWTH_OS_PLATFORM_ENABLED = "false";
    process.env.OPS_ENABLED = "false";
    (process.env as Record<string, string>)["NODE_ENV"] = "test";
    process.env.AUTH_MODE = "local_credentials";
    // Intentionally no DATABASE_URL required for legacy path
    delete process.env.DATABASE_URL;
    delete process.env.AUTH_SECRET;
    resetEnvCache();
    vi.resetModules();
    vi.mocked(deliverLeadEmail).mockClear();
  });

  afterEach(() => {
    resetEnvCache();
  });

  it("legacy lead path succeeds without PostgreSQL", async () => {
    const { POST } = await import("@/app/api/leads/route");
    const req = new NextRequest("http://localhost/api/leads", {
      method: "POST",
      body: JSON.stringify({
        name: "Legacy Lead",
        phone: "7605554001",
        email: "legacy@example.test",
        location: "yucca-valley",
        smsConsent: "yes",
        formType: "appointment",
        service: "New patient",
        utm_source: "direct",
      }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.id).toMatch(/^lead_/);
    expect(json.emailDelivered).toBe(true);
    expect(json.notifyInbox).toBe("hartdentalyv@hotmail.com");
  });

  it("rejects an unknown office instead of defaulting to Yucca Valley", async () => {
    const { POST } = await import("@/app/api/leads/route");
    const req = new NextRequest("http://localhost/api/leads", {
      method: "POST",
      body: JSON.stringify({
        name: "Synthetic Patient",
        phone: "7605554003",
        email: "synthetic@example.test",
        location: "either",
        smsConsent: "yes",
      }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(deliverLeadEmail).not.toHaveBeenCalled();
  });

  it("platform enabled without database fails closed (no legacy fallback)", async () => {
    process.env.GROWTH_OS_PLATFORM_ENABLED = "true";
    process.env.DATABASE_URL = "postgresql://invalid:invalid@127.0.0.1:1/nope";
    process.env.AUTH_SECRET = "test-auth-secret-min-32-characters!!";
    resetEnvCache();
    vi.resetModules();
    const { POST } = await import("@/app/api/leads/route");
    const req = new NextRequest("http://localhost/api/leads", {
      method: "POST",
      body: JSON.stringify({
        name: "Should Fail",
        phone: "7605554002",
        email: "fail@example.test",
        location: "yucca-valley",
        smsConsent: "yes",
      }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(503);
    expect(json.ok).toBe(false);
    expect(json.error).not.toMatch(/prisma|stack|password/i);
  });
});
