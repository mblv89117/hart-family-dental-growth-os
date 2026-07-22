import nodemailer from "nodemailer";
import { leadOwner } from "@/lib/locations";

export type DeliveryResult = {
  channel: string;
  ok: boolean;
  detail?: string;
};

function buildBody(lead: Record<string, unknown>) {
  return [
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
    `Page: ${lead.pagePath || ""}`,
    `UTM: ${lead.utm_source || ""} / ${lead.utm_medium || ""} / ${lead.utm_campaign || ""}`,
    `SMS consent: ${lead.smsConsent}`,
    `Email consent: ${lead.emailConsent}`,
    "",
    "Respond during business hours. Sat/Sun closed.",
    "If this says TEST LEAD — DO NOT CONTACT, mark Spam/Test and stop.",
  ].join("\n");
}

function subjectFor(lead: Record<string, unknown>) {
  return `[HFD Lead] ${lead.formType || "request"} — ${lead.location || "office"} — ${lead.name}`;
}

/** Recipients: primary office Hotmail + optional CC list (Gmail ops). */
export function notifyRecipients(primaryInbox: string) {
  const cc = (process.env.LEAD_CC_EMAILS || "hartdental@gmail.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const all = [primaryInbox.toLowerCase(), ...cc];
  return [...new Set(all)];
}

async function sendViaResend(
  lead: Record<string, unknown>,
  to: string[],
  subject: string,
  text: string,
): Promise<DeliveryResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { channel: "resend", ok: false, detail: "RESEND_API_KEY not set" };

  const from = process.env.RESEND_FROM_EMAIL?.trim() || "Hart Family Dental <onboarding@resend.dev>";
  const [primary, ...rest] = to;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [primary],
        cc: rest.length ? rest : undefined,
        subject,
        text,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      return { channel: "resend", ok: false, detail: `status ${res.status}: ${body.slice(0, 300)}` };
    }
    return { channel: "resend", ok: true, detail: body.slice(0, 200) };
  } catch (err) {
    return { channel: "resend", ok: false, detail: String(err) };
  }
}

async function sendViaSmtp(
  lead: Record<string, unknown>,
  to: string[],
  subject: string,
  text: string,
): Promise<DeliveryResult> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = Number(process.env.SMTP_PORT || "587");
  const from = process.env.SMTP_FROM?.trim() || user;

  if (!host || !user || !pass || !from) {
    return { channel: "smtp", ok: false, detail: "SMTP_HOST/USER/PASS not fully configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    const info = await transporter.sendMail({
      from: `Hart Family Dental Leads <${from}>`,
      to: to.join(", "),
      subject,
      text,
      replyTo: typeof lead.email === "string" ? lead.email : undefined,
    });
    return { channel: "smtp", ok: true, detail: `messageId=${info.messageId}` };
  } catch (err) {
    return { channel: "smtp", ok: false, detail: String(err) };
  }
}

/**
 * FormSubmit is unreliable for Hotmail (activation emails often never arrive).
 * Kept as last-resort only; success requires JSON success===true, not HTTP 200.
 */
async function sendViaFormSubmit(
  lead: Record<string, unknown>,
  inbox: string,
  subject: string,
): Promise<DeliveryResult> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: "https://hfdds.net",
        Referer: "https://hfdds.net/contact",
      },
      body: JSON.stringify({
        _subject: subject,
        _template: "table",
        _url: "https://hfdds.net/contact",
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
    const raw = await res.text();
    let parsed: { success?: string | boolean; message?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { channel: "formsubmit", ok: false, detail: `non-json ${res.status}: ${raw.slice(0, 200)}` };
    }
    const ok = parsed.success === true || parsed.success === "true";
    return {
      channel: "formsubmit",
      ok,
      detail: ok ? inbox : parsed.message || `status ${res.status}`,
    };
  } catch (err) {
    return { channel: "formsubmit", ok: false, detail: String(err) };
  }
}

async function sendViaWebhook(lead: Record<string, unknown>, primaryInbox: string, deliveries: DeliveryResult[]) {
  const webhook = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!webhook) return { channel: "webhook", ok: false, detail: "LEAD_WEBHOOK_URL not set" } as DeliveryResult;
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, notifyInbox: primaryInbox, deliveries }),
    });
    return {
      channel: "webhook",
      ok: res.ok,
      detail: res.ok ? undefined : `status ${res.status}`,
    } as DeliveryResult;
  } catch (err) {
    return { channel: "webhook", ok: false, detail: String(err) } as DeliveryResult;
  }
}

export async function deliverLeadEmail(lead: Record<string, unknown>, primaryInbox: string) {
  const subject = subjectFor(lead);
  const text = buildBody(lead);
  const recipients = notifyRecipients(primaryInbox);
  const deliveries: DeliveryResult[] = [];

  // Prefer transactional SMTP/Resend; never trust FormSubmit HTTP 200 alone.
  const smtp = await sendViaSmtp(lead, recipients, subject, text);
  deliveries.push(smtp);

  if (!smtp.ok) {
    const resend = await sendViaResend(lead, recipients, subject, text);
    deliveries.push(resend);
  }

  const anyTransactionalOk = deliveries.some((d) => d.ok && (d.channel === "smtp" || d.channel === "resend"));
  if (!anyTransactionalOk) {
    // Attempt FormSubmit to each recipient — usually needs Activate Form email first.
    for (const inbox of recipients) {
      deliveries.push(await sendViaFormSubmit(lead, inbox, subject));
    }
  }

  deliveries.push(await sendViaWebhook(lead, primaryInbox, deliveries));

  const emailDelivered = deliveries.some(
    (d) => d.ok && (d.channel === "smtp" || d.channel === "resend" || d.channel === "formsubmit"),
  );

  return { deliveries, emailDelivered, recipients };
}
