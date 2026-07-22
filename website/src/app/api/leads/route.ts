import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { getLocationById, leadOwner } from "@/lib/locations";
import { deliverLeadEmail } from "@/lib/lead-delivery";

export const runtime = "nodejs";

type LeadBody = {
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  service?: string;
  followUp?: string;
  message?: string;
  smsConsent?: string;
  emailConsent?: string;
  formType?: string;
  goals?: string;
  priorOrtho?: string;
  dentalVisit?: string;
  concerns?: string;
  companyWebsite?: string;
  pagePath?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
};

function sanitize(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function officeInbox(locationId: string) {
  const loc = getLocationById(locationId);
  return loc?.leadNotifyEmail || "hartdentalyv@hotmail.com";
}

export async function POST(req: NextRequest) {
  let body: LeadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (sanitize(body.companyWebsite, 80)) {
    return NextResponse.json({ ok: true, id: `lead_spam_${Date.now()}`, emailDelivered: false });
  }

  const lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: new Date().toISOString(),
    owner: leadOwner.name,
    formType: sanitize(body.formType, 80) || "appointment",
    name: sanitize(body.name, 120),
    phone: sanitize(body.phone, 40),
    email: sanitize(body.email, 120),
    location: sanitize(body.location, 40),
    service: sanitize(body.service, 80),
    followUp: sanitize(body.followUp, 40),
    message: sanitize(body.message, 2000),
    smsConsent: body.smsConsent === "yes",
    emailConsent: body.emailConsent === "yes",
    goals: sanitize(body.goals, 200),
    priorOrtho: sanitize(body.priorOrtho, 80),
    dentalVisit: sanitize(body.dentalVisit, 80),
    concerns: sanitize(body.concerns, 500),
    pagePath: sanitize(body.pagePath, 120),
    utm_source: sanitize(body.utm_source, 80),
    utm_medium: sanitize(body.utm_medium, 80),
    utm_campaign: sanitize(body.utm_campaign, 120),
    utm_content: sanitize(body.utm_content, 120),
    utm_term: sanitize(body.utm_term, 120),
    gclid: sanitize(body.gclid, 120),
    fbclid: sanitize(body.fbclid, 120),
    referrer: sanitize(body.referrer, 500),
    userAgent: req.headers.get("user-agent")?.slice(0, 200) || "",
  };

  if (!lead.name || !lead.phone || !lead.email || !lead.location) {
    return NextResponse.json(
      { ok: false, error: "Name, phone, email, and preferred office are required." },
      { status: 400 },
    );
  }

  if (!lead.smsConsent) {
    return NextResponse.json({ ok: false, error: "SMS consent is required for appointment follow-up." }, { status: 400 });
  }

  const primaryInbox = officeInbox(lead.location);

  try {
    const dir = path.join(process.cwd(), "..", "data", "leads");
    await mkdir(dir, { recursive: true });
    await appendFile(
      path.join(dir, "leads.jsonl"),
      `${JSON.stringify({ ...lead, notifyInbox: primaryInbox })}\n`,
      "utf8",
    );
  } catch (err) {
    console.error("[leads] local write failed", err);
  }

  const { deliveries, emailDelivered, recipients } = await deliverLeadEmail(lead, primaryInbox);

  console.info("[HFD lead]", {
    id: lead.id,
    location: lead.location,
    service: lead.service,
    formType: lead.formType,
    notifyInbox: primaryInbox,
    recipients,
    emailDelivered,
    deliveries,
  });

  // Accept the lead record, but never imply email succeeded when it did not.
  return NextResponse.json({
    ok: true,
    id: lead.id,
    notifyInbox: primaryInbox,
    recipients,
    emailDelivered,
    deliveries: deliveries.map((d) => ({
      channel: d.channel,
      ok: d.ok,
      detail: d.ok ? d.detail : d.detail,
    })),
  });
}
