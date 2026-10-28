import { createHmac } from "crypto";

/**
 * Signed website-lead contract posted to 360 Growth.
 *
 * website-lead-intake.md lives in the private 360 Growth repo and is not in
 * this workspace. Live probes on 2026-10-28 (revision 4e8b1e4) showed:
 * - POST https://api.360growthsolution.com/api/webhooks/hfd-website-lead
 *   without a valid signature → 401 {"error":"invalid_website_lead_auth"}
 * - POST https://api.360growthsolution.com/api/webhooks/hart-website-lead → 404
 *
 * Auth failures all collapse to that 401, including unix vs ISO timestamps,
 * so the timestamp format is not distinguishable until a shared secret is set.
 * This client implements the contract the audit specified:
 * - X-HFD-Lead-Contract: hfd-website-lead-1
 * - X-HFD-Timestamp: unix seconds (UTC)
 * - X-HFD-Signature: sha256=<hex> where hex is HMAC-SHA256 over
 *   `${timestamp}.${rawBody}` using HFD_WEBSITE_LEAD_WEBHOOK_SECRET
 *
 * The body is an allowlist. notifyInbox, deliveries, owner, and userAgent
 * are never included. office is only yucca-valley or desert-hot-springs.
 */
export const HFD_LEAD_CONTRACT = "hfd-website-lead-1";

export const HFD_LEAD_WEBHOOK_URL_DEFAULT =
  "https://api.360growthsolution.com/api/webhooks/hfd-website-lead";

export const EXPLICIT_OFFICES = ["yucca-valley", "desert-hot-springs"] as const;

export type ExplicitOffice = (typeof EXPLICIT_OFFICES)[number];

export type HfdWebsiteLeadPayload = {
  contract: typeof HFD_LEAD_CONTRACT;
  id: string;
  receivedAt: string;
  office: ExplicitOffice;
  formType: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  followUp: string;
  message: string;
  smsConsent: boolean;
  emailConsent: boolean;
  goals: string;
  priorOrtho: string;
  dentalVisit: string;
  concerns: string;
  pagePath: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  gclid: string;
  fbclid: string;
  referrer: string;
};

export type HfdWebhookDelivery = {
  channel: "hfd-website-lead";
  ok: boolean;
  detail?: string;
};

const FORBIDDEN_KEYS = ["notifyInbox", "deliveries", "owner", "userAgent", "location"] as const;

export function explicitOffice(value: unknown): ExplicitOffice | null {
  if (value === "yucca-valley" || value === "desert-hot-springs") return value;
  return null;
}

export function hfdLeadWebhookUrl(): string | null {
  const configured = process.env.LEAD_WEBHOOK_URL?.trim();
  const url = configured || HFD_LEAD_WEBHOOK_URL_DEFAULT;
  if (!url.startsWith("https://")) return null;
  return url;
}

function text(value: unknown, max = 2000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function yes(value: unknown): boolean {
  return value === true || value === "yes";
}

export function buildHfdWebsiteLeadPayload(
  lead: Record<string, unknown>,
): { ok: true; payload: HfdWebsiteLeadPayload } | { ok: false; reason: "office_not_explicit" } {
  const office = explicitOffice(lead.office ?? lead.location);
  if (!office) return { ok: false, reason: "office_not_explicit" };

  const payload: HfdWebsiteLeadPayload = {
    contract: HFD_LEAD_CONTRACT,
    id: text(lead.id, 80),
    receivedAt: text(lead.receivedAt, 40),
    office,
    formType: text(lead.formType, 80) || "appointment",
    name: text(lead.name, 120),
    phone: text(lead.phone, 40),
    email: text(lead.email, 120),
    service: text(lead.service, 80),
    followUp: text(lead.followUp, 40),
    message: text(lead.message, 2000),
    smsConsent: yes(lead.smsConsent),
    emailConsent: yes(lead.emailConsent),
    goals: text(lead.goals, 200),
    priorOrtho: text(lead.priorOrtho, 80),
    dentalVisit: text(lead.dentalVisit, 80),
    concerns: text(lead.concerns, 500),
    pagePath: text(lead.pagePath, 120),
    utm_source: text(lead.utm_source, 80),
    utm_medium: text(lead.utm_medium, 80),
    utm_campaign: text(lead.utm_campaign, 120),
    utm_content: text(lead.utm_content, 120),
    utm_term: text(lead.utm_term, 120),
    gclid: text(lead.gclid, 120),
    fbclid: text(lead.fbclid, 120),
    referrer: text(lead.referrer, 500),
  };

  return { ok: true, payload };
}

export function unixTimestampSeconds(nowMs = Date.now()): string {
  return String(Math.floor(nowMs / 1000));
}

/** HMAC-SHA256 hex of `${timestamp}.${rawBody}`. */
export function hfdLeadSignatureHex(secret: string, timestamp: string, rawBody: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

/** Header value: `sha256=<hex>`. */
export function hfdLeadSignatureHeader(secret: string, timestamp: string, rawBody: string): string {
  return `sha256=${hfdLeadSignatureHex(secret, timestamp, rawBody)}`;
}

export function serializeHfdWebsiteLeadPayload(payload: HfdWebsiteLeadPayload): string {
  return JSON.stringify(payload);
}

export function payloadHasForbiddenKeys(rawBody: string): boolean {
  const parsed = JSON.parse(rawBody) as Record<string, unknown>;
  return FORBIDDEN_KEYS.some((key) => Object.prototype.hasOwnProperty.call(parsed, key));
}

export async function postSignedHfdWebsiteLead(
  lead: Record<string, unknown>,
  options?: { nowMs?: number; fetchImpl?: typeof fetch },
): Promise<HfdWebhookDelivery> {
  const built = buildHfdWebsiteLeadPayload(lead);
  if (!built.ok) {
    return { channel: "hfd-website-lead", ok: false, detail: "office_not_explicit" };
  }

  const secret = process.env.HFD_WEBSITE_LEAD_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return { channel: "hfd-website-lead", ok: false, detail: "secret_not_configured" };
  }

  const url = hfdLeadWebhookUrl();
  if (!url) {
    return { channel: "hfd-website-lead", ok: false, detail: "webhook_url_not_https" };
  }

  const rawBody = serializeHfdWebsiteLeadPayload(built.payload);
  const timestamp = unixTimestampSeconds(options?.nowMs);
  const signature = hfdLeadSignatureHeader(secret, timestamp, rawBody);
  const fetchImpl = options?.fetchImpl ?? fetch;

  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HFD-Lead-Contract": HFD_LEAD_CONTRACT,
        "X-HFD-Timestamp": timestamp,
        "X-HFD-Signature": signature,
      },
      body: rawBody,
    });
    return {
      channel: "hfd-website-lead",
      ok: res.ok,
      detail: res.ok ? "accepted" : `status_${res.status}`,
    };
  } catch {
    return { channel: "hfd-website-lead", ok: false, detail: "network_error" };
  }
}
