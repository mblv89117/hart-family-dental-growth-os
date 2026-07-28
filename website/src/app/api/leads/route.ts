import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { deliverLeadEmail } from "@/lib/lead-delivery";
import { ingestPublicLead } from "@/server/leads/ingest";
import { safeError, safeInfo } from "@/server/audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await ingestPublicLead(body, {
      userAgent: req.headers.get("user-agent") || undefined,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    if ("spam" in result && result.spam) {
      return NextResponse.json(result.payload);
    }

    const leadPayload = {
      id: result.lead!.id,
      receivedAt: result.lead!.receivedAt.toISOString(),
      owner: result.lead!.ownerName || "Wendy Delgado",
      formType: result.lead!.formType,
      name: result.lead!.name,
      phone: result.lead!.phone,
      email: result.lead!.email,
      location: result.location!.key,
      service: result.lead!.service || "",
      followUp: result.lead!.followUp || "",
      message: result.lead!.message || "",
      smsConsent: result.lead!.smsConsent,
      emailConsent: result.lead!.emailConsent,
    };

    // Preserve local JSONL append for backward compatibility during transition
    try {
      const dir = path.join(process.cwd(), "..", "data", "leads");
      await mkdir(dir, { recursive: true });
      await appendFile(
        path.join(dir, "leads.jsonl"),
        `${JSON.stringify({ ...leadPayload, notifyInbox: result.location!.leadNotifyEmail })}\n`,
        "utf8",
      );
    } catch (err) {
      safeError("[leads] local write failed", {
        error: err instanceof Error ? err.message : "unknown",
      });
    }

    let emailDelivered = false;
    let deliveries: Array<{ channel: string; ok: boolean; detail: string }> = [];
    let recipients: string[] = [result.location!.leadNotifyEmail];

    if (!("skipNotify" in result && result.skipNotify)) {
      const delivered = await deliverLeadEmail(leadPayload, result.location!.leadNotifyEmail);
      emailDelivered = delivered.emailDelivered;
      deliveries = delivered.deliveries.map((d) => ({
        channel: d.channel,
        ok: d.ok,
        detail: d.detail || "",
      }));
      recipients = delivered.recipients;
    }

    safeInfo("[HFD lead]", {
      id: result.lead!.id,
      location: result.location!.key,
      formType: result.lead!.formType,
      emailDelivered,
    });

    return NextResponse.json({
      ok: true,
      id: result.lead!.id,
      notifyInbox: result.location!.leadNotifyEmail,
      recipients,
      emailDelivered,
      deliveries,
    });
  } catch (err) {
    safeError("[leads] ingest failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
    // Fail closed for persistence errors without leaking internals
    return NextResponse.json(
      { ok: false, error: "Unable to accept lead right now. Please call the office." },
      { status: 503 },
    );
  }
}
