import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LEAD_WEBHOOK_CONTRACT, sendLeadWebhook, signLeadWebhookBody } from "@/lib/lead-delivery";

const NOW = new Date("2026-10-09T21:16:00.000Z");
const SECRET = "test-webhook-secret";
const PLAIN_URL = "https://intake.example.test/hfd/leads";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubFetch() {
  const fetchMock = vi.fn(async () => new Response("accepted", { status: 202 }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("lead webhook signature", () => {
  it("signs the exact JSON body that is sent and puts the secret only in the header", async () => {
    vi.stubEnv("LEAD_WEBHOOK_URL", PLAIN_URL);
    vi.stubEnv("LEAD_WEBHOOK_SECRET", SECRET);
    const fetchMock = stubFetch();

    const result = await sendLeadWebhook(
      { id: "lead_test", name: "TEST LEAD — DO NOT CONTACT", service: "Dental implants" },
      "hartdentalyv@hotmail.com",
      [{ channel: "smtp", ok: false, detail: "SMTP_HOST/USER/PASS not fully configured" }],
      NOW,
    );

    expect(result).toEqual({ channel: "webhook", ok: true, detail: undefined });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(PLAIN_URL);
    expect(url).not.toContain(SECRET);
    const rawBody = String(init.body);
    const headers = init.headers as Record<string, string>;
    const expectedHex = createHmac("sha256", SECRET).update(rawBody).digest("hex");
    expect(signLeadWebhookBody(SECRET, rawBody)).toBe(expectedHex);
    expect(headers["X-HFD-Signature"]).toBe(`sha256=${expectedHex}`);
    expect(headers["X-HFD-Timestamp"]).toBe(String(Math.floor(NOW.getTime() / 1000)));
    expect(headers["X-HFD-Lead-Contract"]).toBe(LEAD_WEBHOOK_CONTRACT);
    expect(headers["Content-Type"]).toBe("application/json");
    expect(rawBody).toContain("\"contractVersion\":\"hfd-website-lead-1\"");
    expect(JSON.parse(rawBody).notifyInbox).toBe("hartdentalyv@hotmail.com");
  });

  it("does not call fetch when the URL contains a query token", async () => {
    const token = "super-secret-query-token";
    vi.stubEnv("LEAD_WEBHOOK_URL", `https://intake.example.test/hfd/leads?token=${token}`);
    vi.stubEnv("LEAD_WEBHOOK_SECRET", SECRET);
    const fetchMock = stubFetch();

    const result = await sendLeadWebhook({ id: "lead_test" }, "hartdentalyv@hotmail.com", [], NOW);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(result.detail).toMatch(/no query string/);
    expect(result.detail).not.toContain(token);
  });

  it("does not call fetch when the URL embeds userinfo or a fragment", async () => {
    const fetchMock = stubFetch();
    vi.stubEnv("LEAD_WEBHOOK_SECRET", SECRET);

    vi.stubEnv("LEAD_WEBHOOK_URL", "https://hookuser:hookpass@intake.example.test/hfd/leads");
    const userinfo = await sendLeadWebhook({ id: "lead_test" }, "hartdentalyv@hotmail.com", [], NOW);
    expect(userinfo.ok).toBe(false);
    expect(userinfo.detail).toMatch(/embedded credentials/);
    expect(userinfo.detail).not.toContain("hookpass");

    vi.stubEnv("LEAD_WEBHOOK_URL", "https://intake.example.test/hfd/leads#token=fragment-secret");
    const fragment = await sendLeadWebhook({ id: "lead_test" }, "hartdentalyv@hotmail.com", [], NOW);
    expect(fragment.ok).toBe(false);
    expect(fragment.detail).toMatch(/no query string/);
    expect(fragment.detail).not.toContain("fragment-secret");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not call fetch when the secret or the URL is missing", async () => {
    const fetchMock = stubFetch();

    vi.stubEnv("LEAD_WEBHOOK_URL", PLAIN_URL);
    vi.stubEnv("LEAD_WEBHOOK_SECRET", "");
    const missingSecret = await sendLeadWebhook({ id: "lead_test" }, "hartdentalyv@hotmail.com", [], NOW);
    expect(missingSecret).toEqual({ channel: "webhook", ok: false, detail: "LEAD_WEBHOOK_SECRET not set" });

    vi.stubEnv("LEAD_WEBHOOK_URL", "");
    vi.stubEnv("LEAD_WEBHOOK_SECRET", SECRET);
    const missingUrl = await sendLeadWebhook({ id: "lead_test" }, "hartdentalyv@hotmail.com", [], NOW);
    expect(missingUrl).toEqual({ channel: "webhook", ok: false, detail: "LEAD_WEBHOOK_URL not set" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
