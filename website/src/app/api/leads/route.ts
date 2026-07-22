import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";

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
  // smile assessment extras
  goals?: string;
  priorOrtho?: string;
  dentalVisit?: string;
  concerns?: string;
};

function sanitize(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
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
    owner: "Wendy Delgado",
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

  // Local durable log (gitignored). Replace/augment with CRM webhook before ads.
  try {
    const dir = path.join(process.cwd(), "..", "data", "leads");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "leads.jsonl"), `${JSON.stringify(lead)}\n`, "utf8");
  } catch (err) {
    console.error("[leads] local write failed", err);
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch (err) {
      console.error("[leads] webhook failed", err);
    }
  }

  console.info("[HFD lead]", { id: lead.id, location: lead.location, service: lead.service, formType: lead.formType });

  return NextResponse.json({ ok: true, id: lead.id });
}
