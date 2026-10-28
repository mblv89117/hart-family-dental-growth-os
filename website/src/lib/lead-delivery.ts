import nodemailer from "nodemailer";
import { leadOwner } from "@/lib/locations";
import { explicitOffice, postSignedHfdWebsiteLead } from "@/lib/hfd-lead-webhook";
import { safeError } from "@/server/logging";

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

export async function deliverLeadEmail(lead: Record<string, unknown>, primaryInbox: string) {
  const office = explicitOffice(lead.office ?? lead.location);
  if (!office) {
    safeError("[leads] delivery refused", { reason: "office_not_explicit" });
    return {
      deliveries: [{ channel: "hfd-website-lead", ok: false, detail: "office_not_explicit" }] as DeliveryResult[],
      emailDelivered: false,
      recipients: [] as string[],
    };
  }

  const subject = subjectFor(lead);
  const text = buildBody(lead);
  const recipients = notifyRecipients(primaryInbox);
  const deliveries: DeliveryResult[] = [];

  const smtp = await sendViaSmtp(lead, recipients, subject, text);
  deliveries.push(smtp);

  if (!smtp.ok) {
    const resend = await sendViaResend(lead, recipients, subject, text);
    deliveries.push(resend);
  }

  const emailDelivered = deliveries.some((d) => d.ok && (d.channel === "smtp" || d.channel === "resend"));
  if (!emailDelivered) {
    safeError("[leads] email delivery unavailable", {
      reason: "smtp_and_resend_not_delivered",
      location: office,
    });
    deliveries.push({
      channel: "email",
      ok: false,
      detail: "smtp_and_resend_unavailable",
    });
  }

  // Signed 360 Growth intake runs beside SMTP/Resend. A webhook failure does not
  // suppress an email that already succeeded, and email failure does not skip signing.
  const webhook = await postSignedHfdWebsiteLead(lead);
  deliveries.push(webhook);
  if (!webhook.ok) {
    safeError("[leads] signed website webhook not accepted", {
      reason: webhook.detail || "webhook_failed",
      location: office,
    });
  }

  return { deliveries, emailDelivered, recipients };
}
