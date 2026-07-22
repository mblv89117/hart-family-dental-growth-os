import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { getLocationById, leadOwner } from "@/lib/locations";

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
};

function sanitize(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function officeInbox(locationId: string) {
  const loc = getLocationById(locationId);
  return loc?.leadNotifyEmail || "hartdentalyv@hotmail.com";
}

async function notifyHotmailInboxes(lead: Record<string, unknown>, primaryInbox: string) {
  const deliveries: Array<{ channel: string; ok: boolean; detail?: string }> = [];

  const subject = `[HFD Lead] ${lead.formType || "request"} — ${lead.location || "office"} — ${lead.name}`;
  const text = [
    `Owner: ${leadOwner.name} (${leadOwner.scope})`,
    `ID: ${lead.id}`,
    `Received: ${lead.receivedAt}`,
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Location: ${lead.location}`,
    `Service: ${lead.service}`,
    `Follow-up: ${lead.followUp}`,
    `Form: ${lead.formType}`,
    `Message: ${lead.message || "(none)"}`,
    `SMS consent: ${lead.smsConsent}`,
    `Email consent: ${lead.emailConsent}`,
    "",
    "Respond during business hours. Sat/Sun closed.",
  ].join("\n");

  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL || "Hart Family Dental Leads <onboarding@resend.dev>";
  const cc = (process.env.LEAD_CC_EMAILS || "hartdental@gmail.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [primaryInbox],
          cc: cc.filter((e) => e !== primaryInbox),
          subject,
          text,
        }),
      });
      deliveries.push({
        channel: "resend",
        ok: res.ok,
        detail: res.ok ? undefined : `status ${res.status}`,
      });
    } catch (err) {
      deliveries.push({ channel: "resend", ok: false, detail: String(err) });
    }
  }

  // Hotmail delivery without storing passwords: FormSubmit ajax to office inbox.
  // First-time use may require a one-click confirmation in that Hotmail inbox.
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(primaryInbox)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: subject,
        _template: "table",
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        location: lead.location,
        service: lead.service,
        followUp: lead.followUp,
        formType: lead.formType,
        message: lead.message || "",
        owner: leadOwner.name,
        leadId: lead.id,
        replyto: lead.email,
      }),
    });
    deliveries.push({
      channel: "formsubmit-hotmail",
      ok: res.ok,
      detail: res.ok ? primaryInbox : `status ${res.status}`,
    });
  } catch (err) {
    deliveries.push({ channel: "formsubmit-hotmail", ok: false, detail: String(err) });
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, notifyInbox: primaryInbox, deliveries }),
      });
      deliveries.push({ channel: "webhook", ok: res.ok, detail: res.ok ? undefined : `status ${res.status}` });
    } catch (err) {
      deliveries.push({ channel: "webhook", ok: false, detail: String(err) });
    }
  }

  return deliveries;
}

export async function POST(req: NextRequest) {
  let body: LeadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
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

  let deliveries: Array<{ channel: string; ok: boolean; detail?: string }> = [];
  try {
    deliveries = await notifyHotmailInboxes(lead, primaryInbox);
  } catch (err) {
    console.error("[leads] notify failed", err);
    deliveries = [{ channel: "notify", ok: false, detail: String(err) }];
  }

  console.info("[HFD lead]", {
    id: lead.id,
    location: lead.location,
    service: lead.service,
    formType: lead.formType,
    notifyInbox: primaryInbox,
    deliveries,
  });

  return NextResponse.json({ ok: true, id: lead.id, notifyInbox: primaryInbox });
}
